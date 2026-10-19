'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const model=require('../assets/element-model.js');
const data=JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/elementos-fichas.json'),'utf8'));
const get=z=>data[z-1];
assert.equal(model.display(get(2),'boiling',{temperature:'K'}),'4,22 K');
assert.equal(model.display(get(29),'fusion',{temperature:'K'}),'1.357,77 K');
assert.equal(model.display(get(29),'ei',{energy:'kJ'}),'745,48 kJ/mol');
assert.equal(model.display(get(2),'fusion'),'Não disponível nesta base');
assert.equal(model.display({fusion:0},'fusion'),'0 °C');
assert.equal(model.display({ei:NaN},'ei'),'Não disponível nesta base');
assert.equal(model.compare(get(1),get(2),'radius').comparable,false,'Different radius definitions must not be ranked');
assert.equal(model.compare(get(2),get(10),'radius').comparable,true);
assert.equal(model.compare(get(29),get(47),'radius').comparable,true);
assert.equal(model.compare(get(6),get(29),'fusion').comparable,false,'Carbon condition exception');
assert.equal(model.compare(get(33),get(29),'boiling').comparable,false,'Sublimation is not boiling');
assert.equal(model.compare(get(87),get(55),'fusion').comparable,false,'Estimated Fr phase data');
assert.equal(model.compare(get(118),get(54),'en').comparable,false,'Missing property');
const cold=model.compare(get(1),get(2),'boiling');
assert(cold.comparable&&cold.bars[0]===100&&cold.bars[1]>0&&cold.bars[1]<100,'Negative Celsius values use absolute scale');
for(const key of ['radius','en','ei','fusion','boiling']){
  for(const a of data)for(const b of data){
    const result=model.compare(a,b,key);
    assert(result.bars.every(value=>Number.isFinite(value)&&value>=0&&value<=100));
    if(!model.isNumber(a[key])||!model.isNumber(b[key]))assert(!result.comparable);
  }
}
console.log('PASS: conversões, valores ausentes, condições especiais e 69.620 pares/propriedades.');
