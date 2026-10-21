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
assert.ok(css.includes('grid-template-rows:15mm 8mm 96mm 65mm 69mm 13mm!important'),'A4 pilot grid changed');
assert.ok(css.includes('object-fit:contain!important'),'Pilot must not distort/crop art');
assert.ok(js.includes('003-0'),'Two approved originals are required');
assert.ok(css.includes('column-gap:2mm!important'),'Quadros devem ter o espaço reduzido da referência aprovada');
