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
assert.ok(sw.includes('cordel-varal-v28-litio-bordas-integrais'),'PWA deve invalidar cache de cenas antigas');
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
assert.ok(sw.includes('cordel-varal-v31-hidrogenio-001-borda-direita-completa'),'SW precisa atualizar imagens 001');

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
assert.ok(sw.includes('cordel-varal-v32-helio-002-quadros-integrais'),'Cache de cenas do Hélio não atualizado');
for(const i of ['01','02']){
  const file=fs.readFileSync(path.join(root,'assets/folhetos/cenas/002-'+i+'.webp'));
  assert.ok(file.length>150000,'Arte 002-'+i+' incompleta');
  assert.equal(file.toString('ascii',0,4),'RIFF','WebP Hélio inválido');
  assert.equal(file.toString('ascii',8,12),'WEBP','WebP Hélio inválido');
}
