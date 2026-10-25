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
  edition.innerHTML=`<header class="hq-heading"><div><p class="eyebrow">Uma descoberta entre os elementos</p><h2 id="hq-heading" tabindex="-1">A tabela em quadrinhos</h2></div><button class="hq-return" type="button">Voltar à tabela ↩</button></header><p class="hq-intro">118 elementos em uma composição de quadrinhos. O raio covalente define a área adaptada de cada quadro; o estado físico define seu tratamento visual.</p><details class="hq-guide"><summary>Como ler esta edição</summary><p>O tamanho usa uma escala visual crescente, com limites para preservar a leitura. Raios covalentes em picômetros (pm), incluindo valores estimados, seguem as referências Cordero (2008) e Pyykkö–Atsumi (2009) registradas nas fichas.</p><p>Seis gases nobres têm apenas raio de van der Waals nesta base. Seus quadros usam tamanho neutro e não participam da comparação de áreas.</p><p>Formas estáveis e arredondadas para sólidos; curvas orgânicas para líquidos; linhas expressivas e composição aberta para gases; hachuras contrastantes para estados não determinados. As cores dos ícones identificam as categorias.</p><p>Os quadros seguem o número atômico, em sete capítulos por período. Toque em um elemento para abrir sua ficha.</p></details><div class="hq-chapters"></div><button class="hq-return hq-return-bottom" type="button">Voltar à tabela ↩</button>`;
  catalog.append(edition);
  let built=false, saved=null;
  const stateClass={'Sólido':'solid','Líquido':'liquid','Gasoso':'gas','Não determinado':'unknown'};
  function build(){
    if(built)return;
    const chapters=edition.querySelector('.hq-chapters');
    for(let period=1;period<=7;period++){
      const section=document.createElement('section');section.className='hq-chapter';
      section.setAttribute('aria-labelledby','hq-period-'+period);
      const title=document.createElement('h3');title.id='hq-period-'+period;
      title.className='hq-period-title';title.textContent='Período '+period;
      const panels=document.createElement('div');panels.className='hq-panels';
      section.append(title,panels);chapters.append(section);
      tiles.forEach(tile=>{
        const z=tile.querySelector('.z').textContent.trim(),model=lookup.get(z);
        if(model.period!==period)return;
        const state=tile.querySelector('.folio-state strong').textContent.trim();
        const panel=document.createElement('a');panel.className='hq-panel hq-'+stateClass[state];
        panel.href=tile.getAttribute('href');panel.dataset.z=z;panel.dataset.state=state;
        panel.dataset.category=tile.dataset.category;
        panel.style.setProperty('--cat',getComputedStyle(tile).getPropertyValue('--cat'));
        const scaled=model.type==='cov' && Number.isFinite(model.radius);
        const area=scaled ? 64000+56000*(model.radius-minimum)/(maximum-minimum) : 82000;
        const ratio=[1,1.12,1.18,1.05][Number(z)%4];
        panel.dataset.area=String(area);panel.dataset.radius=scaled?String(model.radius):'';
        panel.style.setProperty('--hq-width',Math.sqrt(area*ratio).toFixed(2)+'px');
        panel.style.setProperty('--hq-ratio',String(ratio));
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
    }
    built=true;
  }
  function open(){
    const viewport=catalog.querySelector('.catalog-viewport');
    saved={y:window.scrollY,x:viewport.scrollLeft};build();
    catalog.classList.add('hq-active');edition.hidden=false;
    trigger.setAttribute('aria-expanded','true');
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
