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
        <div class="legend-card-map">
          <span class="card-map-label map-state" data-points-to="example-state" data-side="top">Estado físico<br>+ categoria</span>
          <span class="card-map-label map-number" data-points-to="example-number" data-side="left">Número<br>atômico</span>
          <div class="legend-example" aria-label="Exemplo: ferro, número atômico 26, símbolo Fe, massa 55,845 u, sólido, metal de transição">
            <div class="example-top"><strong class="example-number">26</strong><img class="example-state" src="assets/colecao/estado_solido_transicao.webp" alt="Sólido, metal de transição" width="42" height="42"></div>
            <strong class="example-symbol">Fe</strong><span class="example-name">Ferro</span><small class="example-mass">55,845 u</small>
          </div>
          <span class="card-map-label map-symbol" data-points-to="example-symbol" data-side="right">Símbolo<br>químico</span>
          <span class="card-map-label map-name" data-points-to="example-name" data-side="left">Nome do<br>elemento</span>
          <span class="card-map-label map-mass" data-points-to="example-mass" data-side="bottom">Massa<br>atômica</span>
          <svg class="card-map-arrows" aria-hidden="true" focusable="false"><defs><marker id="card-map-arrowhead" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M.6 .9L7.3 4.2L.8 7.1L2.8 4.1Z" fill="currentColor" stroke="none"/></marker></defs><g class="card-map-lines"></g></svg>
        </div>
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

  // Arrows follow the actual label/field bounds after fonts, zoom or mode changes.
  const cardMap = legend.querySelector('.legend-card-map');

  let previousExample = null;
  function chooseCardExample() {
    const choices = tiles.filter(tile => tile !== previousExample);
    const tile = choices[Math.floor(Math.random() * choices.length)];
    previousExample = tile;
    const example = cardMap.querySelector('.legend-example');
    const number = tile.querySelector('.z').textContent.trim();
    const symbol = tile.querySelector('.symbol').textContent.trim();
    const name = tile.querySelector('.name').textContent.trim();
    const mass = tile.querySelector('.folio-mass').textContent.trim();
    const state = tile.querySelector('.folio-state strong').textContent.trim();
    const icon = tile.querySelector('.folio-state-icon');
    example.dataset.element = number;
    example.querySelector('.example-number').textContent = number;
    example.querySelector('.example-symbol').textContent = symbol;
    example.querySelector('.example-name').textContent = name;
    example.querySelector('.example-mass').textContent = mass;
    const image = example.querySelector('.example-state');
    image.src = icon.src; image.alt = state + ', ' + tile.dataset.category;
    const isotope = mass.startsWith('[');
    cardMap.querySelector('.map-mass').innerHTML = isotope ? 'Número de<br>massa [A]' : 'Massa<br>atômica';
    example.setAttribute('aria-label', `Exemplo: ${name}, número atômico ${number}, símbolo ${symbol}, ${isotope ? 'número de massa' : 'massa atômica'} ${mass}, ${state}, ${tile.dataset.category}`);
    requestAnimationFrame(drawCardMap);
  }

  function drawCardMap() {
    const bounds = cardMap.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const svg = cardMap.querySelector('.card-map-arrows');
    svg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
    const lines = cardMap.querySelector('.card-map-lines');
    lines.replaceChildren();
    cardMap.querySelectorAll('[data-points-to]').forEach(label => {
      const target = cardMap.querySelector('.' + label.dataset.pointsTo);
      const a = label.getBoundingClientRect(), b = target.getBoundingClientRect();
      let x1,y1,x2,y2;
      switch(label.dataset.side) {
        case 'top': x1=(a.left+a.right)/2;y1=a.bottom+3;x2=(b.left+b.right)/2;y2=b.top-3;break;
        case 'bottom': x1=(a.left+a.right)/2;y1=a.top-3;x2=(b.left+b.right)/2;y2=b.bottom+3;break;
        case 'left': x1=a.right+3;y1=(a.top+a.bottom)/2;x2=b.left-3;y2=(b.top+b.bottom)/2;break;
        default: x1=a.left-3;y1=(a.top+a.bottom)/2;x2=b.right+3;y2=(b.top+b.bottom)/2;
      }
      const path = document.createElementNS(ns,'path');
      const dx=x2-x1, dy=y2-y1, length=Math.hypot(dx,dy)||1;
      const bend=Math.min(12,length*.2), nx=-dy/length*bend, ny=dx/length*bend;
      const sx=x1-bounds.left, sy=y1-bounds.top, ex=x2-bounds.left, ey=y2-bounds.top;
      const c1={x:sx+dx*.3+nx,y:sy+dy*.3+ny};
      const c2={x:ex-dx*.26+nx*.7,y:ey-dy*.26+ny*.7};
      const sample=t=>{
        const u=1-t;
        const x=u*u*u*sx+3*u*u*t*c1.x+3*u*t*t*c2.x+t*t*t*ex;
        const y=u*u*u*sy+3*u*u*t*c1.y+3*u*t*t*c2.y+t*t*t*ey;
        const vx=3*u*u*(c1.x-sx)+6*u*t*(c2.x-c1.x)+3*t*t*(ex-c2.x);
        const vy=3*u*u*(c1.y-sy)+6*u*t*(c2.y-c1.y)+3*t*t*(ey-c2.y);
        const scale=Math.hypot(vx,vy)||1;
        return {x,y,nx:-vy/scale,ny:vx/scale};
      };
      // Filled, tapered engraving, with restrained irregular edges and carved grain.
      const endT=1-Math.min(8,length*.32)/length;
      const left=[],right=[];
      for(let i=0;i<=16;i++){
        const t=endT*i/16,p=sample(t);
        const width=Math.min(1.9,length*.065)*(.45+.55*Math.sin(Math.PI*(.16+.7*i/16)));
        const grain=(i%3-1)*.16;
        left.push([p.x+p.nx*(width+grain),p.y+p.ny*(width+grain)]);
        right.push([p.x-p.nx*(width-grain),p.y-p.ny*(width-grain)]);
      }
      const neck=sample(endT),head=Math.min(4.5,length*.18);
      const outline=[...left,[neck.x+neck.nx*head,neck.y+neck.ny*head],[ex,ey],[neck.x-neck.nx*head*.86,neck.y-neck.ny*head*.86],...right.reverse()];
      let shape=outline.map((p,i)=>(i?'L':'M')+p[0].toFixed(2)+','+p[1].toFixed(2)).join(' ')+'Z';
      if(length>26){
        for(const t of [.3,.55]){
          const p=sample(t*endT),q=sample((t+.06)*endT);
          shape+=` M${p.x+p.nx*.65},${p.y+p.ny*.65} L${q.x},${q.y} L${p.x-p.nx*.45},${p.y-p.ny*.45} Z`;
        }
      }
      path.setAttribute('d',shape);
      path.setAttribute('fill-rule','evenodd');
      lines.appendChild(path);
    });
  }
  new ResizeObserver(drawCardMap).observe(cardMap);
  document.fonts?.ready.then(drawCardMap);
  window.addEventListener('resize',drawCardMap);

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
    const icon = document.createElement('img'); icon.className = 'legend-state-symbol';
    icon.src = image.src; icon.alt = ''; icon.width=42; icon.height=42;
    icon.dataset.baseSrc = image.src;
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
    legend.querySelectorAll('[data-state]').forEach(button=>{
      button.setAttribute('aria-pressed',String(button.dataset.state===physical.value));
      const matching = tiles.find(tile=>tile.dataset.category===category.value && tile.dataset.state===button.dataset.state);
      const icon = button.querySelector('img');
      icon.src = matching ? matching.querySelector('.folio-state-icon').src : icon.dataset.baseSrc;
      icon.style.filter = selected && matching ? 'none' : 'grayscale(1)';
    });
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
      if (periodic) chooseCardExample();
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
