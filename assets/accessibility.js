/* Preferências de acessibilidade: persistência, apresentação e carregamento do VLibras. */
(() => {
  'use strict';
  const KEY = 'cordel_accessibility_v1';
  const read = (k) => {
      try {
        return localStorage.getItem(k);
      } catch {
        return null;
      }
    },
    write = (k, v) => {
      try {
        localStorage.setItem(k, v);
      } catch {}
    };
  const defaults = {
    dark: matchMedia('(prefers-color-scheme: dark)').matches,
    contrast: false,
    scale: 1,
    spacing: false,
    motion: false,
    intro: true,
    reading: false,
    simulation: 'none',
    palette: 'original',
    libras: false,
  };
  const sanitize = (s) => ({
    ...defaults,
    ...Object.fromEntries(
      ['dark', 'contrast', 'spacing', 'motion', 'intro', 'reading', 'libras'].map((k) => [
        k,
        typeof s[k] === 'boolean' ? s[k] : defaults[k],
      ]),
    ),
    scale: Math.min(2, Math.max(0.8, Math.round((Number(s.scale) || 1) * 10) / 10)),
    simulation: ['none', 'protanopia', 'deuteranopia', 'tritanopia', 'acromatopsia'].includes(
      s.simulation,
    )
      ? s.simulation
      : 'none',
    palette: ['original', 'redgreen', 'blueyellow', 'mono'].includes(s.palette)
      ? s.palette
      : 'original',
  });
  let saved;
  try {
    saved = JSON.parse(read(KEY));
  } catch {}
  let state = sanitize(
    saved || {
      dark: read('theme') === 'dark' || defaults.dark,
      contrast: read('theme') === 'contrast',
      scale: read('scale') || 1,
      palette: read('palette') || 'original',
    },
  );
  const $ = (id) => document.getElementById(id),
    drawer = $('appearance'),
    trigger = $('appearance-open'),
    status = $('access-status');
  const reduced = () => state.motion || matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.CordelAccess = {
    get state() {
      return state;
    },
    reduced,
  };
  function apply() {
    document.body.dataset.theme = state.contrast ? 'contrast' : state.dark ? 'dark' : 'original';
    document.body.dataset.palette = state.palette;
    document.documentElement.style.setProperty(
      '--scale',
      String(Math.max(state.scale, state.reading ? 1.2 : 0.8)),
    );
    document.documentElement.classList.toggle('letter-spacing', state.spacing);
    document.documentElement.classList.toggle('simple-reading', state.reading);
    document.documentElement.classList.toggle('reduce-motion', reduced());
    document.querySelectorAll('main').forEach((main) => {
      main.style.filter = state.simulation === 'none' ? 'none' : `url(#cd-${state.simulation})`;
    });
    const theme = document.querySelector('meta[name="theme-color"]');
    if (theme) theme.content = state.contrast ? '#000000' : state.dark ? '#192b29' : '#f4eedf';
    for (const key of ['dark', 'contrast', 'spacing', 'motion', 'intro', 'reading', 'libras'])
      $('access-' + key).checked = state[key];
    $('access-simulation').value = state.simulation;
    $('access-palette').value = state.palette;
    $('font-output').textContent = Math.round(state.scale * 100) + '%';
    $('font-minus').disabled = state.scale <= 0.8;
    $('font-plus').disabled = state.scale >= 2;
    if (reduced() || !state.intro) {
      const intro = $('brand-intro');
      if (intro) intro.hidden = true;
    }
    write(KEY, JSON.stringify(state));
  }
  function change(k, v) {
    state = sanitize({ ...state, [k]: v });
    apply();
  }
  for (const key of ['dark', 'contrast', 'spacing', 'motion', 'intro', 'reading'])
    $('access-' + key).onchange = (e) => change(key, e.target.checked);
  for (const key of ['simulation', 'palette'])
    $('access-' + key).onchange = (e) => change(key, e.target.value);
  $('font-minus').onclick = () => change('scale', state.scale - 0.1);
  $('font-plus').onclick = () => change('scale', state.scale + 0.1);
  $('access-reset').onclick = () => {
    state = { ...defaults };
    apply();
    status.textContent =
      'Preferências restauradas. Se o tradutor já foi carregado, recarregue para removê-lo.';
  };
  trigger.onclick = () => {
    drawer.showModal();
    trigger.setAttribute('aria-expanded', 'true');
    $('appearance-close').focus();
  };
  $('appearance-close').onclick = () => drawer.close();
  drawer.addEventListener('close', () => {
    trigger.setAttribute('aria-expanded', 'false');
    trigger.focus();
  });
  drawer.addEventListener('click', (e) => {
    const rect = drawer.getBoundingClientRect();
    if (
      e.target === drawer &&
      (e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom)
    )
      drawer.close();
  });
  function loadLibras() {
    if ($('vlibras-script')) {
      status.textContent = 'Tradutor já carregado. Feche o painel para utilizá-lo.';
      return;
    }
    const script = document.createElement('script');
    script.id = 'vlibras-script';
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
    status.textContent = 'Carregando tradutor de Libras…';
    script.onload = () => {
      status.textContent = 'VLibras carregado. Feche o painel e use o botão oficial do tradutor.';
    };
    script.onerror = () => {
      script.remove();
      change('libras', false);
      status.textContent =
        'Não foi possível carregar o VLibras. Verifique a conexão e tente novamente.';
    };
    document.body.appendChild(script);
  }
  $('access-libras').onchange = (e) => {
    change('libras', e.target.checked);
    if (state.libras) loadLibras();
    else
      status.textContent =
        'Preferência desativada. Se o tradutor já está aberto, recarregue a página para removê-lo.';
  };
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      try {
        const saved = JSON.parse(read(KEY));
        if (saved) state = sanitize(saved);
      } catch {}
      apply();
      if (state.libras) loadLibras();
    }
  });
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener?.('change', apply);
  apply();
  if (state.libras) loadLibras();
})();
