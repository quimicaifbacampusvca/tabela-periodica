/* Controles locais da página inicial. */
(() => {
  'use strict';
  const menu = document.getElementById('home-menu');
  if (menu) {
    const trigger = menu.querySelector('summary');
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
    menu.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', () => { menu.open = false; });
    });
    document.getElementById('install-dialog').addEventListener('close', () => {
      if (!menu.hidden) trigger.focus();
    });
    document.getElementById('appearance').addEventListener('close', () => {
      trigger.focus();
    });
  }
})();
