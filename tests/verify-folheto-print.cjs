// Impressão editorial A4: contrato estrutural para os 118 elementos.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=read('assets/element-page.js');
const css=read('assets/element-page.css');
const sw=read('sw.js');
const elements=JSON.parse(read('assets/elementos-fichas.json'));
new Function(js);new Function(sw);
assert.equal(elements.length,118);
assert.equal(new Set(elements.map(x=>x.z)).size,118);
for(const e of elements){
 const page=read('elementos/'+e.slug+'/index.html');
 assert.ok(page.includes('id="element-data"'),'model missing '+e.slug);
 assert.ok(page.includes('id="print-element"'),'print button missing '+e.slug);
 assert.ok(page.includes('class="ep-cover"'),'original cover missing '+e.slug);
 assert.ok(page.includes('id="referencias"'),'references missing '+e.slug);
}
for(const fragment of ['function makePrintSheet()',"const printSheet=makePrintSheet()",'document.body.append(sheet)','dataDisplay(\'radius\')','dataDisplay(\'fusion\')','current.predictedConfig','current.series'])assert.ok(js.includes(fragment),'missing JS: '+fragment);
for(const fragment of ['@page{size:A4 portrait;margin:0}','height:296mm!important','body.element-page > :not(.ep-print-sheet){display:none!important}','display:flex!important;align-items:center','.ep-print-comic-tag','.ep-print-bubble','.ep-print-art-panel','.ep-print-property-grid','.ep-print-signature'])assert.ok(css.includes(fragment),'missing CSS: '+fragment);
assert.match(sw,/const CACHE='cordel-varal-v[0-9]+(?:-[a-z0-9]+)*'/,'versioned PWA cache');
console.log('PASS: 118 elementos, modelo A4, valores, arte, quadrinhos, referências e impressão independente.');

const protos=new Map([[1,'ep-print-gas'],[6,'ep-print-solid'],[35,'ep-print-liquid'],[115,'ep-print-unknown']]);
for(const [z,cls] of protos){
 const el=elements.find(e=>e.z===z);assert.ok(el,'Missing prototype '+z);
 assert.ok(css.includes('.'+cls),'Missing state art direction '+cls);
}
assert.ok(js.includes('stateDirection'),'State directions must map explicitly to four sample elements');
assert.ok(js.includes('ep-print-scene-motif'),'Original artwork must be surrounded by graphical overlays');
console.log('PASS: quatro protótipos com estilos independentes e artes originais preservadas.');

const lithHtml=read('elementos/litio/index.html');
assert.ok(lithHtml.includes('data-folheto-piloto="litio"'),'Ativação do piloto ausente');
assert.ok(js.includes("current.z===3 && document.body.dataset.folhetoPiloto==='litio'"),'Pilot must be isolated to Lítio');
assert.ok(css.includes('grid-template-rows:15mm 8mm 96mm 65mm 67.5mm 14.5mm!important'),'A4 pilot grid changed');
assert.ok(css.includes('object-fit:contain!important'),'Pilot must not distort/crop art');
assert.ok(css.includes('1104x810 na impressão'),'Quadros devem usar fonte integral com proporção real');
assert.ok(js.includes('fit=full-border-v2'),'Lítio precisa invalidar os recortes antigos');
assert.ok(sw.includes('assets/folhetos/cenas/003-02.webp'),'PWA deve invalidar cache de cenas antigas');
assert.ok(js.includes('003-0'),'Two approved originals are required');
assert.ok(css.includes('column-gap:2mm!important'),'Quadros devem ter o espaço reduzido da referência aprovada');

assert.ok(!css.includes('Ajuste localizado de alinhamento, Lítio (003)'),'Remover remendo de alinhamento óptico antigo');
assert.ok(css.includes('grid-template-columns:repeat(2,minmax(0,1fr))!important'),'Quadros devem compartilhar largura exata');
assert.ok(!css.includes('transform:translateX(.55%) scaleX(.995)!important'),'Quadro 02 sem deslocamento artificial');

// PILOTO 001 — Hidrogênio: artes completas com a mesma geometria homologada do Lítio.
const hydroHtml=read('elementos/hidrogenio/index.html');
assert.ok(hydroHtml.includes('data-folheto-piloto="hidrogenio"'),'Piloto Hidrogênio não ativado');
assert.ok(js.includes("current.z===1 && document.body.dataset.folhetoPiloto==='hidrogenio'"),'JS do piloto 001 ausente');
assert.ok(css.includes('data-element="001"'),'CSS da moldura do piloto 001 ausente');
assert.ok(js.includes('fit=full-border-h001-v1'),'Cache da arte 001 não foi invalidado');
assert.ok(sw.includes('assets/folhetos/cenas/001-02.webp'),'SW precisa atualizar imagens 001');

