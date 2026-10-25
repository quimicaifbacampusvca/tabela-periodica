/* Shared header contract and real interactions, including narrow screens. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');
const base = process.env.SITE_BASE || 'http://127.0.0.1:8765';
(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.BROWSER_EXECUTABLE
      ? {
          executablePath: process.env.BROWSER_EXECUTABLE,
          args: JSON.parse(process.env.BROWSER_ARGS || '[]'),
        }
      : {}),
  });
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  fs.mkdirSync('dist/element-menu', { recursive: true });
  try {
    const models = JSON.parse(fs.readFileSync('assets/elementos-fichas.json'));
    for (const m of models) {
      await page.goto(base + '/elementos/' + m.slug + '/');
      assert.equal(await page.locator('header details.home-menu').count(), 1, m.slug);
      assert.equal(await page.locator('header nav > a,header nav > button').count(), 0, m.slug);
      assert.equal(await page.locator('header .install-open').count(), 1, m.slug);
      assert.equal(await page.locator('header #appearance-open').count(), 1, m.slug);
      assert.equal(await page.locator('header summary').textContent(), 'Menu', m.slug);
      assert.equal(
        await page.locator('header .home-menu-panel a').getAttribute('href'),
        '../../index.html#colecao',
      );
      assert.equal(await page.locator('script[src="../../assets/home.js"]').count(), 1, m.slug);
    }
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(base + '/elementos/ferro/');
      const menu = page.locator('#home-menu');
      await menu.locator('summary').click();
      assert((await menu.getAttribute('open')) !== null);
      const box = await page.locator('.home-menu-panel').boundingBox();
      assert(box.x >= -1 && box.x + box.width <= width + 1, JSON.stringify(box));
      await page.keyboard.press('Escape');
      assert.equal(await menu.getAttribute('open'), null);
      await page.waitForFunction(
        () => document.querySelector('#home-menu > summary') === document.activeElement,
      );
      await menu.locator('summary').click();
      await page.locator('#appearance-open').click();
      assert(await page.locator('#appearance').evaluate((n) => n.open));
      assert.equal(await menu.getAttribute('open'), null);
      await page.locator('#appearance-close').click();
      await page.waitForFunction(
        () => document.querySelector('#home-menu > summary') === document.activeElement,
      );
      await menu.locator('summary').click();
      await page.locator('#home-menu .install-open').click();
      assert(await page.locator('#install-dialog').evaluate((n) => n.open));
      await page.locator('#install-close').click();
      await page.waitForFunction(
        () => document.querySelector('#home-menu > summary') === document.activeElement,
      );
      await menu.locator('summary').click();
      await page.locator('h1').first().click();
      assert.equal(await menu.getAttribute('open'), null);
      await menu.locator('summary').click();
      await page.screenshot({ path: 'dist/element-menu/' + width + '.png' });
    }
    console.log(
      'PASS: menu único nas 118 fichas; navegação, diálogos, foco, Escape e clique externo em 320/390/768/1440px.',
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
