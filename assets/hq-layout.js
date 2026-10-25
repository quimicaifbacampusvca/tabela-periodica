/* Composição autoral de HQ: área por raio covalente; linguagem por estado. */
(() => {
  'use strict';
  const catalog=document.getElementById('colecao');
  const mark=catalog?.querySelector('.periodic-legend-ifba-mark');
  const data=document.getElementById('hq-radius-data');
  if(!mark || !data) return;
  const radii=JSON.parse(data.textContent);
  const tiles=[...catalog.querySelectorAll('a.tile')];
  const lookup=new Map(radii.map(item=>[String(item.z),item]));
  const comparable=radii.filter(item=>item.type==='cov' && Number.isFinite(item.radius));
  const minimum=Math.min(...comparable.map(item=>item.radius));
  const maximum=Math.max(...comparable.map(item=>item.radius));
  const trigger=document.createElement('button');
  trigger.type='button';trigger.className='hq-open';
  trigger.setAttribute('aria-label','Descobrir a tabela em quadrinhos');
  trigger.setAttribute('aria-controls','hq-edition');trigger.setAttribute('aria-expanded','false');
  mark.before(trigger);trigger.append(mark);
  const edition=document.createElement('section');
  edition.id='hq-edition';edition.className='hq-edition';edition.hidden=true;
  edition.setAttribute('aria-labelledby','hq-heading');
  edition.innerHTML=`<header class="hq-heading"><div><p class="eyebrow">Uma descoberta entre os elementos</p><h2 id="hq-heading" tabindex="-1">A tabela em quadrinhos</h2></div><button class="hq-return" type="button">Voltar à tabela ↩</button></header><p class="hq-intro">A organização clássica da tabela periódica, com quadrinhos que variam de tamanho conforme o raio covalente e de tratamento visual conforme o estado físico.</p><details class="hq-guide"><summary>Como ler esta edição</summary><p>O tamanho usa uma escala visual crescente, com limites para preservar a leitura. Raios covalentes em picômetros (pm), incluindo valores estimados, seguem as referências Cordero (2008) e Pyykkö–Atsumi (2009) registradas nas fichas.</p><p>Seis gases nobres têm apenas raio de van der Waals nesta base. Seus quadros usam tamanho neutro e não participam da comparação de áreas.</p><p>Formas estáveis e arredondadas para sólidos; curvas orgânicas para líquidos; linhas expressivas e composição aberta para gases; hachuras contrastantes para estados não determinados. As cores dos ícones identificam as categorias.</p><p>Os elementos mantêm suas posições em 18 grupos e 7 períodos, com lantanídeos e actinídeos destacados abaixo. O raio altera o quadrinho dentro de sua posição, sem deslocar os demais. Deslize horizontalmente para explorar e toque em um elemento para abrir sua ficha.</p></details><p class="hq-scroll-hint">18 grupos · 7 períodos · Deslize para explorar a tabela.</p><div class="hq-zoom-controls" role="group" aria-label="Tamanho da tabela em quadrinhos"><button type="button" data-hq-zoom="out" aria-label="Reduzir tabela">−</button><output class="hq-zoom-value" aria-live="polite">100%</output><button type="button" data-hq-zoom="in" aria-label="Ampliar tabela">+</button><button type="button" data-hq-zoom="fit">Ajustar à largura</button><button type="button" data-hq-zoom="actual">100%</button></div><div class="hq-scroll" role="region" aria-label="Tabela periódica em quadrinhos, com rolagem horizontal" tabindex="0"><div class="hq-canvas"><div class="hq-table"></div></div></div><button class="hq-return hq-return-bottom" type="button">Voltar à tabela ↩</button>`;
  catalog.append(edition);
  let built=false, saved=null;
  const stateClass={'Sólido':'solid','Líquido':'liquid','Gasoso':'gas','Não determinado':'unknown'};
  function build(){
    if(built)return;
    const panels=edition.querySelector('.hq-table');
    function label(text,column,row,span=1,kind=''){
      const el=document.createElement('span');el.className='hq-table-label '+kind;
      el.textContent=text;el.style.gridColumn=column+'/span '+span;el.style.gridRow=row;
      panels.append(el);
    }
    for(let group=1;group<=18;group++)label(String(group),group+1,1,1,'hq-group');
    for(let period=1;period<=7;period++)label(String(period),1,period+1,1,'hq-period');
    label('Lantanídeos',2,10,2,'hq-series');
    label('Actinídeos',2,11,2,'hq-series');
    label('57–71 · La–Lu',4,7,1,'hq-series-marker');
    label('89–103 · Ac–Lr',4,8,1,'hq-series-marker');
    const key=document.createElement('aside');key.className='hq-table-key';
    key.style.gridColumn='5 / 13';key.style.gridRow='2 / 5';
    key.innerHTML='<h3>A tabela em quadrinhos</h3><p>As posições seguem os grupos e períodos da tabela clássica.</p><p><strong>Raio covalente → área do quadrinho</strong><br>A escala foi adaptada para preservar a leitura.</p><p><strong>Estado físico → linguagem visual</strong><br>Formas estáveis, curvas orgânicas, linhas expressivas e hachuras contrastantes.</p><p>Os seis elementos sem raio covalente nesta base usam tamanho neutro.</p>';
    panels.append(key);
    tiles.forEach(tile=>{

        const z=tile.querySelector('.z').textContent.trim(),model=lookup.get(z);

        const state=tile.querySelector('.folio-state strong').textContent.trim();
        const panel=document.createElement('a');panel.className='hq-panel hq-'+stateClass[state];
        panel.href=tile.getAttribute('href');panel.dataset.z=z;panel.dataset.state=state;
        panel.dataset.category=tile.dataset.category;
        panel.style.setProperty('--cat',getComputedStyle(tile).getPropertyValue('--cat'));
        const scaled=model.type==='cov' && Number.isFinite(model.radius);
        const area=scaled ? 21000+13000*(model.radius-minimum)/(maximum-minimum) : 27500;
        const ratio=.72;
        panel.dataset.area=String(area);panel.dataset.radius=scaled?String(model.radius):'';
        panel.style.setProperty('--hq-width',Math.sqrt(area*ratio).toFixed(2)+'px');
        panel.style.setProperty('--hq-ratio',String(ratio));
        panel.style.setProperty('--hq-height',Math.sqrt(area/ratio).toFixed(2)+'px');
        const column=Number(tile.style.getPropertyValue('--col'))+1;
        const row=Number(tile.style.getPropertyValue('--row'))+1;
        panel.style.gridColumn=String(column);panel.style.gridRow=String(row);
        panel.dataset.column=String(column-1);panel.dataset.row=String(row-1);
        const head=document.createElement('div');head.className='hq-panel-head';
        const number=document.createElement('span');number.textContent=z;
        const icon=tile.querySelector('.folio-state-icon').cloneNode();
        icon.loading='lazy';icon.alt=state+', '+tile.dataset.category;
        head.append(number,icon);
        const symbol=document.createElement('strong');symbol.className='hq-symbol';symbol.textContent=tile.querySelector('.symbol').textContent;
        const art=tile.querySelector('.folio-illustration').cloneNode();art.className='hq-art';art.loading='lazy';
        const name=document.createElement('h4');name.textContent=tile.querySelector('.name').textContent;
        const caption=document.createElement('div');caption.className='hq-caption';caption.append(symbol,name);
        const radius=document.createElement('small');radius.className='hq-radius';
        radius.textContent=scaled?'Raio covalente: '+model.radius+' pm':'Raio covalente não disponível · tamanho neutro';
        panel.append(head,art,caption,radius);
        panel.setAttribute('aria-label',tile.querySelector('.name').textContent.replace(/\u00ad/g,'')+', '+z+', '+state+'. '+radius.textContent+'. Abrir ficha.');
        panels.append(panel);
    });
    built=true;
  }

  const canvas=edition.querySelector('.hq-canvas');
  const table=edition.querySelector('.hq-table');
  const scroll=edition.querySelector('.hq-scroll');
  const zoomValue=edition.querySelector('.hq-zoom-value');
  let zoom=1, sizing='initial';
  function applyZoom(value){
    if(edition.hidden)return;
    zoom=Math.max(.01,Math.min(1.5,value));
    const width=table.offsetWidth+8,height=table.offsetHeight+8;
    table.style.transform='scale('+zoom+')';
    canvas.style.width=Math.ceil(width*zoom)+'px';
    canvas.style.height=Math.ceil(height*zoom)+'px';
    zoomValue.value=Math.round(zoom*100)+'%';
    edition.querySelector('[data-hq-zoom="out"]').disabled=zoom<=.0101;
    edition.querySelector('[data-hq-zoom="in"]').disabled=zoom>=1.4999;
    edition.querySelector('[data-hq-zoom="fit"]').setAttribute('aria-pressed',String(sizing==='fit'));
  }
  function fitWidth(){
    sizing='fit';
    const css=getComputedStyle(scroll);
    const available=scroll.clientWidth-parseFloat(css.paddingLeft)-parseFloat(css.paddingRight)-2;
    applyZoom(Math.min(1,available/(table.offsetWidth+8)));
    scroll.scrollLeft=0;
  }
  function sizeOnOpen(){
    if(window.matchMedia('(min-width:1000px)').matches)fitWidth();
    else{sizing='reading';applyZoom(1);}
  }
  edition.querySelectorAll('[data-hq-zoom]').forEach(button=>button.addEventListener('click',()=>{
    const action=button.dataset.hqZoom;
    if(action==='fit'){fitWidth();return;}
    sizing='manual';
    applyZoom(action==='actual'?1:zoom+(action==='in'?.15:-.15));
  }));
  new ResizeObserver(()=>{
    if(edition.hidden)return;
    if(sizing==='fit')fitWidth();else applyZoom(zoom);
  }).observe(scroll);
  new MutationObserver(()=>{
    if(edition.hidden)return;
    requestAnimationFrame(()=>{if(sizing==='fit')fitWidth();else applyZoom(zoom);});
  }).observe(document.documentElement,{attributes:true,attributeFilter:['style','class']});
  document.fonts?.ready.then(()=>{if(!edition.hidden){if(sizing==='fit')fitWidth();else applyZoom(zoom);}});

  function open(){
    const viewport=catalog.querySelector('.catalog-viewport');
    saved={y:window.scrollY,x:viewport.scrollLeft};build();
    catalog.classList.add('hq-active');edition.hidden=false;
    trigger.setAttribute('aria-expanded','true');
    sizeOnOpen();
    edition.querySelector('#hq-heading').focus({preventScroll:true});
    edition.scrollIntoView({block:'start',behavior:'instant'});
    document.dispatchEvent(new Event('cordel:hqchange'));
  }
  function close(){
    edition.hidden=true;catalog.classList.remove('hq-active');
    trigger.setAttribute('aria-expanded','false');
    const viewport=catalog.querySelector('.catalog-viewport');
    if(saved){viewport.scrollLeft=saved.x;window.scrollTo({top:saved.y,behavior:'instant'});}
    trigger.focus({preventScroll:true});
    document.dispatchEvent(new Event('cordel:hqchange'));
  }
  trigger.addEventListener('click',open);
  edition.querySelectorAll('.hq-return').forEach(button=>button.addEventListener('click',close));
  edition.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();close();}});
  new MutationObserver(()=>{
    if(!built)return;
    edition.querySelectorAll('.hq-panel').forEach(panel=>{
      const tile=tiles.find(tile=>tile.querySelector('.z').textContent.trim()===panel.dataset.z);
      panel.style.setProperty('--cat',getComputedStyle(tile).getPropertyValue('--cat'));
    });
  }).observe(document.body,{attributes:true,attributeFilter:['data-theme','data-palette']});
})();
