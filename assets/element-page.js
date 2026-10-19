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
  const openedForPrint=new Set();
  function preparePrint(){
    document.querySelectorAll('main details').forEach(details=>{if(!details.open){openedForPrint.add(details);details.open=true;}});
  }
  function finishPrint(){openedForPrint.forEach(details=>{details.open=false;});openedForPrint.clear();}
  window.addEventListener('beforeprint',preparePrint);
  window.addEventListener('afterprint',finishPrint);
  $('print-element').addEventListener('click',()=>{preparePrint();window.print();});

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
