import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const outDir=path.resolve('dist/qa/cromo-024');
fs.mkdirSync(outDir,{recursive:true});
const chrome=process.env.CHROME_BIN || '/usr/bin/google-chrome';
const browser=await puppeteer.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage']});
try {
  const page=await browser.newPage();
  await page.setViewport({width:1240,height:1600,deviceScaleFactor:1});
  await page.goto('http://127.0.0.1:8765/elementos/cromo/',{waitUntil:'networkidle0',timeout:45000});
  await page.emulateMediaType('print');
  await page.waitForFunction(()=>{
    const sheet=document.querySelector('.ep-print-sheet[data-element="024"][data-print-phase="piloto-quadros-integrais"]');
    const panels=sheet?.querySelectorAll('.ep-print-approved-art');
    return panels?.length===2 && [...panels].every(img=>img.complete&&img.naturalWidth===1104&&img.naturalHeight===810);
  },{timeout:18000});
  const report=await page.evaluate(()=>{
    const sheet=document.querySelector('.ep-print-sheet[data-element="024"]');
    const imgs=[...sheet.querySelectorAll('.ep-print-approved-art')];
    const arr=imgs.map(img=>{
      const rect=img.getBoundingClientRect();
      const panel=img.closest('.ep-print-story').getBoundingClientRect();
      const css=getComputedStyle(img);
      return {url:img.currentSrc,width:img.naturalWidth,height:img.naturalHeight,
        bbox:{x:rect.x,y:rect.y,width:rect.width,height:rect.height},
        story:{x:panel.x,y:panel.y,width:panel.width,height:panel.height},
        objectFit:css.objectFit,display:css.display};
    });
    return {sheetVisible:getComputedStyle(sheet).display!=='none',printPhase:sheet.dataset.printPhase,panels:arr};
  });
  if(!report.sheetVisible || report.panels.length!==2)throw Error('Folheto e quadros não ficaram visíveis em media print');
  for(const [i,p] of report.panels.entries()){
    const id=String(i+1).padStart(2,'0');
    if(!p.url.includes('024-'+id+'.webp'))throw Error('Quadro '+id+' com arquivo incorreto: '+p.url);
    if(p.bbox.width<200 || p.bbox.height<160)throw Error('Quadro '+id+' ficou pequeno: '+JSON.stringify(p.bbox));
    if(Math.abs(p.bbox.x-p.story.x)>2 || Math.abs(p.bbox.y-p.story.y)>2 || Math.abs(p.bbox.width-p.story.width)>2 || Math.abs(p.bbox.height-p.story.height)>2)
      throw Error('Quadro '+id+' não ocupa a área editorial: '+JSON.stringify(p));
  }
  if(Math.abs(report.panels[0].bbox.x-report.panels[1].bbox.x)<50)throw Error('Quadros sobrepostos');
  fs.writeFileSync(path.join(outDir,'inspecao.json'),JSON.stringify(report,null,2));
  await page.pdf({path:path.join(outDir,'cromo-024-a4.pdf'),format:'A4',printBackground:true,preferCSSPageSize:true,displayHeaderFooter:false});
  await page.screenshot({path:path.join(outDir,'cromo-024-media-print.png'),fullPage:true});
  console.log('PASS: Quadros 01 e 02 carregados e visíveis na impressão, 1104×810.');
}finally{await browser.close();}
