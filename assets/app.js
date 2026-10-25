/* Busca, categoria e estado físico compartilham o mesmo filtro. */
(() => {
  'use strict';
  const search = document.getElementById('search'),
    category = document.getElementById('category'),
    state = document.getElementById('physical-state');
  if (!search || !category || !state) return;
  const norm = (s) =>
    (s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  const tiles = [...document.querySelectorAll('a.tile')];
  tiles.forEach((tile) => {
    tile.dataset.state = tile.querySelector('.folio-state strong').textContent.trim();
  });
  function filter() {
    let count = 0;
    const periodic = !!document.querySelector('.grid.periodic');
    tiles.forEach((tile) => {
      const ok =
        norm(tile.dataset.search).includes(norm(search.value)) &&
        (!category.value || tile.dataset.category === category.value) &&
        (!state.value || tile.dataset.state === state.value);
      tile.classList.toggle('unmatched', !ok);
      tile.hidden = !ok && !periodic;
      if (ok) count++;
    });
    document.getElementById('empty').hidden = count !== 0;
    const active = document.querySelector('.filter-active');
    if (active) active.textContent = [category.value, state.value].filter(Boolean).join(' · ');
  }
  search.addEventListener('input', filter);
  category.addEventListener('change', filter);
  state.addEventListener('change', filter);
})();
