/* Controles locais da página inicial. */
(() => {
  'use strict';
  const menu = document.getElementById('home-menu');
  if (menu) {
    const trigger = menu.querySelector('summary');
    const install = menu.querySelector('.install-open');
    document.addEventListener('click', event => {
      if (!menu.contains(event.target)) menu.open = false;
    });
    menu.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.open) {
        menu.open = false;
        trigger.focus();
        event.preventDefault();
      }
    });
    install.addEventListener('click', () => { menu.open = false; });
    document.getElementById('install-dialog').addEventListener('close', () => {
      if (!menu.hidden) trigger.focus();
    });
    const sync = () => { menu.hidden = install.hidden; };
    new MutationObserver(sync).observe(install, { attributes: true, attributeFilter: ['hidden'] });
    sync();
  }
  const filters = document.getElementById('catalog-filters');
  const category = document.getElementById('category');
  if (filters && category) {
    const active = filters.querySelector('.filter-active');
    category.addEventListener('change', () => {
      active.textContent = category.value ? 'Categoria selecionada' : '';
    });
  }
})();
