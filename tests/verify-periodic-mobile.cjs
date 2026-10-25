// Responsive periodic-table contract checks. Run: node tests/verify-periodic-mobile.cjs
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const ROOT = resolve(__dirname, '..');
const load = (path) => readFileSync(resolve(ROOT, path), 'utf8');
const html = load('index.html');
const css = load('assets/cordel-collection.css')
  .replace(/\s*([:{};,])\s*/g, '$1')
  .replace(/@media\s+\(/g, '@media(');
const sw = load('sw.js');

const allTiles = [
  ...html.matchAll(
    /<a\s+class="tile category-[^"]+"[\s\S]*?<span class="name">([^<]+)<\/span\s*>\s*<span class="folio-mass folio-decoration">([^<]+)<\/span\s*>/g,
  ),
];
assert.equal(allTiles.length, 118, 'all 118 element cards must be present');
assert.equal(
  new Set(
    [
      ...html.matchAll(
        /<a\s+class="tile category-[^"]+"[^>]+style="--col:\s*(\d+);\s*--row:\s*(\d+);?"/g,
      ),
    ].map((m) => m[1] + ',' + m[2]),
  ).size,
  118,
  'all 118 periodic positions must be distinct',
);
assert.equal(
  allTiles.every(
    ([, name, mass]) => name.replace(/\u00ad/g, '').trim().length > 0 && mass.trim().length > 0,
  ),
  true,
  'all card names and masses must remain complete',
);
assert.match(
  html,
  /18 grupos · 7 períodos\. Deslize para explorar\./,
  'compact orientation should be present',
);
assert.match(
  css,
  /@media\(max-width:950px\)\{[\s\S]*?--periodic-cell-min:6\.8rem/,
  'mobile/tablet cards need additional horizontal space',
);
assert.match(
  css,
  /\.grid\.cordel-collection\.periodic \.tile \.name\{[\s\S]*?white-space:nowrap;[\s\S]*?hyphens:none/,
  'mobile/tablet names must not wrap',
);
assert.match(
  css,
  /\.grid\.cordel-collection\.periodic \.tile \.folio-mass\{[\s\S]*?overflow:visible;[\s\S]*?text-overflow:clip/,
  'mobile/tablet mass values must not truncate',
);
assert.match(
  css,
  /\.letter-spacing \.grid\.cordel-collection\.periodic\{[\s\S]*?--periodic-cell-min:7\.7rem/,
  'letter-spacing preferences must have a wider grid',
);
assert.match(
  css,
  /\.catalog-viewport\{[\s\S]*?overflow-x:auto/,
  'horizontal scroll must be retained',
);
assert.ok(
  !html.includes(
    'Role a tabela horizontalmente; os resultados da busca permanecem em sua posição.',
  ),
  'old lengthy mobile message removed',
);
assert.match(
  sw,
  /const\s+CACHE\s*=\s*['"]cordel-varal-v[0-9]+(?:-[a-z0-9]+)*['"]/,
  'PWA cache must use a versioned identifier',
);
console.log(
  'PASS: 118 positions, names, scientific masses, readable mobile widths, scroll, accessibility and PWA.',
);
