const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch();fs.mkdirSync('dist/home-review',{recursive:true});
 try{
  for(const width of [320,390,800,1440]){
   const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
   const errors=[];page.on('pageerror',e=>errors.push(String(e)));
   await page.goto('http://127.0.0.1:8765/',{waitUntil:'networkidle'});
   await page.locator('[data-view=periodic]').click();
   await page.locator('#catalog-filters>summary').click();
   await page.locator('#category').selectOption('Metal alcalino');
   const before=await page.locator('a.tile:not(.unmatched)').count();
   await page.locator('.hq-open').click();
   assert(await page.locator('#hq-edition').isVisible());
   assert(await page.locator('#hq-heading').evaluate(e=>e===document.activeElement));
   assert.equal(await page.locator('.hq-panel').count(),118);
   assert.equal(await page.locator('.hq-group').count(),18);
   assert.equal(await page.locator('.hq-period').count(),7);
   assert.equal(await page.locator('.hq-panel[data-radius=""]').count(),6);
   assert.equal(await page.locator('.hq-solid').count(),90);
   assert.equal(await page.locator('.hq-liquid').count(),2);
   assert.equal(await page.locator('.hq-gas').count(),11);
   assert.equal(await page.locator('.hq-unknown').count(),15);
   const info=await page.locator('.hq-panel').evaluateAll(panels=>panels.map(p=>({z:+p.dataset.z,r:+p.dataset.radius,scaled:p.dataset.radius!=='',area:+p.dataset.area,href:p.getAttribute('href')})));
   assert.deepEqual(info.map(x=>x.z),Array.from({length:118},(_,i)=>i+1));
   const positions=await page.locator('.hq-panel').evaluateAll(panels=>panels.map(panel=>{
     const tile=[...document.querySelectorAll('a.tile')].find(t=>t.querySelector('.z').textContent.trim()===panel.dataset.z);
     const rect=panel.getBoundingClientRect();
     return {z:+panel.dataset.z,col:+panel.dataset.column,row:+panel.dataset.row,sourceCol:+tile.style.getPropertyValue('--col'),sourceRow:+tile.style.getPropertyValue('--row'),left:rect.left,top:rect.top,width:rect.width,height:rect.height};
   }));
   for(const p of positions){assert.equal(p.col,p.sourceCol);assert.equal(p.row,p.sourceRow);}
   const pos=z=>positions.find(p=>p.z===z);
   assert.equal(pos(1).col,1);assert.equal(pos(2).col,18);
   assert.equal(pos(57).row,9);assert.equal(pos(89).row,10);
   assert.equal(pos(72).col,4);assert.equal(pos(104).col,4);
   for(const p of positions)for(const q of positions){
     if(p.z>=q.z)continue;
     const overlap=Math.min(p.left+p.width,q.left+q.width)-Math.max(p.left,q.left)>1 && Math.min(p.top+p.height,q.top+q.height)-Math.max(p.top,q.top)>1;
     assert(!overlap,'overlapping panels '+p.z+' / '+q.z);
   }
   const scale=info.filter(x=>x.scaled).sort((a,b)=>a.r-b.r);
   for(let i=1;i<scale.length;i++)assert(scale[i].area>=scale[i-1].area);
   assert(scale.at(-1).area>scale[0].area);
   assert(await page.locator('.hq-panel[data-z="87"] .hq-panel-head img').evaluate(img=>img.src.includes('estado_solido_alcalinos')));
   for(const theme of ['light','dark','contrast']){
    await page.evaluate(theme=>document.body.dataset.theme=theme,theme);
    const fit=await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+2);
    assert(fit,'page overflow '+width+' '+theme);
   }
   await page.evaluate(()=>document.body.dataset.theme='light');
   await page.screenshot({path:`dist/home-review/hq-${width}.png`,fullPage:false});
   if(width===1440)await page.locator('.hq-table').screenshot({path:'dist/home-review/hq-classic-complete.png'});
   await page.locator('.hq-return').first().click();
   assert(!(await page.locator('#hq-edition').isVisible()));
   assert.equal(await page.locator('#category').inputValue(),'Metal alcalino');
   assert.equal(await page.locator('a.tile:not(.unmatched)').count(),before);
   assert(await page.locator('.hq-open').evaluate(e=>document.activeElement===e));
   await page.keyboard.press('Enter');
   assert.equal(await page.locator('.hq-panel').count(),118);
   await page.keyboard.press('Escape');
   assert(!(await page.locator('#hq-edition').isVisible()));
   assert.deepEqual(errors,[]);await page.close();
  }
 }finally{await browser.close();}
 console.log('PASS: 118 HQ panels, 18 groups, 7 periods, fixed classic positions, detached series, no overlaps, covalent-only area scale, four treatments, themes, keyboard, preserved filters and responsive layout.');
})().catch(e=>{console.error(e);process.exit(1)});