// Regressão: fonte aprovada integral, sem mascarar lateral direita ou deformar o quadro.
assert.ok(!css.includes('transform:scaleY(.922)!important'),'Quadro 02 não deve ser comprimido no CSS');
assert.ok(js.includes('full-border-h001-v2-right-intact'),'Quadro 02 deve invalidar o cache do recorte incompleto');
assert.ok(js.includes("i===1?'full-border-h001-v2-right-intact':'full-border-h001-v1'"),'Quadro 01 precisa manter o arquivo homologado');
const rightArt=fs.readFileSync(path.join(root,'assets/folhetos/cenas/001-02.webp'));
assert.ok(rightArt.length>120000,'Quadro 02 deve conter raster integral revisado');
assert.equal(rightArt.toString('ascii',0,4),'RIFF','O arquivo de arte deve ser WebP válido');
assert.equal(rightArt.toString('ascii',8,12),'WEBP','O arquivo de arte deve ser WebP válido');


// PILOTO 002 — Hélio: somente as artes editoriais aprovadas e molduras completas.
const heliumHtml=read('elementos/helio/index.html');
assert.ok(heliumHtml.includes('data-folheto-piloto="helio"'),'Piloto Hélio não ativado');
assert.ok(js.includes("current.z===2 && document.body.dataset.folhetoPiloto==='helio'"),'Montagem do Hélio ausente');
assert.ok(css.includes('data-element="002"'),'Moldura A4 do Hélio ausente');
assert.ok(js.includes('fit=he002-bordas-integrais-v1'),'Hélio precisa evitar o cache anterior');
assert.ok(sw.includes('assets/folhetos/cenas/002-02.webp'),'Cache de cenas do Hélio não atualizado');
for(const i of ['01','02']){
  const file=fs.readFileSync(path.join(root,'assets/folhetos/cenas/002-'+i+'.webp'));
  assert.ok(file.length>150000,'Arte 002-'+i+' incompleta');
  assert.equal(file.toString('ascii',0,4),'RIFF','WebP Hélio inválido');
  assert.equal(file.toString('ascii',8,12),'WEBP','WebP Hélio inválido');
}

// PILOTO 005 — Boro: usar somente as duas artes aprovadas com quatro bordas.
const boronHtml=read('elementos/boro/index.html');
assert.ok(boronHtml.includes('data-folheto-piloto="boro"'),'Piloto Boro não ativado');
assert.ok(js.includes("current.z===5 && document.body.dataset.folhetoPiloto==='boro'"),'Montagem do Boro ausente');
assert.ok(css.includes('data-element="005"'),'Moldura A4 do Boro ausente');
assert.ok(js.includes('fit=b005-arte-aprovada-v1'),'Boro precisa invalidar cache anterior');
assert.ok(sw.includes('assets/folhetos/cenas/005-02.webp'),'SW precisa invalidar cache do Boro');
for(const i of ['01','02']){
  const file=fs.readFileSync(path.join(root,'assets/folhetos/cenas/005-'+i+'.webp'));
  assert.ok(file.length>200000,'Boro 005-'+i+': arte incompleta');
  assert.equal(file.toString('ascii',0,4),'RIFF','Boro WebP inválido');
  assert.equal(file.toString('ascii',8,12),'WEBP','Boro WebP inválido');
}


// PILOTO 004 — Berílio: duas ilustrações integrais aprovadas; sem legendas HTML sobrepostas.
const berylliumHtml=read('elementos/berilio/index.html');
assert.ok(berylliumHtml.includes('data-folheto-piloto="berilio"'),'Piloto Berílio não ativado');
assert.ok(js.includes("current.z===4 && document.body.dataset.folhetoPiloto==='berilio'"),'Montagem do Berílio ausente');
assert.ok(css.includes('data-element="004"'),'Moldura A4 do Berílio ausente');
assert.ok(js.includes('fit=b004-arte-aprovada-v1'),'Berílio precisa invalidar cache anterior');
assert.ok(sw.includes('assets/folhetos/cenas/004-01.webp'),'SW precisa preservar cache do Berílio');
const manifestBe=JSON.parse(read('data/folhetos-impressao-manifesto.json')).elements.find(e=>e.z===4);
assert.ok(manifestBe,'Manifesto Berílio ausente');
for(const i of ['01','02']){
  const expected='assets/folhetos/cenas/004-'+i+'.webp';
  const panel=manifestBe.panels.find(p=>p.id===i);
  assert.equal(panel.image,expected,'Manifesto Berílio '+i+' não aponta para arte aprovada');
  assert.equal(panel.status,'aprovada','Manifesto Berílio '+i+' sem homologação');
  assert.ok(sw.includes(expected),'Imagem Berílio '+i+' fora do cache offline');
  const file=fs.readFileSync(path.join(root,expected));
  assert.ok(file.length>200000,'Berílio '+i+': arte incompleta');
  assert.equal(file.toString('ascii',0,4),'RIFF','Berílio WebP inválido');
  assert.equal(file.toString('ascii',8,12),'WEBP','Berílio WebP inválido');
}


