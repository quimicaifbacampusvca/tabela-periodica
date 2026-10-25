// Contract checks for the static periodic-table PWA. Run: node tests/verify-periodic.mjs
// This is a structural regression test, not a browser-layout certification.
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const load = (name) => readFileSync(resolve(root, name), 'utf8');
const html = load('index.html');
const css = load('assets/cordel-collection.css')
  .replace(/\s*([:{};,])\s*/g, '$1')
  .replace(/@media\s+\(/g, '@media(');
const js = load('assets/cordel-collection.js');
const sw = load('sw.js');
new Function(js);
new Function(sw);
const tiles = [
  ...html.matchAll(
    /<a\s+class="tile category-[^"]+"[\s\S]*?style="--col:\s*(\d+);\s*--row:\s*(\d+);?"[\s\S]*?data-category="([^"]+)"/g,
  ),
];
assert.equal(tiles.length, 118, '118 chemical element positions must remain present');
const positions = new Set(tiles.map((t) => t[1] + ',' + t[2]));
assert.equal(positions.size, 118, 'a periodic cell position must not be duplicated');
assert.equal(new Set(tiles.map((t) => t[3])).size, 10, 'ten chemical categories');
assert.equal(
  (html.match(/class="folio-mass folio-decoration"/g) || []).length,
  118,
  '118 scientific masses',
);
assert.equal((js.match(/class="legend-category"/g) || []).length, 10, 'ten legend categories');
assert.equal(
  (js.match(/<li><img src="assets\/colecao\/estado_/g) || []).length,
  4,
  'four physical states',
);
assert.match(
  css,
  /grid-column:5\s*\/\s*13;grid-row:2\s*\/\s*5/,
  'legend occupies groups 4–11, periods 1–3',
);
assert.match(css, /margin-top:-6px/, 'legend top follows the single rope');
assert.match(css, /periodic-legend-ifba-mark/, 'IFBA mark is present');
assert.match(js, /Campus Vitória da Conquista/, 'campus name is intact');
assert.match(
  css,
  /periodic-legend-credit-copy span\{\s*white-space:nowrap/,
  'campus label does not wrap',
);
assert.match(js, /const amplitude = periodic \? 0?\.75/, 'periodic breeze remains less intense');
assert.match(js, /motionPreference\.matches/, 'respect reduced-motion preference');
assert.match(sw, /LIVE_ASSETS\.has\(localPath\)/, 'critical assets are revalidated online');
assert.match(
  sw,
  /cache\.match\(req,\s*\{\s*ignoreSearch:\s*true\s*\}\)\)??\s*\|\|\s*Response\.error\(\)/,
  'critical assets fall back offline',
);
const match = sw.match(/const\s+FILES\s*=\s*(\[[\s\S]*?\]);/);
assert.ok(match, 'precache file list exists');
const cached = JSON.parse(match[1]);
const missing = cached.filter((p) => p !== './' && !existsSync(resolve(root, p)));
assert.deepEqual(missing, [], 'all precache paths exist in repository');
console.log(
  'PASS: 118 elements, ten categories, four states, legend, cord, reduced motion and PWA asset cache',
);
