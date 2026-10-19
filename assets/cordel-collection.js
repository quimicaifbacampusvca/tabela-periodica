/* As cordas seguem os pregadores após filtros, troca de modo e redimensionamento. */
(() => {
  'use strict';
  const grid = document.querySelector('#colecao .grid');
  if (!grid || grid.dataset.cordelReady) return;
  grid.dataset.cordelReady = 'true';
  const tiles = [...grid.querySelectorAll('a.tile')];
  const ns = 'http://www.w3.org/2000/svg';
  const ropes = document.createElementNS(ns, 'svg');
  ropes.setAttribute('class', 'cordel-ropes');
  ropes.setAttribute('aria-hidden', 'true');
  ropes.setAttribute('focusable', 'false');
  ropes.setAttribute('preserveAspectRatio', 'none');
  tiles.forEach(tile => {
    // Periodic view exposes the scientific mass already present in each folheto.
    const pin = document.createElement('span');
    pin.className = 'folio-pin folio-decoration';
    pin.setAttribute('aria-hidden', 'true');
    tile.appendChild(pin);
  });
  function tableLabel(className, text, column, row, span = 1) {
    const label = document.createElement('span');
    label.className = `periodic-only ${className}`;
    label.textContent = text;
    label.setAttribute('style', `grid-column:${column}/span ${span};grid-row:${row}`);
    label.setAttribute('aria-hidden', 'true');
    grid.appendChild(label);
    return label;
  }
  for (let group = 1; group <= 18; group++) tableLabel('periodic-group', String(group), group + 1, 1);
  for (let period = 1; period <= 7; period++) tableLabel('periodic-period', String(period), 1, period + 1);
  tableLabel('periodic-series', 'Lantanídeos', 2, 10, 2);
  tableLabel('periodic-series', 'Actinídeos', 2, 11, 2);
  for (const [range, names, row] of [['57–71', 'La–Lu', 7], ['89–103', 'Ac–Lr', 8]]) {
    const marker = tableLabel('periodic-series-marker', '', 4, row);
    const numbers = document.createElement('small'); numbers.textContent = range;
    const symbols = document.createElement('strong'); symbols.textContent = names;
    marker.appendChild(numbers); marker.appendChild(symbols);
  }
  // Native graphic reconstructed from the approved Drive legend.
  // Chemical groups 4–11; periods 1–3. The grid has one extra header row/column.
  const legend = document.createElement('section');
  legend.className = 'periodic-only periodic-central-legend';
  legend.setAttribute('aria-labelledby','periodic-legend-heading');
  legend.innerHTML = `
    <header class="periodic-legend-heading">
      <span class="periodic-legend-overline">COMO LER A TABELA</span>
      <h3 id="periodic-legend-heading">Elementos no cotidiano <span>| legenda central</span></h3>
    </header>
    <div class="periodic-legend-columns">
      <section class="periodic-legend-column" aria-labelledby="periodic-legend-categories-heading">
        <div class="periodic-legend-caption">
          <h4 id="periodic-legend-categories-heading">COR = CATEGORIA</h4>
          <span>Cor dominante do ícone</span>
        </div>
        <ul class="periodic-legend-categories">
          <li class="legend-category" data-category="Metal alcalino"><i aria-hidden="true"></i><span>Metais alcalinos</span></li>
          <li class="legend-category" data-category="Metal alcalinoterroso"><i aria-hidden="true"></i><span>Alcalinoterrosos</span></li>
          <li class="legend-category" data-category="Metal de transição"><i aria-hidden="true"></i><span>Metais de transição</span></li>
          <li class="legend-category" data-category="Outro metal"><i aria-hidden="true"></i><span>Outros metais</span></li>
          <li class="legend-category" data-category="Semimetal"><i aria-hidden="true"></i><span>Semimetais</span></li>
          <li class="legend-category" data-category="Não metal"><i aria-hidden="true"></i><span>Não metais</span></li>
          <li class="legend-category" data-category="Halogênio"><i aria-hidden="true"></i><span>Halogênios</span></li>
          <li class="legend-category" data-category="Gás nobre"><i aria-hidden="true"></i><span>Gases nobres</span></li>
          <li class="legend-category" data-category="Lantanídeo"><i aria-hidden="true"></i><span>Lantanídeos</span></li>
          <li class="legend-category" data-category="Actinídeo"><i aria-hidden="true"></i><span>Actinídeos</span></li>
        </ul>
      </section>
      <section class="periodic-legend-column periodic-legend-physical" aria-labelledby="periodic-legend-states-heading">
        <div class="periodic-legend-caption">
          <h4 id="periodic-legend-states-heading">FORMA = ESTADO</h4>
          <span>A 25 °C e 1 atm</span>
        </div>
        <ul class="periodic-legend-states">
          <li><img src="assets/colecao/estado_solido_transicao.webp" alt="" width="42" height="42"><span>Sólido</span></li>
          <li><img src="assets/colecao/estado_liquido_halogenios.webp" alt="" width="42" height="42"><span>Líquido</span></li>
          <li><img src="assets/colecao/estado_gasoso_grupo18.webp" alt="" width="42" height="42"><span>Gasoso</span></li>
          <li><img src="assets/colecao/estado_nao_determinado_actinideos.webp" alt="" width="42" height="42"><span>Não determinado</span></li>
        </ul>
      </section>
    </div>
    <footer class="periodic-legend-footer">
      <div class="periodic-legend-notes">
        <span>Estado físico da substância simples do elemento.</span>
        <span>Massa em u; [A] é o número de massa de um isótopo.</span>
        <span>Não determinado inclui estados apenas previstos.</span>
      </div>
      <span class="periodic-legend-credit">IFBA · Campus Vitória da Conquista</span>
    </footer>`;
  // The legend hangs from the same three physical cord lines as the folhetos.
  // Its rope connections and wooden pins follow actual period offsets.
  const legendCordContainer = document.createElement('div');
  legendCordContainer.className = 'periodic-legend-cords';
  legendCordContainer.setAttribute('aria-hidden', 'true');
  for (let i = 1; i <= 3; i++) {
    const lane = document.createElement('span');
    lane.className = 'periodic-legend-cord-lane periodic-legend-cord-lane-' + i;
    for (const side of ['start', 'end']) {
      const pin = document.createElement('i');
      pin.className = 'periodic-legend-pin periodic-legend-pin-' + side;
      lane.appendChild(pin);
    }
    legendCordContainer.appendChild(lane);
  }
  legend.appendChild(legendCordContainer);
  grid.appendChild(legend);
  grid.prepend(ropes);
  grid.classList.add('cordel-collection');
  let frame = 0, lastDrawing = '', lastMode = null;
  function draw() {
    frame = 0;
    const periodic = grid.classList.contains('periodic');
    if (lastMode !== periodic) {
      lastMode = periodic;
      lastDrawing = '';
      document.querySelector('#colecao')?.classList.toggle('catalog-periodic',periodic);
      stopBreeze();
      if (!periodic) armBreeze();
      const viewport = document.querySelector('#colecao .catalog-viewport');
      if (viewport) {
        viewport.scrollLeft = 0;
        viewport.setAttribute('aria-label', periodic ? 'Tabela periódica em cordel, com rolagem horizontal quando necessária' : 'Varal dos elementos');
      }
      const heading = document.querySelector('#colecao .catalog-title h2');
      if (heading) heading.textContent = periodic ? 'Tabela periódica em cordel' : 'Um varal de elementos';
      const intro = document.querySelector('#colecao .catalog-intro');
      if (intro) intro.textContent = periodic ? 'Explore os elementos por grupos e períodos.' : 'Escolha um folheto e descubra a química no cotidiano.';
    }
    // Ropes follow the upper edges of each period, preserving varal positioning.
    const rows = [];
    for (const tile of tiles) {
      if (tile.hidden || tile.offsetWidth === 0) continue;
      const y = tile.offsetTop - (periodic ? 6 : 12);
      let row = rows.find(row => Math.abs(row.y - y) < 2);
      if (!row) { row = { y, pins: [] }; rows.push(row); }
      row.pins.push(tile.offsetLeft + tile.offsetWidth / 2);
    }
    // Keep each cord connection synchronized with the actual element-row
    // positions, including font scaling, responsive widths and PWA resize.
    if (periodic) {
      const periodCords = [...rows].sort((a, b) => a.y - b.y).slice(0, 3);
      periodCords.forEach((row, index) => {
        legend.style.setProperty('--legend-cord-y-' + (index + 1),
          (row.y - legend.offsetTop).toFixed(1) + 'px');
      });
    }
    const width = grid.clientWidth, height = grid.clientHeight;
    const paths = rows.map(({y, pins}) => {
      pins.sort((a,b) => a-b);
      const points = [[3,y-6], ...pins.map(x => [x,y]), [width-3,y-6]];
      let d = `M ${points[0][0]} ${points[0][1]}`;
      for (let i=1; i<points.length; i++) {
        const [x0,y0] = points[i-1], [x1,y1] = points[i];
        d += ` Q ${(x0+x1)/2} ${Math.max(y0,y1)+Math.min(5,(x1-x0)*.035)} ${x1} ${y1}`;
      }
      return d;
    });
    const key = JSON.stringify([width,height,paths]);
    if (key === lastDrawing) return;
    lastDrawing = key;
    ropes.setAttribute('viewBox', `0 0 ${Math.max(1,width)} ${Math.max(1,height)}`);
    const fragment = document.createDocumentFragment();
    paths.forEach(d => {
      for (const cls of ['cordel-rope','cordel-rope cordel-rope-fibre']) {
        const path = document.createElementNS(ns,'path');
        path.setAttribute('class',cls); path.setAttribute('d',d); fragment.appendChild(path);
      }
    });
    ropes.replaceChildren(fragment);
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(draw); }
  // SVG child replacement does not trigger this attribute-only observer.
  new MutationObserver(schedule).observe(grid,{attributes:true,subtree:true,attributeFilter:['hidden','class']});
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(grid);
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('pageshow',schedule);
  document.fonts?.ready.then(schedule);

  // Uma brisa curta a cada 30 s. Apenas papéis visíveis; ponto de suspensão fixo.
  const WIND_INTERVAL = 10000;
  const activeWind = new Map();
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let windTimer = null;
  function motionBlocked() {
    return document.hidden || grid.classList.contains('periodic') ||
      motionPreference.matches || document.documentElement.classList.contains('reduce-motion') ||
      document.documentElement.classList.contains('simple-reading');
  }
  function stopBreeze() {
    if (windTimer !== null) clearTimeout(windTimer);
    windTimer = null;
    for (const animation of activeWind.values()) animation.cancel();
    activeWind.clear();
  }
  function armBreeze() {
    if (windTimer !== null || motionBlocked()) return;
    windTimer = setTimeout(() => {
      windTimer = null;
      if (motionBlocked()) return;
      blowBreeze();
      armBreeze();
    }, WIND_INTERVAL);
  }
  function blowBreeze() {
    tiles.forEach((tile, index) => {
      if (tile.hidden || typeof tile.animate !== 'function' || tile.matches(':hover, :focus-within')) return;
      const rect = tile.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight || rect.right <= 0 || rect.left >= window.innerWidth) return;
      const rest = parseFloat(getComputedStyle(tile).getPropertyValue('--folio-tilt')) || 0;
      const amplitude = 1.15 + (index % 7) * .055;
      const frames = Array.from({length:65}, (_,i) => {
        const u = i / 64;
        const gust = Math.sin(2.5 * Math.PI * u) * Math.sin(Math.PI * u) ** 2 * Math.exp(-.6 * u);
        return {offset:u, transform:`rotate(${(rest + amplitude * gust).toFixed(4)}deg)`};
      });
      const animation = tile.animate(frames, {
        duration:3200 + (index % 4) * 140,
        delay:Math.min(420,Math.round(tile.offsetLeft / Math.max(1,grid.clientWidth) * 350)) + (index % 3) * 35,
        easing:'linear', fill:'none'
      });
      activeWind.set(tile, animation);
      const finished = () => { if (activeWind.get(tile) === animation) activeWind.delete(tile); };
      animation.onfinish = finished;
      animation.oncancel = finished;
    });
  }
  tiles.forEach(tile => {
    const settle = () => activeWind.get(tile)?.cancel();
    tile.addEventListener('pointerenter',settle);
    tile.addEventListener('focusin',settle);
  });
  function refreshMotion() {
    if (motionBlocked()) stopBreeze(); else armBreeze();
  }
  document.addEventListener('visibilitychange',refreshMotion);
  window.addEventListener('pagehide',stopBreeze);
  window.addEventListener('pageshow',refreshMotion);
  motionPreference.addEventListener?.('change',refreshMotion);
  new MutationObserver(refreshMotion).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  schedule();
})();
