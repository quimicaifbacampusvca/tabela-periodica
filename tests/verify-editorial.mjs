// Editorial regression: public copy must describe science, not internal approvals.
// Run: node tests/verify-editorial.mjs
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=(name)=>readFileSync(resolve(root,name),'utf8');
const home=read('index.html');
const generator=read('scripts/build-elements.py');
const banned=/coleção aprovada|base reunida para o projeto|versão inicial para avaliação|dados e textos científicos em revisão editorial/i;
const sentence='As ilustrações e os textos aproximam os elementos químicos de situações do cotidiano.';
const caveat='Quando a incerteza não é indicada, o valor não deve ser considerado exato.';
assert.doesNotMatch(home,banned,'home page should not expose internal editorial milestones');
assert.ok(home.includes('consulte as referências em cada folheto'),'home page must reference per-element sources');
assert.ok(generator.includes(sentence) && generator.includes(caveat),'generator should retain the revised public scientific note');
let n=0;
for(const el of JSON.parse(read('assets/elementos-fichas.json'))){
  const slug=el.slug;
  assert.ok(slug,'each element requires a slug');
  const path=resolve(root,'elementos',slug,'index.html');
  assert.ok(existsSync(path),'missing element page: '+slug);
  const page=read('elementos/'+slug+'/index.html');
  assert.doesNotMatch(page,banned,'unrevised editorial copy: '+slug);
  assert.ok(page.includes(sentence) && page.includes(caveat),'scientific caveat missing in '+slug);
  n++;
}
assert.equal(n,118,'all 118 element pages must be checked');
console.log('PASS: 118 public pages, home and generator use reader-facing educational language.');