// PILOTO 006 — Carbono: duas vinhetas do conjunto aprovado, divididas sem redesenho.
const carbonHtml=read('elementos/carbono/index.html');
assert.ok(carbonHtml.includes('data-folheto-piloto="carbono"'),'Piloto Carbono não ativado');
assert.ok(js.includes("current.z===6 && document.body.dataset.folhetoPiloto==='carbono'"),'Montagem do Carbono ausente');
assert.ok(css.includes('data-element="006"'),'Moldura A4 do Carbono ausente');
assert.ok(js.includes('fit=c006-arte-aprovada-v1'),'Carbono precisa invalidar cache anterior');
assert.ok(sw.includes('assets/folhetos/cenas/006-01.webp'),'SW precisa preservar cache do Carbono');
const manifestC=JSON.parse(read('data/folhetos-impressao-manifesto.json')).elements.find(e=>e.z===6);
assert.ok(manifestC,'Manifesto Carbono ausente');
for(const i of ['01','02']){
  const expected='assets/folhetos/cenas/006-'+i+'.webp';
  const panel=manifestC.panels.find(p=>p.id===i);
  assert.equal(panel.image,expected,'Manifesto Carbono '+i+' sem arquivo aprovado');
  assert.equal(panel.status,'aprovada','Manifesto Carbono '+i+' não aprovado');
  assert.ok(sw.includes(expected),'Carbono '+i+' fora do cache');
  const file=fs.readFileSync(path.join(root,expected));
  assert.ok(file.length>200000,'Carbono '+i+': arte incompleta');
  assert.equal(file.toString('ascii',0,4),'RIFF','Carbono WebP inválido');
  assert.equal(file.toString('ascii',8,12),'WEBP','Carbono WebP inválido');
}


// PILOTO 007 — Nitrogênio: duas artes aprovadas preservando os quadros integrais.
const nitrogenHtml=read('elementos/nitrogenio/index.html');
assert.ok(nitrogenHtml.includes('data-folheto-piloto="nitrogenio"'),'Piloto Nitrogênio não ativado');
assert.ok(js.includes("current.z===7 && document.body.dataset.folhetoPiloto==='nitrogenio'"),'Montagem do Nitrogênio ausente');
assert.ok(css.includes('data-element="007"'),'Moldura A4 do Nitrogênio ausente');
assert.ok(js.includes('fit=n007-arte-aprovada-v1'),'Nitrogênio precisa invalidar cache');
assert.ok(sw.includes('assets/folhetos/cenas/007-01.webp'),'SW precisa preservar cache do Nitrogênio');
const manifestN=JSON.parse(read('data/folhetos-impressao-manifesto.json')).elements.find(e=>e.z===7);
assert.ok(manifestN,'Manifesto Nitrogênio ausente');
for(const i of ['01','02']){
  const asset='assets/folhetos/cenas/007-'+i+'.webp';
  const panel=manifestN.panels.find(p=>p.id===i);
  assert.equal(panel.image,asset,'Manifesto Nitrogênio '+i+' sem a arte aprovada');
  assert.equal(panel.status,'aprovada','Manifesto Nitrogênio '+i+' sem aprovação');
  assert.ok(sw.includes(asset),'Nitrogênio '+i+' fora do cache offline');
  const img=fs.readFileSync(path.join(root,asset));
  assert.ok(img.length>200000,'Nitrogênio '+i+': arte incompleta');
  assert.equal(img.toString('ascii',0,4),'RIFF','Nitrogênio WebP inválido');
  assert.equal(img.toString('ascii',8,12),'WEBP','Nitrogênio WebP inválido');
}


