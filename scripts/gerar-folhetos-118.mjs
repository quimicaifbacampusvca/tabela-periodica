import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';

const root=process.cwd();
const manifest=JSON.parse(fs.readFileSync(path.join(root,'data/folhetos-impressao-manifesto.json'),'utf8'));
const outDir=path.join(root,'dist','folhetos');
fs.mkdirSync(outDir,{recursive:true});
const executablePath=process.env.CHROME_BIN || '/usr/bin/google-chrome';
const baseUrl=process.env.CORDEL_SERVER || 'http://127.0.0.1:8765';
const browser=await puppeteer.launch({
  headless:true,executablePath,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']
});
const records=[];
const failed=[];
try {
  for(const element of manifest.elements){
    const page=await browser.newPage();
    try {
      const url=baseUrl+'/elementos/'+encodeURIComponent(element.slug)+'/';
      const response=await page.goto(url,{waitUntil:'load',timeout:30000});
      assert.equal(response?.status(),200,'Página não encontrada: '+url);
      await page.waitForSelector('.ep-print-sheet',{timeout:15000});
      await page.evaluate(async()=>{
        await document.fonts.ready;
        const sheet=document.querySelector('.ep-print-sheet');
        const art=sheet.querySelector('.ep-print-main-art');
        if(art && !art.complete)await new Promise((resolve,reject)=>{
          art.addEventListener('load',resolve,{once:true});
          art.addEventListener('error',()=>reject(new Error('Falha ao carregar arte principal')),{once:true});
        });
      });
      // Lítio é o único folheto com os dois quadros preenchidos neste piloto.
      if(element.z===3){
        await page.waitForFunction(()=>{
          const sheet=document.querySelector('.ep-print-sheet');
          return !!sheet && [...sheet.querySelectorAll('.ep-print-story')].every(panel=>
            panel.dataset.sceneReady==='true' &&
            [...panel.querySelectorAll('.ep-print-approved-art')].every(img=>img.complete&&img.naturalWidth>0));
        },{timeout:20000});
      }
      await page.emulateMediaType('print');
      const info=await page.evaluate(()=>{
        const sheet=document.querySelector('.ep-print-sheet');
        const mainArt=sheet.querySelector('.ep-print-main-art');
        return {
          state:sheet.className,
          mainArtExists:!!mainArt && mainArt.complete && mainArt.naturalWidth>0,
          emptySlots:sheet.querySelectorAll('.ep-print-story-art:empty').length,
          allSlots:sheet.querySelectorAll('.ep-print-story-art').length,
          text:sheet.textContent.trim(),
          phase:sheet.dataset.printPhase,
          imageCount:sheet.querySelectorAll('.ep-print-story img').length
        };
      });
      assert.ok(info.mainArtExists,'Arte principal ausente: '+element.name);
      assert.equal(info.allSlots,2,'Esperados dois quadros: '+element.name);
      const pilot=element.z===3;
      assert.equal(info.emptySlots,pilot?0:2,'Slots de arte divergentes: '+element.name);
      assert.equal(info.imageCount,pilot?2:0,'Contagem incorreta de ilustrações: '+element.name);
      assert.equal(info.phase,pilot?'piloto-quadros-integrais':'estrutura-sem-cenas',
        'Estado de impressão fora do previsto: '+element.name);
      assert.ok(info.state.includes(element.layout),'Matriz visual incorreta: '+element.name);
      assert.ok(info.text.includes(element.name),'Nome ausente: '+element.name);
      const filename=String(element.z).padStart(3,'0')+'-'+element.slug+'.pdf';
      const pdfPath=path.join(outDir,filename);
      await page.pdf({
        path:pdfPath,format:'A4',printBackground:true,
        preferCSSPageSize:true,displayHeaderFooter:false,
        margin:{top:0,right:0,bottom:0,left:0}
      });
      assert.ok(fs.statSync(pdfPath).size>7000,'PDF vazio: '+filename);
      if(pilot){
        const layout=await page.evaluate(()=>{
          const sheet=document.querySelector('.ep-print-sheet');
          const get=el=>{const b=el.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height,right:b.right,bottom:b.bottom};};
          const seq=['.ep-print-feature','.ep-print-facts','.ep-print-stories','.ep-print-footer'].map(x=>get(sheet.querySelector(x)));
          const panels=[...sheet.querySelectorAll('.ep-print-story')].map(panel=>{
            const img=panel.querySelector('img.ep-print-approved-art');
            return {
              panel:get(panel),art:get(panel.querySelector('.ep-print-story-art')),
              heading:getComputedStyle(panel.querySelector('h2')).display,
              text:getComputedStyle(panel.querySelector('p')).display,
              fit:getComputedStyle(img).objectFit,
              natural:[img.naturalWidth,img.naturalHeight],
              source:img.getAttribute('src'),
              // Conteúdo da ARTE: validar também o fechamento inferior real.
              // Só medir a caixa HTML não detecta um recorte no próprio WebP.
              bottomInk:(()=>{
                const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
                const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);
                const y=canvas.height-10,pixels=ctx.getImageData(15,y,canvas.width-30,1).data;
                let dark=0;for(let t=0;t<pixels.length;t+=4)if((pixels[t]+pixels[t+1]+pixels[t+2])/3<95)dark++;
                return dark/(pixels.length/4);
              })()
            };
          });
          return {seq,panels};
        });
        assert.equal(layout.panels.length,2,'São exigidas duas cenas completas de Lítio');
        for(let i=1;i<layout.seq.length;i++)
          assert.ok(layout.seq[i-1].bottom<=layout.seq[i].y+2,'Sobreposição entre seções A4: '+JSON.stringify(layout.seq));
        for(const [index,panel] of layout.panels.entries()){
          assert.equal(panel.heading,'none','Título HTML duplicado no quadro');
          assert.equal(panel.text,'none','Legenda HTML duplicada no quadro');
          assert.equal(panel.fit,'contain','A arte não pode sofrer estiramento nem corte');
          assert.ok(panel.bottomInk>0.85,'Moldura inferior ausente ou cortada: '+JSON.stringify(panel));
          assert.deepEqual(panel.natural,[1104,810],
            'Arte deve estar preparada exatamente para os 92×67,5 mm do quadro, sem corte');
          assert.ok(panel.natural[0]>=1104&&panel.natural[1]>=810,'Imagem redimensionada não carregou');
          assert.ok(Math.abs(panel.panel.width-panel.art.width)<2&&Math.abs(panel.panel.height-panel.art.height)<2,
            'A imagem não ocupa o quadro inteiro: '+JSON.stringify(panel));
          const printedRatio=panel.art.width/panel.art.height;
          const originalRatio=panel.natural[0]/panel.natural[1];
          assert.ok(Math.abs(printedRatio-originalRatio)<0.008,
            'Proporção da moldura incompatível com a arte 4:3: '+JSON.stringify(panel));
        }
        const preview=path.join(root,'dist','previews');
        fs.mkdirSync(preview,{recursive:true});
        await page.setViewport({width:1200,height:1400,deviceScaleFactor:2});
        await (await page.$('.ep-print-sheet')).screenshot({path:path.join(preview,'003-litio-a4.png')});
        await (await page.$('.ep-print-stories')).screenshot({path:path.join(preview,'003-litio-quadros.png')});
        console.log('PILOTO LÍTIO APROVADO NO TESTE GEOMÉTRICO:',JSON.stringify(layout.panels.map(p=>({width:p.art.width,height:p.art.height,natural:p.natural}))));
      }
      records.push({z:element.z,slug:element.slug,state:element.state,pdf:filename,size:fs.statSync(pdfPath).size});
      if(records.length%20===0)console.log('Folhetos concluídos:',records.length,'de',manifest.elements.length);
    }catch(error){
      failed.push({z:element.z,slug:element.slug,error:String(error)});
      console.error('ERRO:',element.z,element.name,String(error));
    }finally{await page.close();}
  }
}finally{await browser.close();}
fs.writeFileSync(path.join(root,'dist','relatorio-geracao.json'),JSON.stringify({count:records.length,failures:failed,files:records},null,2));
assert.equal(failed.length,0,'Alguns folhetos falharam: '+JSON.stringify(failed.slice(0,5)));
assert.equal(records.length,118,'Nem todos os 118 folhetos foram gerados');
console.log('SUCESSO: 118 folhetos A4; piloto Lítio com duas cenas e 117 folhas com quadros reservados.');
