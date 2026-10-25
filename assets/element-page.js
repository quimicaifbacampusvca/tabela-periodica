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
    const sheet=document.createElement('article');
    // Cada um dos 118 elementos pertence a uma das quatro famílias visuais.
    // A arte principal permanece intacta; os dois quadros de apoio reservam
    // espaço para ilustrações que serão validadas individualmente depois.
    const directions={
      'Gasoso':{className:'ep-print-gas',label:'VENTOS E TRAÇOS'},
      'Sólido':{className:'ep-print-solid',label:'FORMAS EM QUADRINHOS'},
      'Líquido':{className:'ep-print-liquid',label:'LINHAS QUE FLUEM'},
      'Não determinado':{className:'ep-print-unknown',label:'FRONTEIRAS DO CONHECIMENTO'}
    };
    const stateDirection=directions[current.state];
    if(!stateDirection)throw new Error('Estado sem contrato editorial: '+current.state);
    const artIndex=String(current.z).padStart(3,'0');
    sheet.className='ep-print-sheet ep-print-prototype '+stateDirection.className;
    sheet.dataset.printPhase='estrutura-sem-cenas';
    sheet.dataset.element=artIndex;
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
      <div class="ep-print-ribbon"><span>CIÊNCIA EM QUADRINHOS</span><i aria-hidden="true">✦</i><span>${stateDirection.label}</span></div>
      <div class="ep-print-feature">
        <figure class="ep-print-art-panel">
          <div class="ep-print-art-label"><b>${escapeText(current.symbol)}</b><span>Z = ${current.z}</span></div>
          <span class="ep-print-scene-motif" aria-hidden="true"></span>
          <img class="ep-print-main-art" src="${escapeText(art?.getAttribute('src')||'')}" alt="${escapeText(illustration)}">
          <span class="ep-print-scene-sparks" aria-hidden="true"><i></i><i></i><i></i></span>
          <figcaption>${escapeText(illustration)}</figcaption>
        </figure>
        <div class="ep-print-feature-copy">
          <span class="ep-print-comic-tag"><i aria-hidden="true">✷</i> UM FATO QUÍMICO</span>
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
          <h2><span aria-hidden="true">01</span> ${current.state==='Não determinado'?'EM INVESTIGAÇÃO':'NO COTIDIANO'}</h2>
          <p>${escapeText(excerpt(story,235))}</p>
          <div class="ep-print-story-art" data-scene="${artIndex}-01" aria-hidden="true"></div>
        </section>
        <section class="ep-print-story">
          <h2><span aria-hidden="true">02</span> DA ORIGEM À OBTENÇÃO</h2>
          <p>${escapeText(excerpt(origin,235))}</p>
          <div class="ep-print-story-art" data-scene="${artIndex}-02" aria-hidden="true"></div>
        </section>
      </div>
      <footer class="ep-print-footer">
        <p><strong>Fontes e leitura:</strong> CIAAW, IUPAC, NIST e referências científicas detalhadas na ficha digital. Valores sem incerteza informada não são medidas exatas. O estado indicado refere-se à substância simples.</p>
        <div class="ep-print-signature"><span>IFBA · Campus Vitória da Conquista</span><span>Folheto ${String(current.z).padStart(3,'0')}</span></div>
      </footer>`;
    // PILOTO 001 — Hidrogênio: somente as duas artes integrais previamente aprovadas.
    // Os textos HTML permanecem acessíveis, mas não são duplicados no folheto.
    if(current.z===1 && document.body.dataset.folhetoPiloto==='hidrogenio'){
      sheet.dataset.printPhase='piloto-quadros-integrais';
      const captions=[
        'No cotidiano: o hidrogênio participa da composição da água e de inúmeras substâncias orgânicas.',
        'Da origem à obtenção: reforma a vapor do metano ou eletrólise da água; hidrogênio verde por eletrólise com energia renovável.'
      ];
      for(const [i,slot] of [...sheet.querySelectorAll('.ep-print-story-art')].entries()){
        const panel=slot.closest('.ep-print-story');
        panel.setAttribute('aria-label',captions[i]);
        const figure=document.createElement('img');
        figure.className='ep-print-approved-art';
        figure.alt='';
        figure.loading='eager';figure.decoding='sync';
        figure.src='../../assets/folhetos/cenas/001-0'+(i+1)+'.webp?fit='+(i===1?'full-border-h001-v2-right-intact':'full-border-h001-v1');
        figure.addEventListener('load',()=>{
          if(figure.naturalWidth>0){
            slot.replaceChildren(figure);
            panel.dataset.sceneReady='true';
          }
        },{once:true});
        figure.addEventListener('error',()=>{panel.dataset.sceneError='true';},{once:true});
      }
    }
    // PILOTO 002 — Hélio: duas artes aprovadas completas, sem títulos HTML duplicados.
    if(current.z===2 && document.body.dataset.folhetoPiloto==='helio'){
      sheet.dataset.printPhase='piloto-quadros-integrais';
      const captions=[
        'No cotidiano: o hélio é menos denso que o ar e tem baixa reatividade química.',
        'Da origem à obtenção: o hélio é separado de algumas reservas de gás natural e purificado industrialmente.'
      ];
      for(const [i,slot] of [...sheet.querySelectorAll('.ep-print-story-art')].entries()){
        const panel=slot.closest('.ep-print-story');
        panel.setAttribute('aria-label',captions[i]);
        const figure=document.createElement('img');
        figure.className='ep-print-approved-art';
        figure.alt='';
        figure.loading='eager';figure.decoding='sync';
        figure.src='../../assets/folhetos/cenas/002-0'+(i+1)+'.webp?fit=he002-bordas-integrais-v1';
        figure.addEventListener('load',()=>{
          if(figure.naturalWidth>0){
            slot.replaceChildren(figure);
            panel.dataset.sceneReady='true';
          }
        },{once:true});
        figure.addEventListener('error',()=>{panel.dataset.sceneError='true';},{once:true});
      }
    }
    // PILOTO 004 — Berílio: quadros 01 e 02 aprovados; arte original integral e texto sem duplicação.
    if(current.z===4 && document.body.dataset.folhetoPiloto==='berilio'){
      sheet.dataset.printPhase='piloto-quadros-integrais';
      const captions=[
        'No cotidiano: em ligas com cobre, o berílio aumenta a resistência de molas e contatos elétricos.',
        'Da origem à obtenção: minerais como o berilo fornecem berílio, obtido por concentração e tratamento químico industrial.'
      ];
      for(const [i,slot] of [...sheet.querySelectorAll('.ep-print-story-art')].entries()){
        const panel=slot.closest('.ep-print-story');
        panel.setAttribute('aria-label',captions[i]);
        const figure=document.createElement('img');
        figure.className='ep-print-approved-art';
        figure.alt='';
        figure.loading='eager';figure.decoding='sync';
        figure.src='../../assets/folhetos/cenas/004-0'+(i+1)+'.webp?fit=b004-arte-aprovada-v1';
        figure.addEventListener('load',()=>{
          if(figure.naturalWidth>0){
            slot.replaceChildren(figure);
            panel.dataset.sceneReady='true';
          }
        },{once:true});
        figure.addEventListener('error',()=>{panel.dataset.sceneError='true';},{once:true});
      }
    }
    // PILOTO 006 — Carbono: quadros 01 e 02 aprovados; arte original integral e texto sem duplicação.
    if(current.z===6 && document.body.dataset.folhetoPiloto==='carbono'){
      sheet.dataset.printPhase='piloto-quadros-integrais';
      const captions=[
        'No cotidiano: o carbono está presente em materiais como grafite, diamante, plásticos e combustíveis, além de fazer parte dos seres vivos.',
        'Da origem à obtenção: o carbono ocorre em diferentes formas naturais e está presente em minerais, combustíveis fósseis e na biomassa.'
      ];
      for(const [i,slot] of [...sheet.querySelectorAll('.ep-print-story-art')].entries()){
        const panel=slot.closest('.ep-print-story');
        panel.setAttribute('aria-label',captions[i]);
        const figure=document.createElement('img');
        figure.className='ep-print-approved-art';
        figure.alt='';
        figure.loading='eager';figure.decoding='sync';
        figure.src='../../assets/folhetos/cenas/006-0'+(i+1)+'.webp?fit=c006-arte-aprovada-v1';
        figure.addEventListener('load',()=>{
          if(figure.naturalWidth>0){
            slot.replaceChildren(figure);
            panel.dataset.sceneReady='true';
          }
        },{once:true});
        figure.addEventListener('error',()=>{panel.dataset.sceneError='true';},{once:true});
      }
    }
    // PILOTO 007 — Nitrogênio: quadros 01 e 02 aprovados; arte original integral e texto sem duplicação.
    if(current.z===7 && document.body.dataset.folhetoPiloto==='nitrogenio'){
      sheet.dataset.printPhase='piloto-quadros-integrais';
      const captions=[
        'No cotidiano: o nitrogênio participa do ar e de fertilizantes, é utilizado em embalagens de alimentos e, na forma líquida, em aplicações de resfriamento.',
        'Da origem à obtenção: o nitrogênio gasoso é separado do ar por liquefação e destilação fracionada industriais.'
      ];
      for(const [i,slot] of [...sheet.querySelectorAll('.ep-print-story-art')].entries()){
        const panel=slot.closest('.ep-print-story');
        panel.setAttribute('aria-label',captions[i]);
        const figure=document.createElement('img');
        figure.className='ep-print-approved-art';
        figure.alt='';
        figure.loading='eager';figure.decoding='sync';
        figure.src='../../assets/folhetos/cenas/007-0'+(i+1)+'.webp?fit=n007-arte-aprovada-v1';
        figure.addEventListener('load',()=>{
          if(figure.naturalWidth>0){
            slot.replaceChildren(figure);
            panel.dataset.sceneReady='true';
          }
        },{once:true});
        figure.addEventListener('error',()=>{panel.dataset.sceneError='true';},{once:true});
      }
    }
    // PILOTO 008 — Oxigênio: quadros 01 e 02 aprovados; arte original integral e texto sem duplicação.
    if(current.z===8 && document.body.dataset.folhetoPiloto==='oxigenio'){
      sheet.dataset.printPhase='piloto-quadros-integrais';
      const captions=[
        'No cotidiano: o oxigênio molecular participa da respiração de muitos seres vivos e é utilizado na assistência médica; compostos de oxigênio aparecem na água e em outros materiais.',
        'Da origem à obtenção: o gás oxigênio pode ser separado industrialmente do ar por liquefação e destilação fracionada.'
      ];
      for(const [i,slot] of [...sheet.querySelectorAll('.ep-print-story-art')].entries()){
        const panel=slot.closest('.ep-print-story');
        panel.setAttribute('aria-label',captions[i]);
        const figure=document.createElement('img');
        figure.className='ep-print-approved-art';
        figure.alt='';
        figure.loading='eager';figure.decoding='sync';
        figure.src='../../assets/folhetos/cenas/008-0'+(i+1)+'.webp?fit=o008-arte-aprovada-v1';
        figure.addEventListener('load',()=>{
          if(figure.naturalWidth>0){
            slot.replaceChildren(figure);
            panel.dataset.sceneReady='true';
          }
        },{once:true});
        figure.addEventListener('error',()=>{panel.dataset.sceneError='true';},{once:true});
      }
    }
    // PILOTO 009 — Flúor: quadros 01 e 02 aprovados; arte original integral e texto sem duplicação.
    if(current.z===9 && document.body.dataset.folhetoPiloto==='fluor'){
      sheet.dataset.printPhase='piloto-quadros-integrais';
      const captions=[
        'No cotidiano: produtos como cremes dentais e enxaguantes podem conter íons fluoreto, distintos do gás flúor, contribuindo para a prevenção de cáries.',
        'Da origem à obtenção: a fluorita, mineral de fórmula CaF₂, é matéria-prima de processos industriais para obter compostos de flúor, como o fluoreto de hidrogênio.'
      ];
      for(const [i,slot] of [...sheet.querySelectorAll('.ep-print-story-art')].entries()){
        const panel=slot.closest('.ep-print-story');
        panel.setAttribute('aria-label',captions[i]);
        const figure=document.createElement('img');
        figure.className='ep-print-approved-art';
        figure.alt='';
        figure.loading='eager';figure.decoding='sync';
        figure.src='../../assets/folhetos/cenas/009-0'+(i+1)+'.webp?fit=f009-arte-aprovada-v2';
        figure.addEventListener('load',()=>{
          if(figure.naturalWidth>0){
            slot.replaceChildren(figure);
            panel.dataset.sceneReady='true';
          }
        },{once:true});
        figure.addEventListener('error',()=>{panel.dataset.sceneError='true';},{once:true});
      }
    }
    // PILOTO 010 — Neônio: quadros 01 e 02 aprovados; arte original integral e texto sem duplicação.
    if(current.z===10 && document.body.dataset.folhetoPiloto==='neonio'){
      sheet.dataset.printPhase='piloto-quadros-integrais';
      const captions=[
        'No cotidiano: o neônio em tubos de descarga luminosa emite luz vermelho-alaranjada quando excitado eletricamente.',
        'Da origem à obtenção: o gás neônio é recuperado industrialmente de frações do ar liquefeito, por separação criogênica e purificação.'
      ];
      for(const [i,slot] of [...sheet.querySelectorAll('.ep-print-story-art')].entries()){
        const panel=slot.closest('.ep-print-story');
        panel.setAttribute('aria-label',captions[i]);
        const figure=document.createElement('img');
        figure.className='ep-print-approved-art';
        figure.alt='';
        figure.loading='eager';figure.decoding='sync';
        figure.src='../../assets/folhetos/cenas/010-0'+(i+1)+'.webp?fit=ne010-arte-aprovada-v1';
        figure.addEventListener('load',()=>{
          if(figure.naturalWidth>0){
            slot.replaceChildren(figure);
            panel.dataset.sceneReady='true';
          }
        },{once:true});
        figure.addEventListener('error',()=>{panel.dataset.sceneError='true';},{once:true});
      }
    }
    // PILOTO 011 — Sódio: quadros 01 e 02 aprovados; arte original integral e texto sem duplicação.
    if(current.z===11 && document.body.dataset.folhetoPiloto==='sodio'){
      sheet.dataset.printPhase='piloto-quadros-integrais';
      const captions=[
        'No cotidiano: o sal de cozinha contém sódio na forma de íons Na+ no cloreto de sódio, NaCl; não se trata de sódio metálico.',
        'Da origem à obtenção: o sódio metálico é produzido industrialmente pela eletrólise de cloreto de sódio fundido, com formação separada de cloro gasoso.'
      ];
      for(const [i,slot] of [...sheet.querySelectorAll('.ep-print-story-art')].entries()){
        const panel=slot.closest('.ep-print-story');
        panel.setAttribute('aria-label',captions[i]);
        const figure=document.createElement('img');
        figure.className='ep-print-approved-art';
        figure.alt='';
        figure.loading='eager';figure.decoding='sync';
        figure.src='../../assets/folhetos/cenas/011-0'+(i+1)+'.webp?fit=na011-arte-aprovada-v1';
        figure.addEventListener('load',()=>{
          if(figure.naturalWidth>0){
            slot.replaceChildren(figure);
            panel.dataset.sceneReady='true';
          }
        },{once:true});
        figure.addEventListener('error',()=>{panel.dataset.sceneError='true';},{once:true});
      }
    }
    // PILOTO 012 — Magnésio: quadros 01 e 02 aprovados; arte original integral e texto sem duplicação.
    if(current.z===12 && document.body.dataset.folhetoPiloto==='magnesio'){
      sheet.dataset.printPhase='piloto-quadros-integrais';
      const captions=[
        'No cotidiano: o magnésio participa de compostos presentes em alimentos, antiácidos e suplementos, e também integra ligas metálicas leves utilizadas em alguns produtos.',
        'Da origem à obtenção: o magnésio metálico pode ser obtido de minerais como magnesita e dolomita ou de sais de água do mar, por rotas industriais de redução ou eletrólise.'
      ];
      for(const [i,slot] of [...sheet.querySelectorAll('.ep-print-story-art')].entries()){
        const panel=slot.closest('.ep-print-story');
        panel.setAttribute('aria-label',captions[i]);
        const figure=document.createElement('img');
        figure.className='ep-print-approved-art';
        figure.alt='';
        figure.loading='eager';figure.decoding='sync';
        figure.src='../../assets/folhetos/cenas/012-0'+(i+1)+'.webp?fit=mg012-arte-aprovada-v1';
        figure.addEventListener('load',()=>{
          if(figure.naturalWidth>0){
            slot.replaceChildren(figure);
            panel.dataset.sceneReady='true';
          }
        },{once:true});
        figure.addEventListener('error',()=>{panel.dataset.sceneError='true';},{once:true});
      }
    }
    // PILOTO 013 — Alumínio: quadros 01 e 02 aprovados; arte original integral e texto sem duplicação.
    if(current.z===13 && document.body.dataset.folhetoPiloto==='aluminio'){
      sheet.dataset.printPhase='piloto-quadros-integrais';
      const captions=[
        'No cotidiano: o alumínio é empregado em latas, papel-alumínio, embalagens, utensílios, estruturas, construção e veículos, por sua leveza e resistência à corrosão.',
        'Da origem à obtenção: a bauxita é processada para obter alumina, Al2O3, e a produção do alumínio metálico usa eletrólise ígnea pelo processo Hall-Héroult.'
      ];
      for(const [i,slot] of [...sheet.querySelectorAll('.ep-print-story-art')].entries()){
        const panel=slot.closest('.ep-print-story');
        panel.setAttribute('aria-label',captions[i]);
        const figure=document.createElement('img');
        figure.className='ep-print-approved-art';
        figure.alt='';
        figure.loading='eager';figure.decoding='sync';
        figure.src='../../assets/folhetos/cenas/013-0'+(i+1)+'.webp?fit=al013-arte-aprovada-v1';
        figure.addEventListener('load',()=>{
          if(figure.naturalWidth>0){
            slot.replaceChildren(figure);
            panel.dataset.sceneReady='true';
          }
        },{once:true});
        figure.addEventListener('error',()=>{panel.dataset.sceneError='true';},{once:true});
      }
    }

    // PACOTE 031–035 — preparação segura: só ativa quadros após carregar
    // as duas artes integrais já incorporadas ao repositório.
    if(current.z===33 || (current.z>=36 && current.z<=118)){
      const slots=[...sheet.querySelectorAll('.ep-print-story-art')];
      if(slots.length===2){
        const staged=[null,null];
        slots.forEach((slot,i)=>{
          const figure=document.createElement('img');
          figure.className='ep-print-approved-art';
          figure.alt=''; figure.loading='eager'; figure.decoding='sync';
          figure.addEventListener('load',()=>{
            if(figure.naturalWidth!==1104 || figure.naturalHeight!==810)return;
            staged[i]=figure;
            if(staged.every(Boolean)){
              slots.forEach((target,j)=>{
                target.replaceChildren(staged[j]);
                target.closest('.ep-print-story').dataset.sceneReady='true';
              });
              sheet.classList.add('ep-print-approved-series');
              sheet.dataset.printPhase='piloto-quadros-integrais';
            }
          },{once:true});
          figure.addEventListener('error',()=>{slot.closest('.ep-print-story').dataset.sceneError='true';},{once:true});
          figure.src='../../assets/folhetos/cenas/'+String(current.z).padStart(3,'0')+'-0'+(i+1)+'.webp?fit=approved-036-118-v1';
        });
      }
    }
    const queuedApprovals={
      31:{slug:'galio',captions:[
        'No cotidiano: compostos de gálio, como GaN e GaAs, são empregados em LEDs, lasers e componentes eletrônicos.',
        'Da origem à obtenção: gálio recuperado como subproduto do processamento de bauxita e de minérios de zinco, seguido de purificação.'
      ]},
      32:{slug:'germanio',captions:[
        'No cotidiano: germânio e seus compostos em óptica infravermelha, semicondutores e fibras ópticas.',
        'Da origem à obtenção: germânio recuperado de correntes de processamento de minérios de zinco e de outros materiais, seguido de purificação.'
      ]},
      34:{slug:'selenio',captions:[
        'No cotidiano: selênio presente em materiais tecnológicos e como micronutriente; distinguir selênio e seus compostos.',
        'Da origem à obtenção: recuperação de selênio a partir de lamas anódicas do refino eletrolítico de cobre.'
      ]},
      35:{slug:'bromo',captions:[
        'No cotidiano: brometo de prata em materiais fotográficos tradicionais, diferente do bromo molecular.',
        'Da origem à obtenção: bromo obtido de brometos presentes em salmouras por oxidação, separação e purificação.'
      ]}
    };
    const approval=queuedApprovals[current.z];
    if(approval && document.body.dataset.folhetoPiloto===approval.slug){
      const slots=[...sheet.querySelectorAll('.ep-print-story-art')];
      if(slots.length===2){
        const staged=[null,null];
        approval.captions.forEach((caption,i)=>{
          const figure=document.createElement('img');
          figure.className='ep-print-approved-art';
          figure.alt='';
          figure.loading='eager';
          figure.decoding='sync';
          figure.addEventListener('load',()=>{
            if(figure.naturalWidth!==1104 || figure.naturalHeight!==810)return;
            staged[i]=figure;
            if(staged.every(Boolean)){
              slots.forEach((slot,j)=>{
                slot.replaceChildren(staged[j]);
                const panel=slot.closest('.ep-print-story');
                panel.setAttribute('aria-label',approval.captions[j]);
                panel.dataset.sceneReady='true';
              });
              sheet.dataset.printPhase='piloto-quadros-integrais';
            }
          },{once:true});
          figure.src='../../assets/folhetos/cenas/'
            +String(current.z).padStart(3,'0')+'-0'+(i+1)+'.webp?fit=approved-031-035';
        });
      }
    }
    // PILOTO 030 — Zinco: quadros 01 e 02 aprovados, arte integral.
    if(current.z===30 && document.body.dataset.folhetoPiloto==='zinco'){
      sheet.dataset.printPhase='piloto-quadros-integrais';
      const captions=[
        'No cotidiano: o zinco protege o aço da corrosão por galvanização, integra ligas como o latão, participa de pilhas e está presente em compostos usados em cosméticos; também é um nutriente essencial.',
        'Da origem à obtenção: esfalerita, smithsonita e hemimorfita são fontes minerais de zinco; após mineração e beneficiamento, processos de extração e refino produzem zinco metálico, também recuperável por reciclagem.'
      ];
      for(const [i,slot] of [...sheet.querySelectorAll('.ep-print-story-art')].entries()){
        const panel=slot.closest('.ep-print-story');
        panel.setAttribute('aria-label',captions[i]);
        const figure=document.createElement('img');
        figure.className='ep-print-approved-art';
        figure.alt='';
        figure.loading='eager';figure.decoding='sync';
        figure.src='../../assets/folhetos/cenas/030-0'+(i+1)+'.webp?fit=zn030-quadros-integrais-v2';
        figure.addEventListener('load',()=>{
          if(figure.naturalWidth===1104 && figure.naturalHeight===810){
            slot.replaceChildren(figure);
            panel.dataset.sceneReady='true';
          }
        },{once:true});
        figure.addEventListener('error',()=>{panel.dataset.sceneError='true';},{once:true});
      }
    }
    // PILOTO 029 — Cobre: quadros 01 e 02 aprovados, arte integral.
    if(current.z===29 && document.body.dataset.folhetoPiloto==='cobre'){
      sheet.dataset.printPhase='piloto-quadros-integrais';
      const captions=[
        'No cotidiano: o cobre é utilizado em fios e cabos elétricos, componentes eletrônicos, tubulações, ligas metálicas e utensílios.',
        'Da origem à obtenção: minérios de cobre, como calcopirita, malaquita e cuprita, são extraídos e beneficiados, passando por processos de separação, fundição e refino; o cobre também pode ser reciclado.'
      ];
      for(const [i,slot] of [...sheet.querySelectorAll('.ep-print-story-art')].entries()){
        const panel=slot.closest('.ep-print-story');
        panel.setAttribute('aria-label',captions[i]);
        const figure=document.createElement('img');
        figure.className='ep-print-approved-art';
        figure.alt='';
        figure.loading='eager';figure.decoding='sync';
        figure.src='../../assets/folhetos/cenas/029-0'+(i+1)+'.webp?fit=cu029-quadros-integrais-v2';
        figure.addEventListener('load',()=>{
          if(figure.naturalWidth===1104 && figure.naturalHeight===810){
            slot.replaceChildren(figure);
            panel.dataset.sceneReady='true';
          }
        },{once:true});
        figure.addEventListener('error',()=>{panel.dataset.sceneError='true';},{once:true});
      }
    }
    // PILOTO 028 — Níquel: artes aprovadas com Moldura A orgânica.
    if(current.z===28 && document.body.dataset.folhetoPiloto==='niquel'){
      sheet.dataset.printPhase='piloto-quadros-integrais';
      const captions=[
        'No cotidiano: níquel presente em aços inoxidáveis e outras ligas metálicas, em revestimentos contra corrosão, moedas, determinados tipos de baterias e utensílios.',
        'Da origem à obtenção: níquel extraído de minérios sulfetados e lateríticos, com beneficiamento e processamento metalúrgico ou hidrometalúrgico para obtenção do metal.'
      ];
      for(const [i,slot] of [...sheet.querySelectorAll('.ep-print-story-art')].entries()){
        const panel=slot.closest('.ep-print-story');
        panel.setAttribute('aria-label',captions[i]);
        const figure=document.createElement('img');
        figure.className='ep-print-approved-art';
        figure.alt='';
        figure.loading='eager';figure.decoding='sync';
        figure.src='../../assets/folhetos/cenas/028-0'+(i+1)+'.webp?fit=ni028-moldura-discreta-v1';
        figure.addEventListener('load',()=>{
          if(figure.naturalWidth>0){
            slot.replaceChildren(figure);
            panel.dataset.sceneReady='true';
          }
        },{once:true});
        figure.addEventListener('error',()=>{panel.dataset.sceneError='true';},{once:true});
      }
    }
    // PILOTO 027 — Cobalto: artes aprovadas com Moldura A orgânica.
    if(current.z===27 && document.body.dataset.folhetoPiloto==='cobalto'){
      sheet.dataset.printPhase='piloto-quadros-integrais';
      const captions=[
        'No cotidiano: compostos de cobalto em determinadas baterias recarregáveis e pigmentos; cobalto também participa de superligas e outras aplicações industriais.',
        'Da origem à obtenção: recuperação do cobalto de minérios associados ao níquel e cobre, seguida de beneficiamento e refino para obter cobalto metálico ou sais.'
      ];
      for(const [i,slot] of [...sheet.querySelectorAll('.ep-print-story-art')].entries()){
        const panel=slot.closest('.ep-print-story');
        panel.setAttribute('aria-label',captions[i]);
        const figure=document.createElement('img');
        figure.className='ep-print-approved-art';
        figure.alt='';
        figure.loading='eager';figure.decoding='sync';
        figure.src='../../assets/folhetos/cenas/027-0'+(i+1)+'.webp?fit=co027-moldura-discreta-v1';
        figure.addEventListener('load',()=>{
          if(figure.naturalWidth>0){
            slot.replaceChildren(figure);
            panel.dataset.sceneReady='true';
          }
        },{once:true});
        figure.addEventListener('error',()=>{panel.dataset.sceneError='true';},{once:true});
      }
    }
    // PILOTO 026 — Ferro: artes aprovadas com Moldura A orgânica.
    if(current.z===26 && document.body.dataset.folhetoPiloto==='ferro'){
      sheet.dataset.printPhase='piloto-quadros-integrais';
      const captions=[
        'No cotidiano: ferro e aços em infraestrutura, pontes, trilhos, construções, ferramentas, veículos, utensílios e eletrodomésticos.',
        'Da origem à obtenção: minérios de ferro como hematita e magnetita são extraídos e beneficiados; o alto-forno produz ferro-gusa, refinado para obter aço.'
      ];
      for(const [i,slot] of [...sheet.querySelectorAll('.ep-print-story-art')].entries()){
        const panel=slot.closest('.ep-print-story');
        panel.setAttribute('aria-label',captions[i]);
        const figure=document.createElement('img');
        figure.className='ep-print-approved-art';
        figure.alt='';
        figure.loading='eager';figure.decoding='sync';
        figure.src='../../assets/folhetos/cenas/026-0'+(i+1)+'.webp?fit=fe026-moldura-discreta-v1';
        figure.addEventListener('load',()=>{
          if(figure.naturalWidth>0){
            slot.replaceChildren(figure);
            panel.dataset.sceneReady='true';
          }
        },{once:true});
        figure.addEventListener('error',()=>{panel.dataset.sceneError='true';},{once:true});
      }
    }
    // PILOTO 025 — Manganês: artes aprovadas com Moldura A orgânica.
    if(current.z===25 && document.body.dataset.folhetoPiloto==='manganes'){
      sheet.dataset.printPhase='piloto-quadros-integrais';
      const captions=[
        'No cotidiano: o manganês participa da fabricação de ligas de aço; o dióxido de manganês é usado em pilhas e alguns compostos de manganês em fertilizantes.',
        'Da origem à obtenção: minérios de manganês, como a pirolusita, são extraídos, beneficiados e processados para produzir manganês metálico ou ligas como ferromanganês.'
      ];
      for(const [i,slot] of [...sheet.querySelectorAll('.ep-print-story-art')].entries()){
        const panel=slot.closest('.ep-print-story');
        panel.setAttribute('aria-label',captions[i]);
        const figure=document.createElement('img');
        figure.className='ep-print-approved-art';
        figure.alt='';
        figure.loading='eager';figure.decoding='sync';
        figure.src='../../assets/folhetos/cenas/025-0'+(i+1)+'.webp?fit=mn025-sem-nome-dimensoes-v3';
        figure.addEventListener('load',()=>{
          if(figure.naturalWidth>0){
            slot.replaceChildren(figure);
            panel.dataset.sceneReady='true';
          }
        },{once:true});
        figure.addEventListener('error',()=>{panel.dataset.sceneError='true';},{once:true});
      }
    }
    // PILOTO 024 — Cromo: artes aprovadas com Moldura A orgânica.
    if(current.z===24 && document.body.dataset.folhetoPiloto==='cromo'){
      sheet.dataset.printPhase='piloto-quadros-integrais';
      const captions=[
        'No cotidiano: o cromo é utilizado em revestimentos e ligas, incluindo aço inoxidável, conferindo resistência à corrosão a diversas peças e utensílios.',
        'Da origem à obtenção: a cromita é extraída e beneficiada; o processamento metalúrgico pode produzir ferrocromo, utilizado na fabricação de aços inoxidáveis.'
      ];
      for(const [i,slot] of [...sheet.querySelectorAll('.ep-print-story-art')].entries()){
        const panel=slot.closest('.ep-print-story');
        panel.setAttribute('aria-label',captions[i]);
        const figure=document.createElement('img');
        figure.className='ep-print-approved-art';
        figure.alt='';
        figure.loading='eager';figure.decoding='sync';
        figure.src='../../assets/folhetos/cenas/024-0'+(i+1)+'.webp?fit=cr024-sem-nome-dimensoes-v3';
        figure.addEventListener('load',()=>{
          if(figure.naturalWidth>0){
            slot.replaceChildren(figure);
            panel.dataset.sceneReady='true';
          }
        },{once:true});
        figure.addEventListener('error',()=>{panel.dataset.sceneError='true';},{once:true});
      }
    }
    // PILOTO 023 — Vanádio: artes aprovadas com Moldura A orgânica.
    if(current.z===23 && document.body.dataset.folhetoPiloto==='vanadio'){
      sheet.dataset.printPhase='piloto-quadros-integrais';
      const captions=[
        'No cotidiano: o vanádio é usado em ligas metálicas, especialmente aços para ferramentas, molas e peças que exigem maior resistência.',
        'Da origem à obtenção: o vanádio pode ser recuperado de minérios e de escórias siderúrgicas e processado para obtenção de ferrovanádio utilizado na produção de aços.'
      ];
      for(const [i,slot] of [...sheet.querySelectorAll('.ep-print-story-art')].entries()){
        const panel=slot.closest('.ep-print-story');
        panel.setAttribute('aria-label',captions[i]);
        const figure=document.createElement('img');
        figure.className='ep-print-approved-art';
        figure.alt='';
        figure.loading='eager';figure.decoding='sync';
        figure.src='../../assets/folhetos/cenas/023-0'+(i+1)+'.webp?fit=v023-moldura-a-v1';
        figure.addEventListener('load',()=>{
          if(figure.naturalWidth>0){
            slot.replaceChildren(figure);
            panel.dataset.sceneReady='true';
          }
        },{once:true});
        figure.addEventListener('error',()=>{panel.dataset.sceneError='true';},{once:true});
      }
    }
    // PILOTO 022 — Titânio: artes aprovadas com Moldura A orgânica.
    if(current.z===22 && document.body.dataset.folhetoPiloto==='titanio'){
      sheet.dataset.printPhase='piloto-quadros-integrais';
      const captions=[
        'No cotidiano: titânio metálico em implantes e componentes resistentes à corrosão; dióxido de titânio TiO2 em pigmentos brancos.',
        'Da origem à obtenção: ilmenita e rutilo são extraídos, beneficiados e processados para produzir dióxido de titânio TiO2 destinado a pigmentos.'
      ];
      for(const [i,slot] of [...sheet.querySelectorAll('.ep-print-story-art')].entries()){
        const panel=slot.closest('.ep-print-story');
        panel.setAttribute('aria-label',captions[i]);
        const figure=document.createElement('img');
        figure.className='ep-print-approved-art';
        figure.alt='';
        figure.loading='eager';figure.decoding='sync';
        figure.src='../../assets/folhetos/cenas/022-0'+(i+1)+'.webp?fit=ti022-moldura-a-v1';
        figure.addEventListener('load',()=>{
          if(figure.naturalWidth>0){
            slot.replaceChildren(figure);
            panel.dataset.sceneReady='true';
          }
        },{once:true});
        figure.addEventListener('error',()=>{panel.dataset.sceneError='true';},{once:true});
      }
    }
    // PILOTO 021 — Escândio: quadros aprovados com Moldura A — Xilogravura orgânica.
    if(current.z===21 && document.body.dataset.folhetoPiloto==='escandio'){
      sheet.dataset.printPhase='piloto-quadros-integrais';
      const captions=[
        'No cotidiano: pequenas adições de escândio a ligas de alumínio podem produzir componentes leves e resistentes em bicicletas e equipamentos especializados.',
        'Da origem à obtenção: o escândio pode ser recuperado como subproduto mineral; purifica-se até obter óxido Sc2O3 e, por redução posterior, escândio metálico.'
      ];
      for(const [i,slot] of [...sheet.querySelectorAll('.ep-print-story-art')].entries()){
        const panel=slot.closest('.ep-print-story');
        panel.setAttribute('aria-label',captions[i]);
        const figure=document.createElement('img');
        figure.className='ep-print-approved-art';
        figure.alt='';
        figure.loading='eager';figure.decoding='sync';
        figure.src='../../assets/folhetos/cenas/021-0'+(i+1)+'.webp?fit=sc021-moldura-a-v1';
        figure.addEventListener('load',()=>{
          if(figure.naturalWidth>0){
            slot.replaceChildren(figure);
            panel.dataset.sceneReady='true';
          }
        },{once:true});
        figure.addEventListener('error',()=>{panel.dataset.sceneError='true';},{once:true});
      }
    }
    // PILOTO 020 — Cálcio: quadros aprovados, molduras integrais, sem margens adicionais.
    if(current.z===20 && document.body.dataset.folhetoPiloto==='calcio'){
      sheet.dataset.printPhase='piloto-quadros-integrais';
      const captions=[
        'No cotidiano: o cálcio, presente em alimentos como laticínios, verduras e feijões, participa da formação de ossos e dentes e de funções neuromusculares.',
        'Da origem à obtenção: compostos de cálcio presentes em calcário, mármore e dolomita são extraídos e processados para produzir cal, cimento e corretivos do solo.'
      ];
      for(const [i,slot] of [...sheet.querySelectorAll('.ep-print-story-art')].entries()){
        const panel=slot.closest('.ep-print-story');
        panel.setAttribute('aria-label',captions[i]);
        const figure=document.createElement('img');
        figure.className='ep-print-approved-art';
        figure.alt='';
        figure.loading='eager';figure.decoding='sync';
        figure.src='../../assets/folhetos/cenas/020-0'+(i+1)+'.webp?fit=ca020-aprovado-integral-v1';
        figure.addEventListener('load',()=>{
          if(figure.naturalWidth>0){
            slot.replaceChildren(figure);
            panel.dataset.sceneReady='true';
          }
        },{once:true});
        figure.addEventListener('error',()=>{panel.dataset.sceneError='true';},{once:true});
      }
    }
    // PILOTO 019 — Potássio: quadros 01 e 02 aprovados, integrais e sem margens extras.
    if(current.z===19 && document.body.dataset.folhetoPiloto==='potassio'){
      sheet.dataset.printPhase='piloto-quadros-integrais';
      const captions=[
        'No cotidiano: o potássio aparece como íons K+ nos seres vivos e em alimentos; compostos potássicos são utilizados em fertilizantes.',
        'Da origem à obtenção: minerais como silvita e carnalita fornecem sais de potássio, obtidos por mineração e processamento industrial para uso em fertilizantes.'
      ];
      for(const [i,slot] of [...sheet.querySelectorAll('.ep-print-story-art')].entries()){
        const panel=slot.closest('.ep-print-story');
        panel.setAttribute('aria-label',captions[i]);
        const figure=document.createElement('img');
        figure.className='ep-print-approved-art';
        figure.alt='';
        figure.loading='eager';figure.decoding='sync';
        figure.src='../../assets/folhetos/cenas/019-0'+(i+1)+'.webp?fit=k019-quadro-integral-v1';
        figure.addEventListener('load',()=>{
          if(figure.naturalWidth>0){
            slot.replaceChildren(figure);
            panel.dataset.sceneReady='true';
          }
        },{once:true});
        figure.addEventListener('error',()=>{panel.dataset.sceneError='true';},{once:true});
      }
    }
    // PILOTO 018 — Argônio: quadros 01 e 02 aprovados, arte integral sem margem extra.
    if(current.z===18 && document.body.dataset.folhetoPiloto==='argonio'){
      sheet.dataset.printPhase='piloto-quadros-integrais';
      const captions=[
        'No cotidiano: o argônio, gás nobre pouco reativo, é utilizado como gás de proteção na soldagem e também em algumas lâmpadas e janelas de vidro duplo.',
        'Da origem à obtenção: presente em cerca de 0,93% do ar atmosférico, o argônio é obtido industrialmente por separação criogênica do ar.'
      ];
      for(const [i,slot] of [...sheet.querySelectorAll('.ep-print-story-art')].entries()){
        const panel=slot.closest('.ep-print-story');
        panel.setAttribute('aria-label',captions[i]);
        const figure=document.createElement('img');
        figure.className='ep-print-approved-art';
        figure.alt='';
        figure.loading='eager';figure.decoding='sync';
        figure.src='../../assets/folhetos/cenas/018-0'+(i+1)+'.webp?fit=ar018-integral-v1';
        figure.addEventListener('load',()=>{
          if(figure.naturalWidth>0){
            slot.replaceChildren(figure);
            panel.dataset.sceneReady='true';
          }
        },{once:true});
        figure.addEventListener('error',()=>{panel.dataset.sceneError='true';},{once:true});
      }
    }
    // PILOTO 017 — Cloro: quadros 01 e 02 aprovados em artes independentes.
    if(current.z===17 && document.body.dataset.folhetoPiloto==='cloro'){
      sheet.dataset.printPhase='piloto-quadros-integrais';
      const captions=[
        'No cotidiano: o tratamento de água e produtos como água sanitária utilizam compostos de cloro para reduzir microrganismos; produtos domésticos não contêm gás cloro livre.',
        'Da origem à obtenção: a eletrólise de uma solução aquosa de cloreto de sódio produz cloro, hidrogênio e hidróxido de sódio em processo industrial.'
      ];
      for(const [i,slot] of [...sheet.querySelectorAll('.ep-print-story-art')].entries()){
        const panel=slot.closest('.ep-print-story');
        panel.setAttribute('aria-label',captions[i]);
        const figure=document.createElement('img');
        figure.className='ep-print-approved-art';
        figure.alt='';
        figure.loading='eager';figure.decoding='sync';
        figure.src='../../assets/folhetos/cenas/017-0'+(i+1)+'.webp?fit=cl017-preenchimento-integral-v2';
        figure.addEventListener('load',()=>{
          if(figure.naturalWidth>0){
            slot.replaceChildren(figure);
            panel.dataset.sceneReady='true';
          }
        },{once:true});
        figure.addEventListener('error',()=>{panel.dataset.sceneError='true';},{once:true});
      }
    }
    // PILOTO 016 — Enxofre: quadros 01 e 02 aprovados em vinhetas integrais.
    if(current.z===16 && document.body.dataset.folhetoPiloto==='enxofre'){
      sheet.dataset.printPhase='piloto-quadros-integrais';
      const captions=[
        'No cotidiano: o enxofre é empregado na vulcanização da borracha, melhorando resistência e elasticidade, e na produção industrial de ácido sulfúrico.',
        'Da origem à obtenção: o sulfeto de hidrogênio presente no processamento de petróleo e gás natural é convertido em enxofre elementar pelo processo Claus.'
      ];
      for(const [i,slot] of [...sheet.querySelectorAll('.ep-print-story-art')].entries()){
        const panel=slot.closest('.ep-print-story');
        panel.setAttribute('aria-label',captions[i]);
        const figure=document.createElement('img');
        figure.className='ep-print-approved-art';
        figure.alt='';
        figure.loading='eager';figure.decoding='sync';
        figure.src='../../assets/folhetos/cenas/016-0'+(i+1)+'.webp?fit=s016-aprovado-v1';
        figure.addEventListener('load',()=>{
          if(figure.naturalWidth>0){
            slot.replaceChildren(figure);
            panel.dataset.sceneReady='true';
          }
        },{once:true});
        figure.addEventListener('error',()=>{panel.dataset.sceneError='true';},{once:true});
      }
    }
    // PILOTO 015 — Fósforo: quadros aprovados separadamente, arte original integral.
    if(current.z===15 && document.body.dataset.folhetoPiloto==='fosforo'){
      sheet.dataset.printPhase='piloto-quadros-integrais';
      const captions=[
        'No cotidiano: fósforo vermelho na faixa de atrito de caixas de fósforos de segurança; compostos fosfatados em fertilizantes e organismos vivos.',
        'Da origem à obtenção: rochas fosfatadas como apatita são processadas para produzir ácido fosfórico e fosfatos utilizados em fertilizantes e outros materiais.'
      ];
      for(const [i,slot] of [...sheet.querySelectorAll('.ep-print-story-art')].entries()){
        const panel=slot.closest('.ep-print-story');
        panel.setAttribute('aria-label',captions[i]);
        const figure=document.createElement('img');
        figure.className='ep-print-approved-art';
        figure.alt='';
        figure.loading='eager';figure.decoding='sync';
        figure.src='../../assets/folhetos/cenas/015-0'+(i+1)+'.webp?fit=p015-aprovado-v1';
        figure.addEventListener('load',()=>{
          if(figure.naturalWidth>0){
            slot.replaceChildren(figure);
            panel.dataset.sceneReady='true';
          }
        },{once:true});
        figure.addEventListener('error',()=>{panel.dataset.sceneError='true';},{once:true});
      }
    }
    // PILOTO 014 — Silício: quadros 01 e 02 aprovados; arte original integral e texto sem duplicação.
    if(current.z===14 && document.body.dataset.folhetoPiloto==='silicio'){
      sheet.dataset.printPhase='piloto-quadros-integrais';
      const captions=[
        'No cotidiano: o silício purificado é utilizado em microchips e células solares; vidros e cerâmicas podem conter compostos como sílica e silicatos, que não são silício elementar.',
        'Da origem à obtenção: a sílica, SiO2, presente no quartzo, é reduzida com carbono em forno elétrico para produzir silício metalúrgico, que pode ser posteriormente purificado para aplicações eletrônicas.'
      ];
      for(const [i,slot] of [...sheet.querySelectorAll('.ep-print-story-art')].entries()){
        const panel=slot.closest('.ep-print-story');
        panel.setAttribute('aria-label',captions[i]);
        const figure=document.createElement('img');
        figure.className='ep-print-approved-art';
        figure.alt='';
        figure.loading='eager';figure.decoding='sync';
        figure.src='../../assets/folhetos/cenas/014-0'+(i+1)+'.svg?fit=si014-sem-fundo-v3';
        figure.addEventListener('load',()=>{
          if(figure.naturalWidth>0){
            slot.replaceChildren(figure);
            panel.dataset.sceneReady='true';
          }
        },{once:true});
        figure.addEventListener('error',()=>{panel.dataset.sceneError='true';},{once:true});
      }
    }
    // PILOTO 005 — Boro: quadros 01 e 02 aprovados; arte original integral e texto sem duplicação.
    if(current.z===5 && document.body.dataset.folhetoPiloto==='boro'){
      sheet.dataset.printPhase='piloto-quadros-integrais';
      const captions=[
        'No cotidiano: compostos de boro são usados em vidros especiais e o boro-10 tem aplicações em absorção de nêutrons.',
        'Da origem à obtenção: boratos de depósitos evaporíticos, com posterior processamento para obtenção de boro elementar.'
      ];
      for(const [i,slot] of [...sheet.querySelectorAll('.ep-print-story-art')].entries()){
        const panel=slot.closest('.ep-print-story');
        panel.setAttribute('aria-label',captions[i]);
        const figure=document.createElement('img');
        figure.className='ep-print-approved-art';
        figure.alt='';
        figure.loading='eager';figure.decoding='sync';
        figure.src='../../assets/folhetos/cenas/005-0'+(i+1)+'.webp?fit=b005-arte-aprovada-v1';
        figure.addEventListener('load',()=>{
          if(figure.naturalWidth>0){
            slot.replaceChildren(figure);
            panel.dataset.sceneReady='true';
          }
        },{once:true});
        figure.addEventListener('error',()=>{panel.dataset.sceneError='true';},{once:true});
      }
    }
    // PILOTO 003 — Lítio: os dois quadrinhos são artes editoriais completas.
    // Não sobrepor numerador, título ou legenda HTML; preservá-los apenas em
    // texto acessível. Nenhuma outra ficha é modificada por esta experiência.
    if(current.z===3 && document.body.dataset.folhetoPiloto==='litio'){
      sheet.dataset.printPhase='piloto-quadros-integrais';
      const captions=[
        'No cotidiano: o lítio é usado em baterias recarregáveis de celulares, notebooks, ferramentas elétricas e veículos elétricos.',
        'Da origem à obtenção: é obtido principalmente de minerais presentes em salmouras e rochas, como o espodumênio, em minas a céu aberto e em depósitos de salmouras.'
      ];
      for(const [i,slot] of [...sheet.querySelectorAll('.ep-print-story-art')].entries()){
        const panel=slot.closest('.ep-print-story');
        panel.setAttribute('aria-label',captions[i]);
        const figure=document.createElement('img');
        figure.className='ep-print-approved-art';
        figure.alt='';
        figure.loading='eager';figure.decoding='sync';
        figure.src='../../assets/folhetos/cenas/003-0'+(i+1)+'.webp?fit=full-border-v2';
        figure.addEventListener('load',()=>{
          if(figure.naturalWidth>0){
            slot.replaceChildren(figure);
            panel.dataset.sceneReady='true';
          }
        },{once:true});
        figure.addEventListener('error',()=>{panel.dataset.sceneError='true';},{once:true});
      }
    }
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