// PILOTO 008 — Oxigênio: duas artes aprovadas preservadas sem cortar as bordas.
const oxygenHtml=read('elementos/oxigenio/index.html');
assert.ok(oxygenHtml.includes('data-folheto-piloto="oxigenio"'),'Piloto Oxigênio não ativado');
assert.ok(js.includes("current.z===8 && document.body.dataset.folhetoPiloto==='oxigenio'"),'Montagem do Oxigênio ausente');
assert.ok(css.includes('data-element="008"'),'Moldura A4 do Oxigênio ausente');
assert.ok(js.includes('fit=o008-arte-aprovada-v1'),'Oxigênio precisa invalidar cache');
assert.ok(sw.includes('assets/folhetos/cenas/008-01.webp'),'SW precisa preservar cache do Oxigênio');
const manifestO=JSON.parse(read('data/folhetos-impressao-manifesto.json')).elements.find(e=>e.z===8);
assert.ok(manifestO,'Manifesto Oxigênio ausente');
for(const i of ['01','02']){
  const asset='assets/folhetos/cenas/008-'+i+'.webp';
  const panel=manifestO.panels.find(p=>p.id===i);
  assert.equal(panel.image,asset,'Manifesto Oxigênio '+i+' sem arte aprovada');
  assert.equal(panel.status,'aprovada','Manifesto Oxigênio '+i+' sem aprovação');
  assert.ok(sw.includes(asset),'Oxigênio '+i+' fora do cache offline');
  const img=fs.readFileSync(path.join(root,asset));
  assert.ok(img.length>200000,'Oxigênio '+i+': arte incompleta');
  assert.equal(img.toString('ascii',0,4),'RIFF','Oxigênio WebP inválido');
  assert.equal(img.toString('ascii',8,12),'WEBP','Oxigênio WebP inválido');
}


// HOMOLOGAÇÃO 001 — Hidrogênio: registro editorial aprovado de ambas as artes.
const hydrogenManifest=JSON.parse(read('data/folhetos-impressao-manifesto.json')).elements.find(e=>e.z===1);
assert.ok(hydrogenManifest,'Manifesto Hidrogênio ausente');
for(const i of ['01','02']){
  const asset='assets/folhetos/cenas/001-'+i+'.webp';
  const panel=hydrogenManifest.panels.find(p=>p.id===i);
  assert.ok(panel,'Quadro Hidrogênio '+i+' ausente');
  assert.equal(panel.image,asset,'Manifesto Hidrogênio '+i+' não aponta para a arte aprovada');
  assert.equal(panel.status,'aprovada','Manifesto Hidrogênio '+i+' não homologado');
  assert.ok(sw.includes(asset),'Arte Hidrogênio '+i+' não cadastrada no cache offline');
  const file=fs.readFileSync(path.join(root,asset));
  assert.ok(file.length>100000,'Arte Hidrogênio '+i+' incompleta');
  assert.equal(file.toString('ascii',0,4),'RIFF','Arte Hidrogênio '+i+' não é WebP');
  assert.equal(file.toString('ascii',8,12),'WEBP','Arte Hidrogênio '+i+' não é WebP');
}


// PILOTO 009 — Flúor: duas vinhetas da segunda versão editorial aprovada.
const fluorHtml=read('elementos/fluor/index.html');
assert.ok(fluorHtml.includes('data-folheto-piloto="fluor"'),'Piloto Flúor não ativado');
assert.ok(js.includes("current.z===9 && document.body.dataset.folhetoPiloto==='fluor'"),'Montagem do Flúor ausente');
assert.ok(css.includes('data-element="009"'),'Moldura A4 do Flúor ausente');
assert.ok(js.includes('fit=f009-arte-aprovada-v2'),'Flúor precisa invalidar cache anterior');
assert.ok(sw.includes('assets/folhetos/cenas/009-01.webp'),'SW precisa preservar cache do Flúor');
const manifestF=JSON.parse(read('data/folhetos-impressao-manifesto.json')).elements.find(e=>e.z===9);
assert.ok(manifestF,'Manifesto Flúor ausente');
for(const i of ['01','02']){
  const asset='assets/folhetos/cenas/009-'+i+'.webp';
  const panel=manifestF.panels.find(p=>p.id===i);
  assert.equal(panel.image,asset,'Manifesto Flúor '+i+' não aponta para arte aprovada');
  assert.equal(panel.status,'aprovada','Manifesto Flúor '+i+' sem aprovação');
  assert.ok(sw.includes(asset),'Flúor '+i+' fora do cache offline');
  const img=fs.readFileSync(path.join(root,asset));
  assert.ok(img.length>200000,'Flúor '+i+': arte incompleta');
  assert.equal(img.toString('ascii',0,4),'RIFF','Flúor '+i+' WebP inválido');
  assert.equal(img.toString('ascii',8,12),'WEBP','Flúor '+i+' WebP inválido');
}


