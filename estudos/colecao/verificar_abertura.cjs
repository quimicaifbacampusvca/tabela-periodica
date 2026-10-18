/* Eventos e cache simulados; não substitui homologação visual em navegador. */
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),code=fs.readFileSync(path.join(root,'assets/book-intro.js'),'utf8');
function target(){const listeners={};return {addEventListener:(k,fn)=>(listeners[k]??=new Set()).add(fn),removeEventListener:(k,fn)=>listeners[k]?.delete(fn),emit:(k,event={})=>[...(listeners[k]??[])].forEach(fn=>fn(event))};}
function setup({reduced=false,enabled=true,reject=false}={}){
  let now=0,id=0;const timers=new Map(),classes=new Set();
  const video=Object.assign(target(),{dataset:{src:'assets/intro/cordel-abertura-aprovada-v06.mp4'},currentTime:0,duration:11.033,plays:0,pauses:0,getAttribute:()=>video.src,play(){this.plays++;return reject?Promise.reject(Error('blocked')):Promise.resolve()},pause(){this.pauses++}});
  const intro={hidden:true,querySelector:()=>video,classList:{add:k=>classes.add(k),remove:k=>classes.delete(k)}},skip=target(),motion=Object.assign(target(),{matches:reduced});
  const document=Object.assign(target(),{getElementById:id=>id==='brand-intro'?intro:skip});
  const window=Object.assign(target(),{CordelAccess:{reduced:()=>motion.matches,state:{intro:enabled}}});
  const context={document,window,matchMedia:()=>motion,setTimeout:(fn,delay)=>{timers.set(++id,{fn,at:now+delay});return id},clearTimeout:id=>timers.delete(id)};
  vm.runInNewContext(code,context);
  function advance(ms){const end=now+ms;while(true){const next=[...timers].filter(([,v])=>v.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;now=next[1].at;timers.delete(next[0]);next[1].fn();}now=end;}
  return {intro,video,skip,motion,document,window,advance,classes};
}
(async()=>{
  const t=setup();assert.equal(t.video.plays,1);assert.equal(t.video.muted,true);assert.equal(t.video.playsInline,true);
  t.video.emit('playing');assert.equal(t.intro.hidden,false);t.video.emit('ended');assert(t.classes.has('intro-leaving'));t.advance(350);assert.equal(t.intro.hidden,true);
  t.window.emit('pageshow',{persisted:true});assert.equal(t.video.plays,2);assert.equal(t.video.currentTime,0);t.video.emit('playing');t.document.emit('keydown',{key:'Tab'});assert.equal(t.intro.hidden,true);
  t.window.emit('pageshow',{persisted:true});t.video.emit('playing');t.skip.emit('click');assert.equal(t.intro.hidden,true);
  t.window.emit('pageshow',{persisted:true});t.video.emit('playing');t.motion.matches=true;t.motion.emit('change');assert.equal(t.intro.hidden,true);
  assert.equal(setup({reduced:true}).video.plays,0);assert.equal(setup({enabled:false}).video.plays,0);
  const blocked=setup({reject:true});await Promise.resolve();assert.equal(blocked.intro.hidden,true);
  const stalled=setup();stalled.advance(8000);stalled.video.emit('playing');assert.equal(stalled.intro.hidden,true);
  const sw={self:{location:{href:'https://example.test/sw.js',origin:'https://example.test'},addEventListener(){}},URL,Response,Headers};
  vm.runInNewContext(fs.readFileSync(path.join(root,'sw.js'),'utf8'),sw);
  for(const [range,want] of [['bytes=0-1','01'],['bytes=7-','789'],['bytes=-3','789'],['bytes=8-99','89'],['bytes=-99','0123456789']]){
    const response=await sw.partialVideo(new Response('0123456789'),range);assert.equal(response.status,206);assert.equal(await response.text(),want);assert.equal(response.headers.get('Content-Length'),String(want.length));
  }
  for(const range of ['bytes=10-','bytes=5-2','bytes=-0','bytes=-','bytes=0-1,3-4','invalid'])assert.equal((await sw.partialVideo(new Response('0123456789'),range)).status,416);
  console.log(JSON.stringify({intro:'initial playback, end, skip, keyboard, reopen, reduced motion, disabled preference, failed playback and loading',offlineVideo:'five valid and six invalid ranges',verification:'events simulated; no browser QA'}));
})().catch(error=>{console.error(error);process.exitCode=1});
