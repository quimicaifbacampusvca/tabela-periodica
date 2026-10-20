// Contrato de pré-produção: 118 folhas, quatro matrizes e 236 slots livres.
const fs=require('node:fs');
const assert=require('node:assert/strict');
const files=JSON.parse(fs.readFileSync('data/folhetos-impressao-manifesto.json','utf8'));
const models=JSON.parse(fs.readFileSync('assets/elementos-fichas.json','utf8'));
const css=fs.readFileSync('assets/element-page.css','utf8');
const js=fs.readFileSync('assets/element-page.js','utf8');
new Function(js);
assert.equal(files.elements.length,118);
assert.equal(models.length,118);
assert.deepEqual(files.elements.map(x=>x.z),models.map(x=>x.z));
assert.equal(new Set(files.elements.map(x=>x.slug)).size,118);
const states={'Sólido':'ep-print-solid','Gasoso':'ep-print-gas','Líquido':'ep-print-liquid','Não determinado':'ep-print-unknown'};
const distribution={};
for(const element of files.elements){
  const model=models[element.z-1];
  assert.equal(element.state,model.state,'Estado divergente em '+element.name);
  assert.equal(element.layout,states[element.state],'Matriz errada em '+element.name);
  assert.ok(element.mainArt.endsWith(String(element.z).padStart(3,'0')+'.webp'));
  assert.equal(element.panels.length,2);
  for(const [n,scene] of element.panels.entries()){
    assert.equal(scene.id,String(n+1).padStart(2,'0'));
    assert.equal(scene.image,null,'Arte ainda não deveria existir');
    assert.equal(scene.status,'a_criar_individualmente');
    assert.equal(scene.scene,String(element.z).padStart(3,'0')+'-'+scene.id);
  }
  distribution[element.state]=(distribution[element.state]||0)+1;
}
assert.deepEqual(distribution,{'Gasoso':11,'Sólido':84,'Líquido':2,'Não determinado':21});
assert.ok(js.includes('ep-print-story-art'));
assert.ok(js.includes("current.state==='Não determinado'?'EM INVESTIGAÇÃO'"));
assert.ok(css.includes('ep-print-story-art:empty'));
assert.ok(css.includes('@page{size:A4 portrait;margin:0}'));
assert.ok(css.includes('height:296mm!important'));
for(const state of Object.values(states))assert.ok(css.includes('.'+state));
console.log('PASS: 118 folhas, 236 espaços de arte vazios, 4 matrizes, A4.');
