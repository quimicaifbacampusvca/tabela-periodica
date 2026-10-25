const playwright = require('playwright');
const engine = process.env.BROWSER_ENGINE || 'chromium';
const output = process.env.COMPAT_HOME_DIR || 'dist/home-review';
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  const browser = await playwright[engine].launch({
    ...(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {}),
    ...(process.env.BROWSER_EXECUTABLE
      ? {
          executablePath: process.env.BROWSER_EXECUTABLE,
          args: JSON.parse(process.env.BROWSER_ARGS || '[]'),
        }
      : {}),
  });
  fs.mkdirSync(output, { recursive: true });
  try {
    for (const width of [320, 390, 650, 800, 1440]) {
      const page = await browser.newPage({
        viewport: { width, height: 900 },
        reducedMotion: 'reduce',
      });
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      await page.goto('http://127.0.0.1:8765/', { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator('a.tile').count(), 118);
      assert.equal(await page.locator('.hq-open,#hq-edition,#hq-radius-data').count(), 0);
      assert.equal(
        await page.locator('script[src*="hq-layout"],link[href*="hq-layout"]').count(),
        0,
      );
      assert(
        await page
          .locator('.periodic-legend-ifba-mark')
          .evaluate((e) => e.parentElement.tagName !== 'BUTTON'),
      );

      for (const z of [85, 87, 100, 101, 102, 103]) {
        const tile = page.locator('a.tile[data-search^="' + z + ' "]');
        assert.equal(await tile.locator('.folio-state strong').textContent(), 'Sólido');
        assert(
          (await tile.locator('.folio-state-icon').getAttribute('src')).includes('estado_solido_'),
        );
      }
      assert.equal(await page.locator('#count').count(), 0);
      assert.equal(await page.getByText('Conheça o cobre', { exact: false }).count(), 0);
      assert.equal(await page.locator('.discovery-strip').count(), 0);
      assert.equal(await page.locator('header nav>a').count(), 0);
      assert.equal(await page.locator('.grid.periodic').count(), 0);
      await page.locator('#search').fill('cobre');
      assert.equal(await page.locator('a.tile:visible').count(), 1);
      await page.locator('#search').fill('xyz-inexistente');
      assert(await page.locator('#empty').isVisible());
      await page.locator('#search').fill('');
      assert(!(await page.locator('#category').isVisible()));
      await page.locator('#catalog-filters>summary').click();
      await page.locator('#category').selectOption({ label: 'Halogênio' });
      assert.equal(await page.locator('a.tile:visible').count(), 6);
      await page.locator('[data-view=periodic]').click();
      assert.equal(await page.locator('a.tile:visible').count(), 118);
      assert.equal(await page.locator('a.tile:not(.unmatched)').count(), 6);
      const liquid = page.locator('.periodic-legend-states button[data-state="Líquido"]');
      await liquid.click();
      assert.equal(await page.locator('a.tile:not(.unmatched)').count(), 1);
      assert.equal(await page.locator('a.tile:not(.unmatched) .symbol').textContent(), 'Br');
      assert.equal(await liquid.getAttribute('aria-pressed'), 'true');
      await page.locator('.legend-category[data-category="Gás nobre"] button').click();
      assert.equal(await page.locator('a.tile:not(.unmatched)').count(), 0);
      assert(await page.locator('#empty').isVisible());
      await liquid.click();
      assert.equal(await page.locator('a.tile:not(.unmatched)').count(), 7);
      await page.locator('.legend-category[data-category="Gás nobre"] button').click();
      assert.equal(await page.locator('a.tile:not(.unmatched)').count(), 118);
      assert.equal(await page.locator('#category').inputValue(), '');
      const legend = page.locator('.periodic-central-legend');
      await page.waitForFunction(
        () => document.querySelectorAll('.card-map-lines path').length === 5,
      );
      assert.equal(await legend.locator('.card-map-label').count(), 5);
      assert.equal(await legend.locator('.legend-reading dl').count(), 0);
      const mapFits = await legend.locator('.legend-card-map').evaluate((map) => {
        const box = map.getBoundingClientRect();
        return [...map.querySelectorAll('.card-map-label,.legend-example')].every((el) => {
          const r = el.getBoundingClientRect();
          return (
            r.left >= box.left - 1 &&
            r.right <= box.right + 1 &&
            r.top >= box.top - 1 &&
            r.bottom <= box.bottom + 1
          );
        });
      });
      assert(mapFits, 'card annotations fit the map at ' + width);

      const layout = await legend.evaluate((el) => {
        const list = el.querySelector('.periodic-legend-categories');
        return {
          columns: getComputedStyle(list).gridTemplateColumns.split(' ').length,
          overflow: el.scrollHeight > el.clientHeight + 2,
        };
      });
      assert.equal(layout.columns, 2);
      assert.equal(layout.overflow, false, `legend overflow at ${width}`);
      await legend.screenshot({ path: `${output}/legend-${width}.png` });
      await page.locator('[data-view=collection]').click();
      await page.locator('#category').selectOption('');
      await page.locator('#catalog-filters>summary').click();
      await page.locator('#home-menu>summary').click();
      await page.locator('#home-menu .install-open').click();
      assert(await page.locator('#install-dialog').isVisible());
      await page.locator('#install-close').click();
      assert(
        await page.locator('#home-menu>summary').evaluate((e) => document.activeElement === e),
      );
      await page.locator('#home-menu>summary').click();
      await page.locator('#appearance-open').click();
      assert(await page.locator('#appearance').isVisible());
      await page.locator('#appearance-close').click();
      assert(
        await page.locator('#home-menu>summary').evaluate((e) => document.activeElement === e),
      );
      await page.locator('#home-menu .install-open').evaluate((e) => (e.hidden = true));
      assert(await page.locator('#home-menu>summary').isVisible());
      assert.equal(
        await page.locator('footer a[href="mailto:202411320020@ifba.edu.br"]').count(),
        1,
      );
      for (const scale of [1, 2]) {
        await page.evaluate(
          (scale) => document.documentElement.style.setProperty('--scale', scale),
          scale,
        );
        const size = await page.evaluate(() => ({
          scroll: document.documentElement.scrollWidth,
          client: document.documentElement.clientWidth,
        }));
        assert(
          size.scroll <= size.client + 2,
          `${width}px / ${scale}: page overflow ${JSON.stringify(size)}`,
        );
      }
      await page.evaluate(() => document.documentElement.style.setProperty('--scale', '1'));
      await page.screenshot({ path: `${output}/home-${width}.png`, fullPage: false });
      await page.locator('#colecao').scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${output}/catalog-${width}.png` });
      assert.deepEqual(errors, []);
      await page.close();
    }

    // Both ends of the 118-element pool: ordinary mass and isotope notation.
    for (const random of [0, 0.999999]) {
      const demo = await browser.newPage({
        viewport: { width: 1440, height: 900 },
        reducedMotion: 'reduce',
      });
      await demo.addInitScript((value) => {
        Math.random = () => value;
      }, random);
      await demo.goto('http://127.0.0.1:8765/', { waitUntil: 'networkidle' });
      await demo.locator('[data-view=periodic]').click();
      const sample = demo.locator('.legend-example');
      await demo.waitForFunction(() => !!document.querySelector('.legend-example').dataset.element);
      assert.equal(await sample.getAttribute('data-element'), random === 0 ? '1' : '118');
      const z = await sample.getAttribute('data-element');
      const tile = demo.locator('a.tile[data-search^="' + z + ' "]');
      for (const [example, source] of [
        ['.example-number', '.z'],
        ['.example-symbol', '.symbol'],
        ['.example-name', '.name'],
        ['.example-mass', '.folio-mass'],
      ]) {
        assert.equal(
          (await sample.locator(example).textContent()).trim(),
          (await tile.locator(source).textContent()).trim(),
        );
      }
      assert.equal(
        await sample.locator('img').getAttribute('src'),
        await tile.locator('.folio-state-icon').evaluate((img) => img.src),
      );
      assert(
        (await demo.locator('.map-mass').textContent()).includes(
          random === 0 ? 'atômica' : 'massa [A]',
        ),
      );
      await demo.locator('[data-view=collection]').click();
      await demo.locator('[data-view=periodic]').click();
      await demo.waitForFunction(
        (previous) => document.querySelector('.legend-example').dataset.element !== previous,
        z,
      );
      assert.notEqual(await sample.getAttribute('data-element'), z, 'new example on re-entry');
      await demo.close();
    }
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto('http://127.0.0.1:8765/');
    const video = page.locator('.approved-intro-video');
    await page.waitForFunction(
      () => {
        const video = document.querySelector('video'),
          intro = document.querySelector('#brand-intro');
        return video.readyState >= 2 || (intro.hidden && !document.querySelector('main').inert);
      },
      null,
      { timeout: 15000 },
    );
    const duration = await video.evaluate((v) => v.duration);
    if (Number.isFinite(duration))
      assert(duration > 5.7 && duration < 6, 'opening contains only the retained sequence');
    if (await page.locator('#intro-skip').isVisible()) await page.locator('#intro-skip').click();
    await page.waitForFunction(() => document.querySelector('#brand-intro').hidden);
    assert(!(await page.locator('main').evaluate((e) => e.inert)));
    await page.close();
  } finally {
    await browser.close();
  }
  console.log(
    'PASS: mobile/desktop, 118 elements, search, filters, modes, menu, font scaling and trimmed intro.',
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
