/* Semantic guard for source formatting. The snapshot is local, not published. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const acorn = require('acorn'),
  parse5 = require('parse5'),
  postcss = require('postcss');
const selectors = require('postcss-selector-parser'),
  values = require('postcss-value-parser');
const { spawnSync } = require('node:child_process');
const target = process.env.PRESERVATION_FILE || '/tmp/cordel-source-preservation.json';
const skip = new Set(['.git', 'node_modules', 'dist', '__pycache__']);
const extensions = new Set([
  '.html',
  '.js',
  '.mjs',
  '.cjs',
  '.css',
  '.py',
  '.json',
  '.webmanifest',
  '.svg',
  '.webp',
  '.png',
  '.jpg',
  '.mp4',
  '.woff2',
  '.ttf',
]);
function files(dir = '.') {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) =>
      skip.has(e.name)
        ? []
        : e.isDirectory()
          ? files(path.join(dir, e.name))
          : extensions.has(path.extname(e.name))
            ? [path.join(dir, e.name)]
            : [],
    );
}
function strip(
  node,
  excluded = new Set([
    'parent',
    'start',
    'end',
    'raw',
    'source',
    'sourceIndex',
    'sourceEndIndex',
    '_quoteMark',
    'raws',
    'spaces',
    'quoteMark',
    'rawSpaceBefore',
    'rawSpaceAfter',
    'before',
    'after',
  ]),
) {
  if (Array.isArray(node)) return node.map((n) => strip(n, excluded));
  if (node && typeof node === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(node)) {
      if (!excluded.has(key)) result[key] = strip(value, excluded);
    }
    return result;
  }
  return node;
}
function javascript(text, module = false) {
  return strip(
    acorn.parse(text, {
      ecmaVersion: 'latest',
      sourceType: module ? 'module' : 'script',
      allowReturnOutsideFunction: true,
    }),
  );
}
function cssValue(value) {
  return values(value)
    .nodes.filter((n) => n.type !== 'space' && n.type !== 'comment')
    .map((n) => {
      const normalize = (v) => {
        const x = strip(v);
        if (x.nodes)
          x.nodes = x.nodes
            .filter((y) => y.type !== 'space' && y.type !== 'comment')
            .map(normalize);
        if (x.type === 'string') delete x.quote;
        if (x.type === 'word') x.value = x.value.replace(/^(-?)\.(\d)/, '$10.$2');
        if (x.type === 'word' && /^#[a-f0-9]+$/i.test(x.value)) x.value = x.value.toLowerCase();
        return x;
      };
      return normalize(n);
    });
}
function css(text) {
  const root = postcss.parse(text);
  function visit(node) {
    if (node.type === 'comment') return null;
    const x = { type: node.type };
    if (node.selector) x.selector = strip(selectors().astSync(node.selector));
    if (node.name) x.name = node.name;
    if (node.params) x.params = cssValue(node.params);
    if (node.prop) {
      x.prop = node.prop;
      x.value = cssValue(node.value);
      x.important = !!node.important;
    }
    if (node.nodes) x.nodes = node.nodes.map(visit).filter(Boolean);
    return x;
  }
  return visit(root);
}
function html(text) {
  const tree = parse5.parse(text);
  function visit(node, parent = '') {
    if (node.nodeName === '#comment') return null;
    if (node.nodeName === '#text') {
      if (parent === 'script') return { script: node.value };
      if (parent === 'style') return { css: css(node.value) };
      const value = ['pre', 'code', 'textarea'].includes(parent)
        ? node.value
        : node.value.replace(/\s+/g, ' ').trim();
      return value ? { text: value } : null;
    }
    const attrs = (node.attrs || []).map((a) => {
      let value = a.value;
      if (a.name === 'style') value = css('x{' + value + '}');
      else if (a.name.startsWith('on')) value = javascript(value);
      return [a.name, value];
    });
    const children = (node.childNodes || [])
      .map((n) => visit(n, node.tagName || parent))
      .filter(Boolean);
    if (node.tagName === 'script') {
      const type = (node.attrs || []).find((a) => a.name === 'type')?.value;
      for (const child of children)
        if (child.script !== undefined) {
          const body = child.script;
          delete child.script;
          child[type === 'application/json' ? 'json' : 'js'] =
            type === 'application/json' ? JSON.parse(body) : javascript(body, type === 'module');
        }
    }
    return {
      node: node.nodeName,
      attrs,
      children,
      content: node.content ? visit(node.content, parent) : null,
    };
  }
  return visit(tree);
}
function signature(file) {
  const ext = path.extname(file),
    buffer = fs.readFileSync(file),
    text = buffer.toString();
  let body;
  if (['.js', '.cjs', '.mjs'].includes(ext)) body = javascript(text, ext === '.mjs');
  else if (ext === '.css') body = css(text);
  else if (ext === '.html') body = html(text);
  else if (['.json', '.webmanifest'].includes(ext)) {
    const tokens = text.match(
      /"(?:\\.|[^"\\])*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null|[{}\[\],:]/g,
    );
    body = tokens;
  } else if (ext === '.py') {
    const result = spawnSync(
      'python3',
      [
        '-c',
        'import ast,sys;print(ast.dump(ast.parse(sys.stdin.read()),include_attributes=False))',
      ],
      { input: text, encoding: 'utf8' },
    );
    if (result.status !== 0) throw Error(result.stderr);
    body = result.stdout;
  } else return crypto.createHash('sha256').update(buffer).digest('hex');
  return crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex');
}
if (process.argv[2] === 'snapshot') {
  const record = {};
  for (const file of files()) record[file] = signature(file);
  fs.writeFileSync(target, JSON.stringify(record, null, 2));
  console.log('Snapshot:', Object.keys(record).length, 'files');
} else if (process.argv[2] === 'check') {
  const record = JSON.parse(fs.readFileSync(target));
  const errors = [];
  for (const [file, before] of Object.entries(record)) {
    if (!fs.existsSync(file)) errors.push(file + ': removed');
    else if (signature(file) !== before) errors.push(file + ': semantic/content difference');
  }
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }
  console.log(
    'Preservation verified:',
    Object.keys(record).length,
    'files; executable structure, content and binary assets preserved.',
  );
} else {
  console.error('Use snapshot or check');
  process.exit(2);
}
