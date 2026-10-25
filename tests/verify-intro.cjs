// Static opening contract checks. Run: node tests/verify-intro.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const home = read('index.html'),
  script = read('assets/book-intro.js'),
  style = read('assets/book-intro.css'),
  sw = read('sw.js');
new Function(script);
new Function(sw);
assert.equal((home.match(/id="brand-intro"/g) || []).length, 1, 'one opening overlay');
assert.equal((home.match(/class="approved-intro-video"/g) || []).length, 1, 'one native video');
assert.ok(!home.includes('approved-intro-canvas'), 'manual canvas removed');
assert.ok(home.includes('class="intro-end-logo"'), 'bridge uses the existing hero logo');
assert.ok(script.includes("video.addEventListener('ended'"), 'playback completes');
assert.ok(script.includes("video.addEventListener('error'"), 'media errors recover');
assert.ok(script.includes('window.scrollY > 24'), 'late video must not interrupt navigation');
assert.ok(script.includes("skip.addEventListener('click'"), 'skip button works');
assert.ok(!script.includes("event.key === 'Tab'"), 'tab never skips the opening');
assert.ok(
  script.includes('window.CordelAccess?.reduced()'),
  'respects stored accessibility settings',
);
assert.ok(script.includes('event.persisted'), 'BFCache restore is safe');
assert.ok(/prefers-reduced-motion:\s*reduce/.test(style), 'honors OS reduced-motion setting');
assert.ok(/max-width:\s*650px/.test(style), 'mobile stage fits in viewport');
assert.match(
  sw,
  /const\s+CACHE\s*=\s*['"]cordel-varal-v[0-9]+(?:-[a-z0-9]+)*['"]/,
  'valid versioned PWA cache',
);
assert.ok(fs.existsSync(path.join(root, 'assets/intro/cordel-abertura-v07-livro-aberto.mp4')));
assert.equal(
  (home.match(/<a\s+class="tile category-/g) || []).length,
  118,
  'periodic elements preserved',
);
console.log(
  'PASS: native video, transitions, accessible skip, responsive stage, PWA and 118 elements',
);

assert.ok(
  home.includes('poster="assets/intro/cordel-abertura-v07-poster.webp"'),
  'starts on open book',
);
assert.ok(!home.includes('cordel-abertura-v06-web.mp4'), 'old opening is not played');
