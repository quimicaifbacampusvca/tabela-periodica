'use strict';
// Event harness, not a layout engine or a browser-compatibility claim.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const model = require('../assets/element-model.js');
const root = path.join(__dirname, '..');
const all = JSON.parse(fs.readFileSync(path.join(root, 'assets/elementos-fichas.json'), 'utf8'));
const source = fs.readFileSync(path.join(root, 'assets/element-page.js'), 'utf8');
const tick = () => new Promise((resolve) => setImmediate(resolve));

class Node {
  constructor(tag, attrs = {}) {
    this.tag = tag;
    this.attrs = attrs;
    this.dataset = {};
    this.hidden = 'hidden' in attrs;
    this.open = 'open' in attrs;
    this.style = {};
    this.handlers = {};
    this.textContent = '';
    this.value = attrs.value || '';
    this.parentElement = { hidden: false };
    this.href = attrs.href || '';
    for (const [key, value] of Object.entries(attrs))
      if (key.startsWith('data-'))
        this.dataset[key.slice(5).replace(/-([a-z])/g, (_, l) => l.toUpperCase())] = value;
  }
  addEventListener(name, callback) {
    (this.handlers[name] ??= []).push(callback);
  }
  async fire(name) {
    for (const callback of this.handlers[name] || []) await callback({ target: this });
  }
  setAttribute(key, value) {
    this.attrs[key] = value;
  }
  getAttribute(key) {
    return this.attrs[key] ?? null;
  }
  removeAttribute(key) {
    delete this.attrs[key];
  }
  focus() {
    this.focused = true;
  }
  select() {
    this.selected = true;
  }
}
async function setup(z, { fetchFailure = false, copyFailure = false } = {}) {
  const current = all[z - 1];
  const html = fs.readFileSync(path.join(root, 'elementos', current.slug, 'index.html'), 'utf8');
  const nodes = [];
  for (const match of html.matchAll(/<([a-z][\w:-]*)([^<>]*?)>/gi)) {
    const attrs = {};
    for (const a of match[2].matchAll(/([:\w-]+)(?:="([^"]*)"|'([^']*)')?/g))
      attrs[a[1]] = a[2] ?? a[3] ?? '';
    nodes.push(new Node(match[1], attrs));
  }
  const ids = new Map(nodes.filter((n) => n.attrs.id).map((n) => [n.attrs.id, n]));
  ids.get('element-data').textContent = html.match(
    /<script type="application\/json" id="element-data">([\s\S]*?)<\/script>/,
  )[1];
  ids.get('compare-element').value = html.match(/<option value="(\d+)" selected>/)[1];
  ids.get('compare-property').value = 'radius';
  ids.get('temperature-unit').value = 'C';
  ids.get('energy-unit').value = 'eV';
  const queries = {
    '[data-enhance]': nodes.filter((n) => 'data-enhance' in n.attrs),
    '[data-shell]': nodes.filter((n) => 'data-shell' in n.attrs),
    '[data-property]': nodes.filter((n) => 'data-property' in n.attrs),
    'main details': nodes.filter((n) => n.tag === 'details'),
    '.ep-section': nodes.filter((n) => (n.attrs.class || '').split(' ').includes('ep-section')),
    '.ep-chapters a[href^="#"]': nodes.filter(
      (n) => n.tag === 'a' && (n.attrs.href || '').startsWith('#'),
    ),
  };
  let fetchedURL,
    copied,
    printCalls = 0;
  const events = {};
  const context = {
    URL,
    console,
    CordelElementModel: model,
    document: {
      currentScript: { src: 'https://example.org/tabela-periodica/assets/element-page.js' },
      getElementById: (id) => ids.get(id),
      querySelectorAll: (selector) => {
        assert(selector in queries, selector);
        return queries[selector];
      },
    },
    location: {
      href: `https://example.org/tabela-periodica/elementos/${current.slug}/?source=qr#atomo`,
    },
    navigator: {
      clipboard: {
        writeText: async (text) => {
          if (copyFailure) throw new Error('Denied');
          copied = text;
        },
      },
    },
    fetch: async (url) => {
      fetchedURL = String(url);
      if (fetchFailure) throw new Error('Offline miss');
      return { ok: true, json: async () => all };
    },
    addEventListener: (event, callback) => {
      events[event] = callback;
    },
    print: () => {
      printCalls++;
      events.beforeprint?.();
    },
  };
  context.window = context;
  vm.runInNewContext(source, context, { filename: 'element-page.js' });
  await tick();
  await tick();
  return {
    ids,
    queries,
    events,
    current,
    get fetchedURL() {
      return fetchedURL;
    },
    get copied() {
      return copied;
    },
    get printCalls() {
      return printCalls;
    },
  };
}
(async () => {
  for (const z of [1, 2, 29, 46, 57, 87, 103, 118]) {
    const app = await setup(z);
    assert.equal(
      app.fetchedURL,
      'https://example.org/tabela-periodica/assets/elementos-fichas.json',
    );
    assert(app.queries['[data-enhance]'].every((node) => !node.hidden));
    assert(!app.ids.get('comparison-controls').hidden);
    const last = app.queries['[data-shell]'].at(-1);
    await last.fire('click');
    assert.equal(last.getAttribute('aria-pressed'), 'true');
    assert.equal(
      app.queries['[data-shell]'].filter((n) => n.getAttribute('aria-pressed') === 'true').length,
      1,
    );
    assert(app.ids.get('shell-detail').textContent.includes(app.current.shells.at(-1).sublevels));
    app.ids.get('temperature-unit').value = 'K';
    await app.ids.get('temperature-unit').fire('change');
    const fusion = app.queries['[data-property]'].find((n) => n.dataset.property === 'fusion');
    assert.equal(
      fusion.textContent,
      model.display(app.current, 'fusion', { temperature: 'K', energy: 'eV' }),
    );
    app.ids.get('energy-unit').value = 'kJ';
    await app.ids.get('energy-unit').fire('change');
    assert.equal(
      app.queries['[data-property]'].find((n) => n.dataset.property === 'ei').textContent,
      model.display(app.current, 'ei', { temperature: 'K', energy: 'kJ' }),
    );
    app.ids.get('compare-element').value = String(z === 2 ? 1 : 2);
    await app.ids.get('compare-element').fire('change');
    assert(app.ids.get('comparison-link').href.includes(z === 2 ? 'hidrogenio' : 'helio'));
    if (z === 29)
      assert(app.ids.get('comparison-bar-a').parentElement.hidden, 'Mixed radius definitions');
    await app.ids.get('copy-element').fire('click');
    assert.equal(app.copied, `https://example.org/tabela-periodica/elementos/${app.current.slug}/`);
    const before = app.queries['main details'].map((n) => n.open);
    await app.ids.get('print-element').fire('click');
    assert.equal(app.printCalls, 1);
    assert(app.queries['main details'].every((n) => n.open));
    app.events.afterprint();
    assert.deepEqual(
      app.queries['main details'].map((n) => n.open),
      before,
    );
  }
  const failed = await setup(29, { fetchFailure: true, copyFailure: true });
  assert(failed.ids.get('comparison-controls').hidden);
  assert(failed.ids.get('comparison-fallback').textContent.includes('não pôde carregar'));
  await failed.ids.get('copy-element').fire('click');
  assert(
    !failed.ids.get('share-fallback').hidden &&
      failed.ids.get('element-url').focused &&
      failed.ids.get('element-url').selected,
  );
  assert.equal(
    failed.ids.get('element-url').value,
    'https://example.org/tabela-periodica/elementos/cobre/',
  );
  await failed.queries['[data-shell]'].at(-1).fire('click');
  assert(
    failed.ids.get('shell-detail').textContent.includes('4s¹'),
    'Atom works when comparison data fails',
  );
  console.log(
    'PASS: eventos de camadas, unidades, comparador, impressão e link em oito elementos; falhas de rede e permissão.',
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
