/* Verificações de integração em DOM simulado; não substituem teste em navegador. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const entries=[...html.matchAll(/<a class="tile\b[\s\S]*?<\/a>/g)].map(m=>({search:m[0].match(/data-search="([^"]+)"/)[1],category:m[0].match(/data-category="([^"]+)"/)[1]}));
class Classes{constructor(...classes){this.values=new Set(classes)}contains(k){return this.values.has(k)}add(k){this.values.add(k)}toggle(k,force){const yes=force===undefined?!this.contains(k):force;yes?this.values.add(k):this.values.delete(k);return yes}}
class Element{constructor(){this.children=[];this.attributes={};this.classList=new Classes();this.listeners={};this.dataset={};this.hidden=false;this.value='';this.textContent=''}setAttribute(k,v){this.attributes[k]=v}appendChild(n){this.children.push(n);return n}prepend(n){this.children.unshift(n)}replaceChildren(...nodes){this.children=nodes.flatMap(n=>n.fragment?n.children:[n])}addEventListener(k,fn){(this.listeners[k]??=[]).push(fn)}dispatch(k){for(const fn of this.listeners[k]??[])fn()}}
const grid=new Element();grid.classList.add('grid');grid.clientWidth=1120;let columns=4;
const tiles=entries.map(e=>{const t=new Element();t.dataset={search:e.search,category:e.category};return t});
const visible=()=>tiles.filter(t=>!t.hidden);
for(const tile of tiles){Object.defineProperties(tile,{offsetWidth:{get:()=>tile.hidden?0:(grid.clientWidth-24-(columns-1)*30)/columns},offsetLeft:{get:()=>12+(visible().indexOf(tile)%columns)*(tile.offsetWidth+30)},offsetTop:{get:()=>40+Math.floor(visible().indexOf(tile)/columns)*480}})}
Object.defineProperty(grid,'clientHeight',{get:()=>80+Math.ceil(visible().length/columns)*480});
grid.querySelectorAll=()=>tiles;
const nodes=Object.fromEntries(['search','category','count','empty'].map(id=>[id,new Element()]));
let queued=[],observers=[],now=0,nextTimer=1;
const timers=new Map(),animations=[];
const document=Object.assign(new Element(),{documentElement:new Element(),querySelector:s=>s==='#colecao .grid'?grid:s==='.grid.periodic'&&grid.classList.contains('periodic')?grid:null,querySelectorAll:s=>s==='.tile'?tiles:[],getElementById:id=>nodes[id],createElement:()=>new Element(),createElementNS:()=>new Element(),createDocumentFragment:()=>Object.assign(new Element(),{fragment:true})});
const motion=Object.assign(new Element(),{matches:false});
const window=Object.assign(new Element(),{innerWidth:1120,innerHeight:800,matchMedia:()=>motion});
for(const [index,tile] of tiles.entries()){
  tile.matches=()=>!!tile.interacting;
  tile.getBoundingClientRect=()=>({top:tile.offsetTop,bottom:tile.offsetTop+430,left:tile.offsetLeft,right:tile.offsetLeft+tile.offsetWidth});
  tile.animate=(frames,options)=>{const animation={tile,frames,options,cancelled:false,cancel(){this.cancelled=true;this.oncancel?.()}};animations.push(animation);return animation};
  tile.rest=[-.65,.7,-.4,.55][index%4];
}
const sandbox={document,window,MutationObserver:class{constructor(fn){this.fn=fn}observe(target){observers.push({target,fn:this.fn})}},requestAnimationFrame:fn=>{queued.push(fn);return queued.length},setTimeout:(fn,delay)=>{const id=nextTimer++;timers.set(id,{fn,at:now+delay});return id},clearTimeout:id=>timers.delete(id),getComputedStyle:tile=>({getPropertyValue:()=>`${tile.rest}deg`}),console};
vm.createContext(sandbox);
for(const file of ['app.js','cordel-collection.js'])vm.runInContext(fs.readFileSync(path.join(root,'assets',file),'utf8'),sandbox);
function flush(target=grid){observers.filter(o=>o.target===target).forEach(o=>o.fn());let loops=0;while(queued.length){const q=queued.splice(0);q.forEach(fn=>fn());assert(++loops<5,'Animation loop should settle')}}
function advance(ms){const end=now+ms;while(true){const next=[...timers].sort((a,b)=>a[1].at-b[1].at)[0];if(!next||next[1].at>end)break;timers.delete(next[0]);now=next[1].at;next[1].fn()}now=end}
function filter(text='',category=''){nodes.search.value=text;nodes.category.value=category;nodes.search.dispatch('input');flush()}
const ropes=grid.children[0];
flush();assert.equal(tiles.length,118);assert.equal(ropes.children.length,60);
filter('cobre');assert.equal(visible().length,1);assert.equal(ropes.children.length,2);assert.equal(nodes.count.textContent,'1 elementos encontrados');
// Empty message is hidden when results exist.
assert.equal(nodes.empty.hidden,true);
filter('oxigenio');assert.equal(visible().length,1);assert.equal(visible()[0].dataset.search,'8 O Oxigênio');
filter('','Gás nobre');assert.equal(visible().length,7);assert.equal(ropes.children.length,4);
filter('zzzinexistente');assert.equal(visible().length,0);assert.equal(ropes.children.length,0);assert.equal(nodes.empty.hidden,false);
assert.equal(grid.children.filter(n=>n.className?.includes('periodic-group')).length,18);
assert.equal(grid.children.filter(n=>n.className?.includes('periodic-period')).length,7);
assert.equal(grid.children.filter(n=>n.className?.includes('periodic-series-marker')).length,2);
grid.classList.add('periodic');filter('cobre');assert.equal(visible().length,118);assert.equal(tiles.filter(t=>!t.classList.contains('unmatched')).length,1);assert.equal(ropes.children.length,0);
grid.classList.toggle('periodic',false);filter();assert.equal(ropes.children.length,60);
columns=2;grid.clientWidth=580;flush();assert.equal(ropes.children.length,118);
columns=1;grid.clientWidth=280;flush();assert.equal(ropes.children.length,236);
assert(ropes.children.every(p=>!p.attributes.d.includes('NaN')));
// The real 10-second scheduler runs against a fake clock, without delaying this test.
columns=4;grid.clientWidth=1120;flush();
assert.equal(timers.size,1);assert.equal([...timers.values()][0].at-now,10000);
tiles[0].interacting=true;
advance(9999);assert.equal(animations.length,0);
advance(1);assert.equal(animations.length,7,'Only the eight on-screen cards, minus the one being read');
assert.equal(timers.size,1);assert.equal([...timers.values()][0].at-now,10000);
for(const a of animations){
  assert.equal(a.frames.length,65);
  assert.equal(a.frames[0].transform,`rotate(${a.tile.rest.toFixed(4)}deg)`);
  assert.equal(a.frames.at(-1).transform,a.frames[0].transform);
  assert(a.frames.every(f=>Math.abs(parseFloat(f.transform.slice(7))-a.tile.rest)<1.5));
  assert(a.options.duration>=3200&&a.options.duration<=3620);
  assert(a.options.delay>=0&&a.options.delay<=490);
}
tiles[1].dispatch('pointerenter');assert.equal(animations[0].cancelled,true);
tiles[2].dispatch('focusin');assert.equal(animations[1].cancelled,true);
document.documentElement.classList.add('reduce-motion');flush(document.documentElement);
assert.equal(timers.size,0);assert(animations.every(a=>a.cancelled));
advance(60000);assert.equal(animations.length,7);
document.documentElement.classList.toggle('reduce-motion',false);flush(document.documentElement);assert.equal(timers.size,1);
motion.matches=true;motion.dispatch('change');assert.equal(timers.size,0);
motion.matches=false;motion.dispatch('change');assert.equal(timers.size,1);
document.documentElement.classList.add('simple-reading');flush(document.documentElement);assert.equal(timers.size,0);
document.documentElement.classList.toggle('simple-reading',false);flush(document.documentElement);assert.equal(timers.size,1);
document.hidden=true;document.dispatch('visibilitychange');assert.equal(timers.size,0);
document.hidden=false;document.dispatch('visibilitychange');assert.equal(timers.size,1);
grid.classList.add('periodic');flush();assert.equal(timers.size,0);
grid.classList.toggle('periodic',false);flush();assert.equal(timers.size,1);
tiles[0].interacting=false;
advance(10000);assert.equal(animations.length,15);
window.dispatch('pagehide');assert.equal(timers.size,0);assert(animations.every(a=>a.cancelled));
window.dispatch('pageshow');flush();assert.equal(timers.size,1);
console.log(JSON.stringify({cards:118,filters:'search, accents, categories, empty',table:'positions retained; unmatched visible',ropeRows:'4, 2 and 1 columns; filtered reflow',breeze:'10-second cycle; visible cards only; staggered, bounded rotation; hover/focus cancellation; reduced-motion, reading, hidden-tab, table and page lifecycle checks',verification:'DOM simulated; no browser QA'}));