// PILOTO 010 — Neônio: duas cenas originais completas, visual dos gasosos.
const neonHtml=read('elementos/neonio/index.html');
assert.ok(neonHtml.includes('data-folheto-piloto="neonio"'),'Piloto Neônio não ativado');
assert.ok(js.includes("current.z===10 && document.body.dataset.folhetoPiloto==='neonio'"),'Montagem do Neônio ausente');
assert.ok(css.includes('data-element="010"'),'Moldura A4 do Neônio ausente');
assert.ok(js.includes('fit=ne010-arte-aprovada-v1'),'Cache das artes do Neônio não invalidado');
assert.ok(sw.includes('assets/folhetos/cenas/010-01.webp'),'SW precisa preservar cache do Neônio');
const manifestNe=JSON.parse(read('data/folhetos-impressao-manifesto.json')).elements.find(e=>e.z===10);
assert.ok(manifestNe,'Manifesto Neônio ausente');
for(const i of ['01','02']){
  const asset='assets/folhetos/cenas/010-'+i+'.webp';
  const panel=manifestNe.panels.find(p=>p.id===i);
  assert.equal(panel.image,asset,'Manifesto Neônio '+i+' sem arte aprovada');
  assert.equal(panel.status,'aprovada','Manifesto Neônio '+i+' sem homologação');
  assert.ok(sw.includes(asset),'Arte Neônio '+i+' fora do cache offline');
  const img=fs.readFileSync(path.join(root,asset));
  assert.ok(img.length>200000,'Arte Neônio '+i+': arquivo incompleto');
  assert.equal(img.toString('ascii',0,4),'RIFF','Neônio '+i+' WebP inválido');
  assert.equal(img.toString('ascii',8,12),'WEBP','Neônio '+i+' WebP inválido');
}


// PILOTO 011 — Sódio: duas artes aprovadas, sem confundir Na+ com sódio metálico.
const sodiumHtml=read('elementos/sodio/index.html');
assert.ok(sodiumHtml.includes('data-folheto-piloto="sodio"'),'Piloto Sódio não ativado');
assert.ok(js.includes("current.z===11 && document.body.dataset.folhetoPiloto==='sodio'"),'Montagem do Sódio ausente');
assert.ok(css.includes('data-element="011"'),'Moldura A4 do Sódio ausente');
assert.ok(js.includes('fit=na011-arte-aprovada-v1'),'Cache das artes do Sódio não invalidado');
assert.ok(sw.includes('assets/folhetos/cenas/011-01.webp'),'SW precisa preservar cache do Sódio');
const manifestNa=JSON.parse(read('data/folhetos-impressao-manifesto.json')).elements.find(e=>e.z===11);
assert.ok(manifestNa,'Manifesto Sódio ausente');
for(const i of ['01','02']){
  const asset='assets/folhetos/cenas/011-'+i+'.webp';
  const panel=manifestNa.panels.find(p=>p.id===i);
  assert.equal(panel.image,asset,'Manifesto Sódio '+i+' sem arte aprovada');
  assert.equal(panel.status,'aprovada','Manifesto Sódio '+i+' sem homologação');
  assert.ok(sw.includes(asset),'Arte Sódio '+i+' fora do cache offline');
  const img=fs.readFileSync(path.join(root,asset));
  assert.ok(img.length>200000,'Arte Sódio '+i+': arquivo incompleto');
  assert.equal(img.toString('ascii',0,4),'RIFF','Sódio '+i+' WebP inválido');
  assert.equal(img.toString('ascii',8,12),'WEBP','Sódio '+i+' WebP inválido');
}


// PILOTO 012 — Magnésio: artes finais aprovadas para ambos os quadros A4.
const magnesiumHtml=read('elementos/magnesio/index.html');
assert.ok(magnesiumHtml.includes('data-folheto-piloto="magnesio"'),'Piloto Magnésio não ativado');
assert.ok(js.includes("current.z===12 && document.body.dataset.folhetoPiloto==='magnesio'"),'Montagem do Magnésio ausente');
assert.ok(css.includes('data-element="012"'),'Moldura A4 do Magnésio ausente');
assert.ok(js.includes('fit=mg012-arte-aprovada-v1'),'Cache de Magnésio não invalidado');
assert.ok(sw.includes('assets/folhetos/cenas/012-01.webp'),'SW precisa preservar cache do Magnésio');
const manifestMg=JSON.parse(read('data/folhetos-impressao-manifesto.json')).elements.find(e=>e.z===12);
assert.ok(manifestMg,'Manifesto Magnésio ausente');
for(const i of ['01','02']){
  const asset='assets/folhetos/cenas/012-'+i+'.webp';
  const panel=manifestMg.panels.find(p=>p.id===i);
  assert.equal(panel.image,asset,'Manifesto Magnésio '+i+' sem arte aprovada');
  assert.equal(panel.status,'aprovada','Manifesto Magnésio '+i+' sem homologação');
  assert.ok(sw.includes(asset),'Magnésio '+i+' fora do cache offline');
  const img=fs.readFileSync(path.join(root,asset));
  assert.ok(img.length>200000,'Magnésio '+i+': arte incompleta');
  assert.equal(img.toString('ascii',0,4),'RIFF','Magnésio '+i+' WebP inválido');
  assert.equal(img.toString('ascii',8,12),'WEBP','Magnésio '+i+' WebP inválido');
}


