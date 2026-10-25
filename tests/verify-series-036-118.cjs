const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');
(async () => {
  const manifest = JSON.parse(fs.readFileSync('data/folhetos-impressao-manifesto.json'));
  const browser = await chromium.launch({ headless: true });
  const result = [];
  fs.mkdirSync('dist/series-review', { recursive: true });
  try {
    for (const e of manifest.elements.filter((e) => e.z === 33 || e.z >= 36)) {
      assert(e.panels.every((p) => p.status === 'aprovada' && fs.existsSync(p.image)));
      const page = await browser.newPage();
      await page.goto('http://127.0.0.1:8765/elementos/' + e.slug + '/', { waitUntil: 'load' });
      await page.waitForSelector('.ep-print-approved-series', { state: 'attached' });
      await page.emulateMedia({ media: 'print' });
      const info = await page.evaluate(() => {
        const s = document.querySelector('.ep-print-sheet');
        const box = (n) => {
          const b = n.getBoundingClientRect();
          return { x: b.x, y: b.y, w: b.width, h: b.height, bottom: b.bottom };
        };
        return {
          sheet: box(s),
          panels: [...s.querySelectorAll('.ep-print-story')].map((p) => {
            const a = p.querySelector('.ep-print-story-art'),
              i = a.querySelector('img');
            return {
              panel: box(p),
              art: box(a),
              natural: [i.naturalWidth, i.naturalHeight],
              fit: getComputedStyle(i).objectFit,
              heading: getComputedStyle(p.querySelector('h2')).display,
              text: getComputedStyle(p.querySelector('p')).display,
            };
          }),
        };
      });
      assert.equal(info.panels.length, 2);
      for (const p of info.panels) {
        assert.deepEqual(p.natural, [1104, 810]);
        assert.equal(p.fit, 'contain');
        assert.equal(p.heading, 'none');
        assert.equal(p.text, 'none');
        assert(Math.abs(p.art.w / p.art.h - 1104 / 810) < 0.008);
        assert(p.art.bottom <= info.sheet.bottom + 1);
      }
      await page.pdf({
        path: 'dist/series-review/' + String(e.z).padStart(3, '0') + '.pdf',
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
      });
      if ([33, 36, 51, 59, 90, 91, 118].includes(e.z))
        await page
          .locator('.ep-print-sheet')
          .screenshot({ path: 'dist/series-review/' + e.z + '.png' });
      result.push({ z: e.z, ...info });
      await page.close();
    }
  } finally {
    await browser.close();
  }
  fs.writeFileSync('dist/series-review/report.json', JSON.stringify(result, null, 2));
  assert.equal(result.length, 84);
  console.log(
    '84 folhetos / 168 imagens: dimensões, proporção, carregamento e impressão verificados.',
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
