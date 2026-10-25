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
      
      <h3 id="periodic-legend-heading">Como ler a tabela</h3>
    </header>
    <div class="periodic-legend-columns">
      <section class="periodic-legend-column" aria-labelledby="periodic-legend-categories-heading">
        <div class="periodic-legend-caption">
          <h4 id="periodic-legend-categories-heading">Categorias</h4>
          <span>Selecione uma categoria e combine com um estado.</span>
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
      <section class="periodic-legend-physical" aria-labelledby="periodic-legend-states-heading">
        <div class="periodic-legend-caption">
          <h4 id="periodic-legend-states-heading">Estados físicos</h4>
          <span>A 25 °C e 1 atm</span>
        </div>
        <ul class="periodic-legend-states">
          <li><img src="assets/colecao/estado_solido_transicao.webp" alt="" width="42" height="42"><span>Sólido</span></li>
          <li><img src="assets/colecao/estado_liquido_halogenios.webp" alt="" width="42" height="42"><span>Líquido</span></li>
          <li><img src="assets/colecao/estado_gasoso_grupo18.webp" alt="" width="42" height="42"><span>Gasoso</span></li>
          <li><img src="assets/colecao/estado_nao_determinado_actinideos.webp" alt="" width="42" height="42"><span>Não determinado</span></li>
        </ul>
      </section>
      </section>
      <section class="legend-reading" aria-labelledby="legend-reading-heading">
        <h4 id="legend-reading-heading">Como ler o card</h4>
        <div class="legend-example" aria-label="Exemplo: ferro, número atômico 26, símbolo Fe, massa 55,845 u, sólido">
          <div class="example-top"><strong>26</strong><img src="assets/colecao/estado_solido_transicao.webp" alt="Sólido" width="30" height="30"></div>
          <strong class="example-symbol">Fe</strong><span>Ferro</span><small>55,845 u</small>
        </div>
        <dl><div><dt>26</dt><dd>Número atômico</dd></div><div><dt>Fe</dt><dd>Símbolo químico</dd></div><div><dt>Ferro</dt><dd>Nome do elemento</dd></div><div><dt>55,845 u</dt><dd>Massa atômica</dd></div><div><dt>Ícone</dt><dd>Estado físico</dd></div></dl>
      </section>
    </div>
    <footer class="periodic-legend-footer">
      <div class="periodic-legend-notes">
        <span>Estado físico da substância simples do elemento.</span>
        <span>Massa em u; [A] é o número de massa de um isótopo.</span>
        <span>Não determinado inclui estados apenas previstos.</span>
      </div>
      <div class="periodic-legend-credit" role="group" aria-label="Instituto Federal da Bahia, Campus Vitória da Conquista">
        <svg class="periodic-legend-ifba-mark" viewBox="0 0 34 46" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
          <circle cx="5.1" cy="5.1" r="4.9" fill="#d81920"/>
          <g fill="#329b36">
            <rect x="12" y=".2" width="9.8" height="9.8"/>
            <rect x="24" y=".2" width="9.8" height="9.8"/>
            <rect x=".2" y="12" width="9.8" height="9.8"/>
            <rect x="12" y="12" width="9.8" height="9.8"/>
            <rect x=".2" y="24" width="9.8" height="9.8"/>
            <rect x="12" y="24" width="9.8" height="9.8"/>
            <rect x="24" y="24" width="9.8" height="9.8"/>
            <rect x=".2" y="36" width="9.8" height="9.8"/>
            <rect x="12" y="36" width="9.8" height="9.8"/>
          </g>
        </svg>
        <div class="periodic-legend-credit-copy">
          <strong>IFBA</strong>
          <span>Campus Vitória da Conquista</span>
        </div>
      </div>
    </footer>`;
  grid.appendChild(legend);
  const category = document.getElementById('category');
  const physical = document.getElementById('physical-state');
  legend.querySelectorAll('.legend-category').forEach(item => {
    const button = document.createElement('button');
    button.type = 'button'; button.innerHTML = item.innerHTML;
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      category.value = category.value === item.dataset.category ? '' : item.dataset.category;
      category.dispatchEvent(new Event('change', {bubbles:true}));
    });
    item.replaceChildren(button);
  });
  const stateValues = ['Sólido','Líquido','Gasoso','Não determinado'];
  legend.querySelectorAll('.periodic-legend-states li').forEach((item,index) => {
    const image = item.querySelector('img');
    const button = document.createElement('button');button.type = 'button';
    const icon = document.createElement('i'); icon.className = 'legend-state-symbol';
    icon.style.setProperty('--state-image', `url("${new URL(image.getAttribute('src'), document.baseURI).href}")`);
    icon.setAttribute('aria-hidden','true');
    button.append(icon,document.createTextNode(stateValues[index]));
    button.dataset.state = stateValues[index];button.setAttribute('aria-pressed','false');
    button.addEventListener('click',()=>{
      physical.value = physical.value === button.dataset.state ? '' : button.dataset.state;
      physical.dispatchEvent(new Event('change',{bubbles:true}));
    });item.replaceChildren(button);
  });
  function syncLegend() {
    let selected;
    legend.querySelectorAll('.legend-category').forEach(item=>{
      const active = item.dataset.category === category.value;
      item.querySelector('button').setAttribute('aria-pressed',String(active));
      if(active) selected = item;
    });
    legend.style.setProperty('--selected-category',selected ? getComputedStyle(selected).getPropertyValue('--cat') : 'var(--ink)');
    legend.querySelectorAll('[data-state]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.state===physical.value)));
  }
  category.addEventListener('change',syncLegend);physical.addEventListener('change',syncLegend);
  new MutationObserver(syncLegend).observe(document.body,{attributes:true,attributeFilter:['data-palette','data-theme']});
  syncLegend();

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
      armBreeze();
      const viewport = document.querySelector('#colecao .catalog-viewport');
      if (viewport) {
        viewport.scrollLeft = 0;
        viewport.setAttribute('aria-label', periodic ? 'Tabela periódica em cordel, com rolagem horizontal quando necessária' : 'Varal dos elementos');
      }
      const heading = document.querySelector('#colecao .catalog-title h2');
      if (heading) heading.textContent = periodic ? 'Tabela periódica em cordel' : 'Um varal de elementos';
      const intro = document.querySelector('#colecao .catalog-intro');
      if (intro) intro.textContent = periodic ? 'Explore por grupos e períodos ou sorteie um elemento para começar.' : 'Escolha um folheto ou sorteie um elemento para começar.';
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

  // Breeze in both the hanging varal and the compact periodic table.
  // Transform-only movement keeps the element grid and suspended ropes fixed.
  const WIND_INTERVAL = 10000;
  const activeWind = new Map();
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let windTimer = null;
  let lastWindMode = null;
  function motionBlocked() {
    return document.hidden ||
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
    const periodic = grid.classList.contains('periodic');
    // First periodic breeze is noticeable without becoming a continuous effect.
    // All subsequent breezes retain the existing calm 10-second cadence.
    const firstInMode = lastWindMode !== periodic;
    lastWindMode = periodic;
    const delay = periodic && firstInMode ? 2600 : WIND_INTERVAL;
    windTimer = setTimeout(() => {
      windTimer = null;
      if (motionBlocked()) return;
      blowBreeze();
      armBreeze();
    }, delay);
  }
  function blowBreeze() {
    const periodic = grid.classList.contains('periodic');
    const viewport = periodic ? document.querySelector('#colecao .catalog-viewport') : null;
    const clip = viewport?.getBoundingClientRect();
    tiles.forEach((tile, index) => {
      if (tile.hidden || typeof tile.animate !== 'function' ||
          tile.matches(':hover, :focus-within, :active') ||
          (periodic && tile.classList.contains('unmatched'))) return;
      const rect = tile.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight ||
          rect.right <= 0 || rect.left >= window.innerWidth) return;
      // Periodic view scrolls independently on narrow screens: only animate
      // folhetos actually visible inside that clipped horizontal viewport.
      if (clip && (rect.right <= clip.left || rect.left >= clip.right ||
          rect.bottom <= clip.top || rect.top >= clip.bottom)) return;
      const rest = periodic ? 0 :
        (parseFloat(getComputedStyle(tile).getPropertyValue('--folio-tilt')) || 0);
      // Smaller periodic cards move less than the large varal folhetos.
      const amplitude = periodic ? .75 + (index % 5) * .105 :
        1.15 + (index % 7) * .055;
      const frames = Array.from({length:65}, (_,i) => {
        const u = i / 64;
        const gust = Math.sin(2.5 * Math.PI * u) * Math.sin(Math.PI * u) ** 2 * Math.exp(-.6 * u);
        return {offset:u, transform:`rotate(${(rest + amplitude * gust).toFixed(4)}deg)`};
      });
      const col = periodic ? parseInt(tile.style.getPropertyValue('--col'), 10) || 0 : 0;
      const row = periodic ? parseInt(tile.style.getPropertyValue('--row'), 10) || 0 : 0;
      const animation = tile.animate(frames, {
        duration:periodic ? 2900 + (index % 4) * 110 : 3200 + (index % 4) * 140,
        delay:periodic ? col * 45 + row % 3 * 65 :
          Math.min(420,Math.round(tile.offsetLeft / Math.max(1,grid.clientWidth) * 350)) + (index % 3) * 35,
        easing:'linear',fill:'none'
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
    tile.addEventListener('pointerdown',settle);
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
