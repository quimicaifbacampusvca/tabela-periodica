/* Executed against exact installed versions; WebKit is not branded Safari. */
const pw = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const engine = process.env.BROWSER_ENGINE || 'chromium',
  channel = process.env.BROWSER_CHANNEL;
const id = process.env.COMPAT_ID || engine,
  dir = path.join('dist', 'compatibility', id);
const base = process.env.SITE_BASE || 'http://127.0.0.1:8765';
fs.mkdirSync(dir, { recursive: true });
const report = {
  id,
  engine,
  channel: channel || null,
  platform: process.platform,
  playwright: require('playwright/package.json').version,
  started: new Date().toISOString(),
  cases: [],
  limitations: [
    'Mobile viewports are emulated; no physical iOS/Android device.',
    'WebKit and Firefox Playwright builds are automation builds.',
    'Native browser install/share UI and external VLibras translation are not homologated by these tests.',
  ],
};
let browser;
async function record(name, fn) {
  const start = Date.now();
  try {
    const details = await fn();
    report.cases.push({ name, status: 'passed', ms: Date.now() - start, details });
  } catch (e) {
    report.cases.push({
      name,
      status: 'failed',
      ms: Date.now() - start,
      error: e.stack || String(e),
    });
  }
  fs.writeFileSync(path.join(dir, 'report.json'), JSON.stringify(report, null, 2));
}
function noOverflow(page) {
  return page
    .evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }))
    .then((s) => assert(s.scroll <= s.client + 2, JSON.stringify(s)));
}
async function context(options = {}) {
  return browser.newContext({ reducedMotion: 'reduce', ...options });
}
(async () => {
  try {
    browser = await pw[engine].launch({
      ...(channel ? { channel } : {}),
      ...(process.env.BROWSER_EXECUTABLE
        ? {
            executablePath: process.env.BROWSER_EXECUTABLE,
            args: JSON.parse(process.env.BROWSER_ARGS || '[]'),
          }
        : {}),
    });
    report.version = browser.version();
    const probe = await browser.newPage();
    await probe.goto(base);
    report.userAgent = await probe.evaluate(() => navigator.userAgent);
    report.features = await probe.evaluate(() => ({
      dialog:
        typeof HTMLDialogElement !== 'undefined' &&
        typeof HTMLDialogElement.prototype.showModal === 'function',
      inert: 'inert' in HTMLElement.prototype,
      resizeObserver: 'ResizeObserver' in window,
      arrayAt: typeof Array.prototype.at === 'function',
      containerQueries: CSS.supports('container-type', 'inline-size'),
      colorMix: CSS.supports('color', 'color-mix(in srgb, red, blue)'),
      webp: [...document.images].some((i) => i.currentSrc.endsWith('.webp') && i.naturalWidth > 0),
      serviceWorker: 'serviceWorker' in navigator,
      videoMP4: document.createElement('video').canPlayType('video/mp4; codecs="avc1.42E01E"'),
    }));
    await probe.close();
    await record(
      'Página inicial: cinco larguras, filtros combinados, legenda, diálogos, foco, escala e abertura',
      async () => {
        const result = spawnSync(process.execPath, ['tests/verify-home-mobile.cjs'], {
          env: { ...process.env, COMPAT_HOME_DIR: path.join(dir, 'home') },
          encoding: 'utf8',
          timeout: 240000,
        });
        fs.writeFileSync(
          path.join(dir, 'homepage.log'),
          (result.stdout || '') + (result.stderr || ''),
        );
        assert.equal(result.status, 0, (result.stderr || '').slice(-4000));
        return '320,390,650,800,1440px; scales 1 and 2; video playback or graceful fallback';
      },
    );
    await record('Acessibilidade: preferências reais, persistência e paletas', async () => {
      const c = await context();
      const p = await c.newPage();
      try {
        await p.goto(base, { waitUntil: 'networkidle' });
        await p.locator('#home-menu>summary').click();
        await p.locator('#appearance-open').click();
        await p.locator('#access-dark').check();
        await p.locator('#access-palette').selectOption('mono');
        await p.locator('#font-plus').click();
        await p.locator('#font-plus').click();
        await p.locator('#appearance-close').click();
        await p.reload({ waitUntil: 'networkidle' });
        assert.equal(await p.locator('body').getAttribute('data-theme'), 'dark');
        assert.equal(await p.locator('body').getAttribute('data-palette'), 'mono');
        assert.equal(await p.evaluate(() => window.CordelAccess.state.scale), 1.2);
        await p.locator('#home-menu>summary').click();
        await p.locator('#appearance-open').click();
        await p.locator('#access-contrast').check();
        await p.locator('#appearance-close').click();
        assert.equal(await p.locator('body').getAttribute('data-theme'), 'contrast');
        await p.locator('[data-view=periodic]').click();
        await noOverflow(p);
      } finally {
        await c.close();
      }
    });
    await record('Armazenamento local bloqueado: inicialização tolerante', async () => {
      const c = await context();
      await c.addInitScript(() => {
        Storage.prototype.getItem = function () {
          throw new Error('Storage blocked');
        };
        Storage.prototype.setItem = function () {
          throw new Error('Storage blocked');
        };
      });
      const p = await c.newPage();
      try {
        await p.goto(base, { waitUntil: 'networkidle' });
        assert.equal(await p.locator('a.tile').count(), 118);
        assert(await p.evaluate(() => !!window.CordelAccess));
        await p.locator('#search').fill('francio');
        assert.equal(await p.locator('a.tile:visible').count(), 1);
      } finally {
        await c.close();
      }
    });
    await record('Sem JavaScript: catálogo e conteúdo científico estático', async () => {
      const c = await context({ javaScriptEnabled: false });
      const p = await c.newPage();
      try {
        await p.goto(base);
        assert.equal(await p.locator('a.tile').count(), 118);
        await p.goto(base + '/elementos/ferro/');
        assert((await p.locator('body').textContent()).includes('Ferro'));
        assert.equal(await p.locator('.ep-cover').count(), 1);
      } finally {
        await c.close();
      }
    });
    await record('118 fichas: rotas, dados incorporados, ilustrações e 236 quadros', async () => {
      const models = JSON.parse(fs.readFileSync('assets/elementos-fichas.json'));
      const c = await context();
      const p = await c.newPage();
      let images = 0;
      const errors = [];
      p.on('pageerror', (e) => errors.push(String(e)));
      try {
        for (const m of models) {
          const r = await p.goto(base + '/elementos/' + m.slug + '/', { waitUntil: 'load' });
          assert([200, 304].includes(r.status()), m.slug + ': HTTP ' + r.status());
          assert.equal(await p.locator('header details.home-menu').count(), 1, m.slug);
          assert.equal(await p.locator('header nav > a, header nav > button').count(), 0, m.slug);
          assert.equal(await p.locator('header .install-open').count(), 1, m.slug);
          assert.equal(await p.locator('header #appearance-open').count(), 1, m.slug);
          await p.waitForFunction(
            () =>
              document.querySelectorAll('.ep-print-story-art img').length === 2 &&
              [...document.querySelectorAll('.ep-print-story-art img')].every((i) => i.complete),
            null,
            { timeout: 15000 },
          );
          const info = await p.evaluate(() => ({
            model: JSON.parse(document.getElementById('element-data').textContent),
            art: document.querySelector('.ep-art').naturalWidth,
            panels: [...document.querySelectorAll('.ep-print-story-art img')].map((i) => ({
              src: i.getAttribute('src'),
              width: i.naturalWidth,
              height: i.naturalHeight,
            })),
          }));
          assert.equal(info.model.z, m.z);
          assert(info.art > 0, m.slug + ' cover');
          for (const image of info.panels) {
            assert(image.width > 0 && image.height > 0, m.slug + ' ' + image.src);
            images++;
          }
        }
        assert.equal(images, 236);
        assert.deepEqual(errors, []);
        return { pages: models.length, panels: images };
      } finally {
        await c.close();
      }
    });
    await record('Ficha interativa: camadas, unidades, comparação e compartilhar', async () => {
      const c = await context();
      const p = await c.newPage();
      try {
        await p.goto(base + '/elementos/ferro/', { waitUntil: 'networkidle' });
        await p.locator('[data-shell]').last().click();
        assert((await p.locator('#shell-detail').textContent()).includes('Camada'));
        await p.locator('#temperature-unit').selectOption('K');
        assert((await p.locator('[data-property=fusion]').textContent()).includes('K'));
        await p.locator('#energy-unit').selectOption('kJ');
        assert(!(await p.locator('[data-property=ei]').textContent()).includes('NaN'));
        await p.locator('#compare-element').selectOption('2');
        await p.locator('#compare-property').selectOption('radius');
        assert(
          (await p.locator('#comparison-note').textContent()).includes('definições diferentes'),
        );
        assert(await p.locator('#comparison-bar-a').evaluate((e) => e.parentElement.hidden));
        await p.locator('#copy-element').click();
        await p.waitForFunction(
          () => document.getElementById('share-status').textContent.length > 0,
        );
        assert((await p.locator('#share-status').textContent()).length > 0);
        await p.setViewportSize({ width: 390, height: 844 });
        await noOverflow(p);
      } finally {
        await c.close();
      }
    });
    await record('Impressão A4: Chromium PDF; todos os motores com mídia print', async () => {
      const c = await context();
      const p = await c.newPage();
      const results = [];
      try {
        for (const slug of ['silicio', 'arsenio', 'francio', 'oganessonio']) {
          await p.goto(base + '/elementos/' + slug + '/', { waitUntil: 'networkidle' });
          await p.emulateMedia({ media: 'print' });
          const layout = await p.evaluate(() => {
            const s = document.querySelector('.ep-print-sheet'),
              box = s.getBoundingClientRect();
            return {
              width: box.width,
              height: box.height,
              images: [...s.querySelectorAll('.ep-print-story-art img')].map((i) => ({
                natural: i.naturalWidth,
                fit: getComputedStyle(i).objectFit,
                bottom: i.getBoundingClientRect().bottom,
                limit: box.bottom,
              })),
            };
          });
          assert(layout.width > 700 && layout.width < 850);
          assert(layout.height > 1050 && layout.height < 1200);
          for (const i of layout.images) {
            assert(i.natural > 0);
            assert.equal(i.fit, 'contain');
            assert(i.bottom <= i.limit + 2);
          }
          if (engine === 'chromium')
            await p.pdf({
              path: path.join(dir, slug + '.pdf'),
              format: 'A4',
              printBackground: true,
              preferCSSPageSize: true,
            });
          await p
            .locator('.ep-print-sheet')
            .screenshot({ path: path.join(dir, 'print-' + slug + '.png') });
          results.push({ slug, ...layout });
          await p.emulateMedia({ media: 'screen' });
        }
        return results;
      } finally {
        await c.close();
      }
    });
    await record('Offline: primeira preparação e navegação para folheto não visitado', async () => {
      const c = await context();
      const p = await c.newPage();
      try {
        await p.goto(base, { waitUntil: 'networkidle' });
        await p.waitForFunction(() => navigator.serviceWorker.controller !== null, null, {
          timeout: 90000,
        });
        const ready = await p.evaluate(async () => {
          await navigator.serviceWorker.ready;
          return await caches.keys();
        });
        assert(ready.some((x) => x.startsWith('cordel-varal-')));
        const cachedScenes = await p.evaluate(async () => {
          const cache = await caches.open(
            (await caches.keys()).find((x) => x.startsWith('cordel-varal-')),
          );
          return (await cache.keys()).filter(
            (r) => r.url.includes('/folhetos/cenas/') && r.url.endsWith('.webp'),
          ).length;
        });
        assert.equal(
          cachedScenes,
          236,
          'All 236 approved panels must be cached before an unvisited element is opened offline',
        );
        const outage = await fetch(base + '/__compat-network/offline', { method: 'POST' });
        assert.equal(outage.status, 204, 'Test server must support real transport outage');
        await assert.rejects(
          fetch(base + '/__compat-network/probe'),
          'Network negative control must fail',
        );
        await p.goto(base + '/elementos/francio/', { waitUntil: 'networkidle' });
        assert.equal(await p.locator('.ep-cover').count(), 1);
        await p.waitForFunction(
          () =>
            document.querySelectorAll('.ep-print-story-art img').length === 2 &&
            [...document.querySelectorAll('.ep-print-story-art img')].every((i) => i.complete),
          null,
          { timeout: 10000 },
        );
        const images = await p
          .locator('.ep-print-story-art img')
          .evaluateAll((images) => images.map((i) => ({ width: i.naturalWidth, src: i.src })));
        assert(
          images.every((i) => i.width > 0),
          'Offline print images missing: ' + JSON.stringify(images),
        );
        await p.goto(base, { waitUntil: 'networkidle' });
        assert.equal(await p.locator('a.tile').count(), 118);
        return {
          cache: ready,
          method:
            'Origin closes network connections; negative control fails; service worker serves unvisited folheto',
        };
      } finally {
        await fetch(base + '/__compat-network/online', { method: 'POST' });
        await c.close();
      }
    });
    await record('Falha do vídeo: entrada não bloqueia o site', async () => {
      const c = await browser.newContext({ reducedMotion: 'no-preference' });
      await c.route('**/*.mp4', (route) => route.abort());
      const p = await c.newPage();
      try {
        await p.goto(base);
        await p.waitForFunction(
          () =>
            document.getElementById('brand-intro').hidden && !document.querySelector('main').inert,
          null,
          { timeout: 15000 },
        );
        await p.locator('#search').fill('ouro');
        assert.equal(await p.locator('a.tile:visible').count(), 1);
      } finally {
        await c.close();
      }
    });
  } catch (e) {
    report.infrastructureError = e.stack || String(e);
  } finally {
    await browser?.close();
    report.finished = new Date().toISOString();
    report.passed = !report.infrastructureError && report.cases.every((c) => c.status === 'passed');
    fs.writeFileSync(path.join(dir, 'report.json'), JSON.stringify(report, null, 2));
    console.log(
      JSON.stringify(
        {
          id,
          version: report.version,
          passed: report.passed,
          cases: report.cases.map((c) => ({
            name: c.name,
            status: c.status,
            error: c.error?.slice(0, 350),
          })),
          infrastructure: report.infrastructureError,
        },
        null,
        2,
      ),
    );
    if (!report.passed) process.exitCode = 1;
  }
})();
