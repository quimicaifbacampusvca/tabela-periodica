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
        await Promise.all([...sheet.querySelectorAll('.ep-print-approved-art')].map(img=>
          img.complete?Promise.resolve():new Promise((resolve,reject)=>{
            img.addEventListener('load',resolve,{once:true});
            img.addEventListener('error',()=>reject(new Error('Falha ao carregar quadro aprovado')),{once:true});
          })
        ));
      });
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
          imageCount:sheet.querySelectorAll('.ep-print-story img').length,
          approvedCount:sheet.querySelectorAll('.ep-print-approved-story').length,
          approvedImagesReady:[...sheet.querySelectorAll('.ep-print-approved-art')].every(img=>img.complete&&img.naturalWidth>0)
        };
      });
      assert.ok(info.mainArtExists,'Arte principal ausente: '+element.name);
      assert.equal(info.allSlots,2,'Esperados dois quadros: '+element.name);
      const expectedImages=element.panels.filter(p=>p.status==='aprovada').length;
      assert.equal(info.emptySlots,2-expectedImages,'Contagem de espaços vazios incorreta: '+element.name);
      assert.equal(info.imageCount,expectedImages,'Número de cenas aprovadas divergente: '+element.name);
      assert.equal(info.approvedCount,expectedImages,'Cenas não foram montadas: '+element.name);
      assert.ok(info.approvedImagesReady,'Falha ao carregar cenas aprovadas: '+element.name);
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
console.log('SUCESSO: 118 folhetos A4, com cenas homologadas progressivamente.');
