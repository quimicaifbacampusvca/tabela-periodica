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
assert.ok(sw.includes("cordel-varal-v18-print"));
console.log('PASS: 118 elementos, modelo A4, valores, arte, quadrinhos, referências e impressão independente.');