// PILOTO 013 — Alumínio: artes aprovadas, sem alterar a vinheta principal.
const aluminumHtml=read('elementos/aluminio/index.html');
assert.ok(aluminumHtml.includes('data-folheto-piloto="aluminio"'),'Piloto Alumínio não ativado');
assert.ok(js.includes("current.z===13 && document.body.dataset.folhetoPiloto==='aluminio'"),'Montagem do Alumínio ausente');
assert.ok(css.includes('data-element="013"'),'Moldura A4 do Alumínio ausente');
assert.ok(js.includes('fit=al013-arte-aprovada-v1'),'Cache das artes do Alumínio não invalidado');
assert.ok(sw.includes('assets/folhetos/cenas/013-01.webp'),'SW precisa preservar cache do Alumínio');
const manifestAl=JSON.parse(read('data/folhetos-impressao-manifesto.json')).elements.find(e=>e.z===13);
assert.ok(manifestAl,'Manifesto Alumínio ausente');
for(const i of ['01','02']){
  const asset='assets/folhetos/cenas/013-'+i+'.webp';
  const panel=manifestAl.panels.find(p=>p.id===i);
  assert.equal(panel.image,asset,'Manifesto Alumínio '+i+' sem arte aprovada');
  assert.equal(panel.status,'aprovada','Manifesto Alumínio '+i+' sem homologação');
  assert.ok(sw.includes(asset),'Alumínio '+i+' fora do cache offline');
  const img=fs.readFileSync(path.join(root,asset));
  assert.ok(img.length>200000,'Alumínio '+i+': arte incompleta');
  assert.equal(img.toString('ascii',0,4),'RIFF','Alumínio '+i+' WebP inválido');
  assert.equal(img.toString('ascii',8,12),'WEBP','Alumínio '+i+' WebP inválido');
}


