(()=>{
  'use strict';
  const ownScript=document.currentScript;
  const currentNode=document.getElementById('element-data');
  const model=window.CordelElementModel;
  if(!currentNode||!model)return;
  let current;
  try{current=JSON.parse(currentNode.textContent);}catch{return;}
  const $=id=>document.getElementById(id);
  const units={temperature:'C',energy:'eV'};
  let all=null;
  const showEnhanced=()=>document.querySelectorAll('[data-enhance]').forEach(node=>{node.hidden=false;});

  function selectShell(n){
    const shell=current.shells.find(s=>s.n===n);
    if(!shell)return;
    document.querySelectorAll('[data-shell]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.shell)===n)));
    $('shell-detail').textContent=`Camada ${shell.label} · n = ${shell.n}: ${shell.count} elétron${shell.count===1?'':'s'}. Subníveis ocupados: ${shell.sublevels}.`;
  }
  document.querySelectorAll('[data-shell]').forEach(button=>button.addEventListener('click',()=>selectShell(Number(button.dataset.shell))));
  selectShell(current.shells[0].n);

  function updateValues(){
    document.querySelectorAll('[data-property]').forEach(node=>{node.textContent=model.display(current,node.dataset.property,units);});
    updateComparison();
  }
  $('temperature-unit').addEventListener('change',event=>{units.temperature=event.target.value;updateValues();});
  $('energy-unit').addEventListener('change',event=>{units.energy=event.target.value;updateValues();});

  function updateComparison(){
    if(!all)return;
    const other=all.find(item=>item.z===Number($('compare-element').value));
    if(!other)return;
    const property=$('compare-property').value;
    const result=model.compare(current,other,property);
    [current,other].forEach((item,index)=>{
      const suffix=index?'b':'a';
      $('comparison-name-'+suffix).textContent=`${item.symbol} · ${item.name}`;
      let value=model.display(item,property,units);
      if(property==='radius'&&model.isNumber(item.radius))value+=item.radiusType==='vdW'?' · van der Waals':' · covalente';
      $('comparison-value-'+suffix).textContent=value;
      const bar=$('comparison-bar-'+suffix);
      bar.style.width=result.bars[index]+'%';
      bar.parentElement.hidden=!result.comparable;
    });
    $('comparison-note').textContent=result.note;
    $('comparison-link').href=`../${other.slug}/`;
    $('comparison-link').textContent=`Abrir o folheto de ${other.name} →`;
  }
  $('compare-element').addEventListener('change',updateComparison);
  $('compare-property').addEventListener('change',updateComparison);
  $('comparison-fallback').textContent='Preparando os dados para comparação…';
  fetch(new URL('elementos-fichas.json',ownScript.src))
    .then(response=>{if(!response.ok)throw new Error('Data unavailable');return response.json();})
    .then(data=>{
      if(!Array.isArray(data)||data.length!==118||!data.every(x=>Number.isInteger(x.z)&&typeof x.slug==='string'))throw new Error('Invalid data');
      all=data;$('comparison-fallback').hidden=true;$('comparison-controls').hidden=false;updateComparison();
    }).catch(()=>{
      $('comparison-fallback').textContent='A comparação não pôde carregar. Os dados deste folheto continuam disponíveis; tente reabrir a página após preparar o acesso offline.';
    });

  $('copy-element').addEventListener('click',async()=>{
    const url=new URL(location.href);url.hash='';url.search='';
    try{
      if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(url.href);
      $('share-fallback').hidden=true;$('share-status').textContent='Link do folheto copiado.';
    }catch{
      $('share-fallback').hidden=false;$('element-url').value=url.href;$('element-url').focus();$('element-url').select();
      $('share-status').textContent='O navegador não permitiu copiar automaticamente. O endereço está selecionado abaixo.';
    }
  });
  // O folheto de papel é uma peça editorial independente da página web.
  // Não expandimos capítulos ou diálogos: só a folha A4 é enviada à impressão.
  const escapeText=value=>String(value??'').replace(/[&<>"']/g,ch=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[ch]);
  function excerpt(text,limit){
    const clean=String(text||'').replace(/\s+/g,' ').trim();
    const sentences=clean.match(/[^.!?]+[.!?](?=\s|$)/g)||[];
    let selected='';
    for(const sentence of sentences){
      const candidate=(selected+' '+sentence.trim()).trim();
      if(candidate.length>limit)break;
      selected=candidate;
      if(selected.length>limit*.58)break;
    }
    if(selected)return selected;
    if(clean.length<=limit)return clean;
    return clean.slice(0,limit-1).replace(/\s+\S*$/,'')+'…';
  }
  function dataDisplay(key){
    const node=document.querySelector('[data-property="'+key+'"]');
    const value=node?.textContent?.trim();
    return value&&value!=='Não disponível nesta base'?value:'Não informado';
  }
  function makePrintSheet(){
    const art=document.querySelector('.ep-cover .ep-art');
    const story=document.querySelector('#cotidiano .ep-context')?.textContent||'';
    const origin=document.querySelector('#obtencao .ep-context')?.textContent||'';
    const phrase=document.querySelector('.ep-cover figcaption p')?.textContent||'';
    const illustration=art?.getAttribute('alt')||'Ilustração do elemento';
    const cat=String(current.category||'');
    const family=current.series?(current.z<=71?'Série dos lantanídeos':'Série dos actinídeos'):
      ('Grupo '+String(current.group));
    const position=family+' · período '+current.period;
    const shade=/^#[\da-f]{6}$/i.test(current.color)?current.color:'#146b61';
    const details=[
      ['Raio atômico',dataDisplay('radius')],
      ['Eletronegatividade',dataDisplay('en')],
      ['Primeira ionização',dataDisplay('ei')],
      ['Fusão',dataDisplay('fusion')],
      ['Ebulição / sublimação',dataDisplay('boiling')]
    ];
    const props=details.map(([label,value])=>
      '<div class="ep-print-property"><dt>'+escapeText(label)+'</dt><dd>'+escapeText(value)+'</dd></div>'
    ).join('');
    const href=new URL(location.href);
    href.hash='';href.search='';
    const sheet=document.createElement('article');
    sheet.className='ep-print-sheet';
    sheet.setAttribute('aria-label','Folheto de cordel para impressão: '+current.name);
    sheet.style.setProperty('--print-element-color',shade);
    sheet.innerHTML=`
      <div class="ep-print-masthead">
        <div class="ep-print-brand">
          <img src="../../assets/logo-symbol.webp" alt="" width="52" height="52">
          <span><strong>Cordel dos Elementos</strong><small>Química, arte e cotidiano</small></span>
        </div>
        <p class="ep-print-issue">COLEÇÃO PERIÓDICA <b>Nº ${String(current.z).padStart(3,'0')} / 118</b></p>
      </div>
      <div class="ep-print-ribbon"><span>CIÊNCIA EM QUADRINHOS</span><i aria-hidden="true">✦</i><span>UM ELEMENTO, MUITAS HISTÓRIAS</span></div>
      <div class="ep-print-feature">
        <figure class="ep-print-art-panel">
          <div class="ep-print-art-label"><b>${escapeText(current.symbol)}</b><span>Z = ${current.z}</span></div>
          <img class="ep-print-main-art" src="${escapeText(art?.getAttribute('src')||'')}" alt="${escapeText(illustration)}">
          <figcaption>${escapeText(illustration)}</figcaption>
        </figure>
        <div class="ep-print-feature-copy">
          <span class="ep-print-comic-tag"><i aria-hidden="true">✷</i> VOCÊ SABIA?</span>
          <h1>${escapeText(current.name)}</h1>
          <p class="ep-print-category">${escapeText(cat)}</p>
          <blockquote class="ep-print-bubble">${escapeText(phrase)}</blockquote>
          <div class="ep-print-state"><span>ESTADO FÍSICO</span><strong>${escapeText(current.state)}</strong><small>Substância simples · 25 °C / 1 atm</small></div>
        </div>
      </div>
      <section class="ep-print-facts" aria-label="Identidade e propriedades químicas">
        <h2><span aria-hidden="true">✦</span> IDENTIDADE QUÍMICA <small>Dados para investigar</small></h2>
        <div class="ep-print-fact-row">
          <div><small>Massa apresentada</small><strong>${escapeText(current.mass)}</strong></div>
          <div><small>Posição periódica</small><strong>${escapeText(position)}</strong></div>
          <div><small>Átomo neutro</small><strong>${current.z} próton${current.z===1?'':'s'} · ${current.z} elétron${current.z===1?'':'s'}</strong></div>
        </div>
        <div class="ep-print-config"><span>CONFIGURAÇÃO ELETRÔNICA${current.predictedConfig?' · PREVISÃO TEÓRICA':''}</span><strong>${escapeText(current.config)}</strong></div>
        <dl class="ep-print-property-grid">${props}</dl>
      </section>
      <div class="ep-print-stories">
        <section class="ep-print-story">
          <h2><span aria-hidden="true">01</span> NO COTIDIANO</h2>
          <p>${escapeText(excerpt(story,235))}</p>
        </section>
        <section class="ep-print-story">
          <h2><span aria-hidden="true">02</span> DA ORIGEM À OBTENÇÃO</h2>
          <p>${escapeText(excerpt(origin,235))}</p>
        </section>
      </div>
      <footer class="ep-print-footer">
        <p><strong>Fontes e leitura:</strong> CIAAW, IUPAC, NIST e referências científicas detalhadas na ficha digital. Valores sem incerteza informada não são medidas exatas. O estado indicado refere-se à substância simples.</p>
        <div class="ep-print-signature"><span>IFBA · Campus Vitória da Conquista</span><span>Folheto ${String(current.z).padStart(3,'0')} · <a href="${escapeText(href.href)}">Ver a ficha digital ↗</a></span></div>
      </footer>`;
    document.body.append(sheet);
    return sheet;
  }
  const printSheet=makePrintSheet();
  // A folha é produzida ao carregar a ficha, inclusive para Ctrl+P e PDF.
  // Não se alteram os estados de leitura, os detalhes ou as unidades da tela.
  $('print-element').addEventListener('click',()=>{
    if(!printSheet.isConnected)document.body.append(printSheet);
    window.print();
  });

  if('IntersectionObserver' in window){
    const sectionLinks=[...document.querySelectorAll('.ep-chapters a[href^="#"]')];
    const visible=new Map();
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>visible.set(entry.target.id,entry));
      const first=[...visible.values()].filter(entry=>entry.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];
      if(first)sectionLinks.forEach(link=>{
        if(link.getAttribute('href')==='#'+first.target.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');
      });
    },{rootMargin:'-8% 0px -55% 0px',threshold:0});
    document.querySelectorAll('.ep-section').forEach(section=>observer.observe(section));
  }
  updateValues();showEnhanced();
})();
