/* Experiência compartilhada: instalação, acesso offline e navegação do catálogo. */
(() => {
  'use strict';
  const script = document.currentScript;
  const base = new URL('../', script.src);
  const dialog = document.getElementById('install-dialog');
  const action = document.getElementById('install-action');
  let installEvent = null;
  document.querySelectorAll('.install-open').forEach((b) => (b.onclick = () => dialog.showModal()));
  document.getElementById('install-close').onclick = () => dialog.close();
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    installEvent = e;
    action.hidden = false;
    document.getElementById('install-help').hidden = true;
  });
  action.onclick = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const result = await installEvent.userChoice;
    if (result.outcome === 'accepted') {
      dialog.close();
      action.hidden = true;
    }
    installEvent = null;
  };
  window.addEventListener('appinstalled', () => {
    action.hidden = true;
    document.querySelectorAll('.install-open').forEach((b) => (b.hidden = true));
  });
  if (matchMedia('(display-mode: standalone)').matches || navigator.standalone)
    document.querySelectorAll('.install-open').forEach((b) => (b.hidden = true));
  const offline = document.getElementById('offline-status');
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register(new URL('sw.js', base), { scope: base.pathname, updateViaCache: 'none' })
      .then(async (reg) => {
        await navigator.serviceWorker.ready;
        offline.textContent =
          'Conteúdo disponível offline neste navegador: índice e 118 elementos.';
        if (reg.waiting) offline.textContent = 'Nova versão pronta. Feche e reabra para atualizar.';
      })
      .catch(() => {
        offline.textContent =
          'O acesso offline não foi preparado. Continue usando o site com conexão.';
      });
  } else offline.textContent = 'Este navegador não oferece o acesso offline do aplicativo.';
  const grid = document.querySelector('.grid');
  if (grid) {
    document.querySelectorAll('[data-view]').forEach(
      (b) =>
        (b.onclick = () => {
          grid.classList.toggle('periodic', b.dataset.view === 'periodic');
          document.getElementById('table-help').hidden = b.dataset.view !== 'periodic';
          document
            .querySelectorAll('[data-view]')
            .forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
          document.getElementById('search').dispatchEvent(new Event('input'));
        }),
    );
    document.getElementById('random-element').onclick = () => {
      const tiles = [...grid.querySelectorAll('a')];
      location.href = tiles[Math.floor(Math.random() * tiles.length)].href;
    };
  }
  if (
    !window.CordelAccess?.reduced() &&
    !matchMedia('(prefers-reduced-motion: reduce)').matches &&
    'IntersectionObserver' in window
  ) {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    document.querySelectorAll('.discovery-strip,.catalog-title,.content section').forEach((el) => {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }
})();