// PILOTO 014 — Silício: duas artes aprovadas, mantendo a arte principal oficial.
const siliconHtml=read('elementos/silicio/index.html');
assert.ok(siliconHtml.includes('data-folheto-piloto="silicio"'),'Piloto Silício não ativado');
assert.ok(js.includes("current.z===14 && document.body.dataset.folhetoPiloto==='silicio'"),'Montagem do Silício ausente');
assert.ok(css.includes('data-element="014"'),'Moldura A4 do Silício ausente');
assert.ok(js.includes('fit=si014-sem-fundo-v3'),'Cache das artes do Silício não invalidado');
assert.ok(sw.includes("const CACHE='cordel-varal-v45-silicio-014-sem-fundo-externo'"),'SW precisa atualizar a versão do Silício');
const manifestSi=JSON.parse(read('data/folhetos-impressao-manifesto.json')).elements.find(e=>e.z===14);
assert.ok(manifestSi,'Manifesto Silício ausente');
for(const i of ['01','02']){
  const asset='assets/folhetos/cenas/014-'+i+'.svg';
  const panel=manifestSi.panels.find(p=>p.id===i);
  assert.equal(panel.image,asset,'Manifesto Silício '+i+' sem arte recortada');
  assert.equal(panel.expectedAsset,asset,'Manifesto Silício '+i+' sem arquivo esperado');
  assert.equal(panel.status,'aprovada','Manifesto Silício '+i+' sem homologação');
  assert.ok(sw.includes(asset),'Silício '+i+' fora do cache offline');
  const svg=fs.readFileSync(path.join(root,asset),'utf8');
  assert.ok(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"'),'Silício '+i+': SVG inválido');
  assert.ok(svg.includes('viewBox="0 0 1104 810"'),'Silício '+i+': dimensões lógicas alteradas');
  assert.ok(svg.includes('clipPath id="limite-da-moldura"'),'Silício '+i+': máscara ausente');
  assert.ok(svg.includes('rect x="57" y="16" width="989" height="780"'),'Silício '+i+': área externa não mascarada');
  const prefix='href="data:image/webp;base64,';
  const begin=svg.indexOf(prefix);
  const finish=svg.indexOf('"',begin+prefix.length);
  assert.ok(begin>=0&&finish>begin,'Silício '+i+': arte integral não incorporada');
  const original=fs.readFileSync(path.join(root,'assets/folhetos/cenas/014-'+i+'.webp'));
  assert.deepEqual(Buffer.from(svg.slice(begin+prefix.length,finish),'base64'),original,'Silício '+i+': original aprovado foi redesenhado');
}

// REGRESSÃO 014 — a extração anterior cortava a borda inferior dos dois quadros.
// SHA-256 fixa a versão de 1104 × 810 px reconstruída do pôster original completo.
const siliconCrypto=require('node:crypto');
const siliconHashes={
  '01':'ba018f44eb97ef71d6d554e2302e6310a229646a51fbfb64ee1e8454a9155bbe',
  '02':'011fbc33874fdba197976b287a1ed634a3ef77356646801120c9b79f72ff10a3'
};
for(const id of ['01','02']){
  const f=fs.readFileSync(path.join(root,'assets/folhetos/cenas/014-'+id+'.webp'));
  const actual=siliconCrypto.createHash('sha256').update(f).digest('hex');
  assert.equal(actual,siliconHashes[id],'Quadro Silício '+id+': arte aprovada com moldura completa foi substituída');
  assert.equal(f.toString('ascii',12,16),'VP8 ','Silício '+id+': formato WebP inesperado');
}

// PILOTO 015 — Fósforo: quadros aprovados preservados e disponíveis offline.
const phosphorusHtml=read('elementos/fosforo/index.html');
assert.ok(phosphorusHtml.includes('data-folheto-piloto="fosforo"'),'Piloto Fósforo não ativado');
assert.ok(js.includes("current.z===15 && document.body.dataset.folhetoPiloto==='fosforo'"),'Montagem do Fósforo ausente');
assert.ok(css.includes('data-element="015"'),'Moldura A4 do Fósforo ausente');
assert.ok(js.includes('fit=p015-aprovado-v1'),'Cache das artes do Fósforo não invalidado');
assert.ok(sw.includes("cordel-varal-v46-fosforo-015-quadros-aprovados"),'PWA deve atualizar para o Fósforo');
const manifestP=JSON.parse(read('data/folhetos-impressao-manifesto.json')).elements.find(e=>e.z===15);
assert.ok(manifestP,'Manifesto Fósforo ausente');
const phosphorusHashes={
  '01':'6baf374c17d37ea68b4904ba33b8267f6b649da90ef2cb5315487b3747553065',
  '02':'1bb524362a01105009ff4e5a2f95d690574aac11350a95c3c26405d7faa5b2e4'
};
const phosphorusCrypto=require('node:crypto');
for(const id of ['01','02']){
  const asset='assets/folhetos/cenas/015-'+id+'.webp';
  const panel=manifestP.panels.find(p=>p.id===id);
  assert.equal(panel.image,asset,'Manifesto Fósforo '+id+' sem arte aprovada');
  assert.equal(panel.expectedAsset,asset,'Manifesto Fósforo '+id+' sem asset esperado');
  assert.equal(panel.status,'aprovada','Manifesto Fósforo '+id+' sem homologação');
  assert.ok(sw.includes(asset),'Fósforo '+id+' fora do cache offline');
  const buf=fs.readFileSync(path.join(root,asset));
  assert.ok(buf.length>200000,'Fósforo '+id+': arte incompleta');
  assert.equal(buf.toString('ascii',0,4),'RIFF','Fósforo '+id+' WebP inválido');
  assert.equal(buf.toString('ascii',8,12),'WEBP','Fósforo '+id+' WebP inválido');
  assert.equal(phosphorusCrypto.createHash('sha256').update(buf).digest('hex'),phosphorusHashes[id],'Fósforo '+id+': arte aprovada alterada');
}


// PILOTO 016 — Enxofre: vinhetas integrais, encaixe A4 e regressão de arquivos aprovados.
const sulfurHtml=read('elementos/enxofre/index.html');
assert.ok(sulfurHtml.includes('data-folheto-piloto="enxofre"'),'Piloto Enxofre não ativado');
assert.ok(js.includes("current.z===16 && document.body.dataset.folhetoPiloto==='enxofre'"),'Montagem do Enxofre ausente');
assert.ok(css.includes('data-element="016"'),'Moldura A4 do Enxofre ausente');
assert.ok(js.includes('fit=s016-aprovado-v1'),'Invalidação de cache do Enxofre ausente');
assert.ok(sw.includes("cordel-varal-v47-enxofre-016-quadros-aprovados"),'PWA precisa atualizar para o Enxofre');
const manifestS=JSON.parse(read('data/folhetos-impressao-manifesto.json')).elements.find(e=>e.z===16);
assert.ok(manifestS,'Manifesto do Enxofre ausente');
const sulfurHashes={
  '01':'66d9ce523b2eb7a11779056b4760f4376497d05eb32c8593cf248860e252367e',
  '02':'6bb1d83a78dcecb19b7300b04b2b1b6fbe02c64fad8f1c24bfb58ab8a3f665dc'
};
const sulfurCrypto=require('node:crypto');
for(const id of ['01','02']){
  const asset='assets/folhetos/cenas/016-'+id+'.webp';
  const panel=manifestS.panels.find(p=>p.id===id);
  assert.equal(panel.image,asset,'Manifesto Enxofre '+id+' sem arte aprovada');
  assert.equal(panel.expectedAsset,asset,'Manifesto Enxofre '+id+' sem arquivo esperado');
  assert.equal(panel.status,'aprovada','Manifesto Enxofre '+id+' sem status aprovado');
  assert.ok(sw.includes(asset),'Enxofre '+id+' fora do cache offline');
  const img=fs.readFileSync(path.join(root,asset));
  assert.ok(img.length>200000,'Enxofre '+id+': arte incompleta');
  assert.equal(img.toString('ascii',0,4),'RIFF','Enxofre '+id+' RIFF ausente');
  assert.equal(img.toString('ascii',8,12),'WEBP','Enxofre '+id+' formato inválido');
  assert.equal(img.toString('ascii',12,16),'VP8 ','Enxofre '+id+' não é WebP com perdas');
  assert.equal(img.readUInt16LE(26)&0x3fff,1104,'Enxofre '+id+' largura não homologada');
  assert.equal(img.readUInt16LE(28)&0x3fff,810,'Enxofre '+id+' altura não homologada');
  assert.equal(sulfurCrypto.createHash('sha256').update(img).digest('hex'),sulfurHashes[id],'Enxofre '+id+': arte aprovada foi alterada');
}


// PILOTO 017 — Cloro: artes aprovadas, molduras completas, canvas sem distorção.
const chlorineHtml=read('elementos/cloro/index.html');
assert.ok(chlorineHtml.includes('data-folheto-piloto="cloro"'),'Piloto Cloro não ativado');
assert.ok(js.includes("current.z===17 && document.body.dataset.folhetoPiloto==='cloro'"),'Montagem Cloro ausente');
assert.ok(css.includes('data-element="017"'),'Encaixe A4 do Cloro ausente');
assert.ok(js.includes('fit=cl017-aprovado-v1'),'Cloro sem invalidação de cache');
assert.ok(sw.includes("cordel-varal-v48-cloro-017-quadros-aprovados"),'Service worker do Cloro não versionado');
const manifestCl=JSON.parse(read('data/folhetos-impressao-manifesto.json')).elements.find(e=>e.z===17);
assert.ok(manifestCl&&manifestCl.panels.length===2,'Manifesto Cloro incompleto');
const chlorineHashes={
  '01':'4c67ebc9b9f301f78a9cfecc7f26440f8ecb27adef8c0622acead57123320929',
  '02':'2bd026007856dc642776e3fe53e61b27c339d7a6778ce61f1ec844b620cd1749'
};
const chlorineCrypto=require('node:crypto');
for(const id of ['01','02']){
  const asset='assets/folhetos/cenas/017-'+id+'.webp';
  const panel=manifestCl.panels.find(p=>p.id===id);
  assert.ok(panel,'Quadro Cloro '+id+' não consta do manifesto');
  assert.equal(panel.image,asset,'Imagem Cloro '+id+' ausente no manifesto');
  assert.equal(panel.expectedAsset,asset,'Imagem Cloro '+id+' com destino incorreto');
  assert.equal(panel.status,'aprovada','Quadro Cloro '+id+' não marcado como aprovado');
  assert.ok(sw.includes(asset),'Quadro Cloro '+id+' fora do cache offline');
  const img=fs.readFileSync(path.join(root,asset));
  assert.ok(img.length>200000,'Quadro Cloro '+id+': imagem incompleta');
  assert.equal(img.toString('ascii',0,4),'RIFF','Cloro '+id+' RIFF inválido');
  assert.equal(img.toString('ascii',8,12),'WEBP','Cloro '+id+' WebP inválido');
  assert.equal(img.toString('ascii',12,16),'VP8X','Cloro '+id+' precisa conservar transparência sem fundo externo');
  assert.equal(img.readUIntLE(24,3)+1,1104,'Cloro '+id+' largura alterada');
  assert.equal(img.readUIntLE(27,3)+1,810,'Cloro '+id+' altura alterada');
  assert.ok((img[20]&16)!==0,'Cloro '+id+' perdeu a transparência das laterais');
  assert.equal(chlorineCrypto.createHash('sha256').update(img).digest('hex'),chlorineHashes[id],'Cloro '+id+' difere da arte aprovada');
}
