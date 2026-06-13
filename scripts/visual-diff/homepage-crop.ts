/* Homepage same-scale per-band crops (orig top, clone bottom, NATIVE 1440, no resize). */
import { chromium, type Page } from 'playwright'
import { writeFileSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { PNG } from 'pngjs'
import { SCORPION_HIDE_CSS } from './scorpion-hide'
const ORIG='https://www.estateplanningdfw.law', CLONE=process.env.CLONE_ORIGIN||'http://localhost:3210'
const OUT=`${homedir()}/Desktop/homepage-review`
const BANDS: [string,string,string][] = [
  ['hero','#MainstageS6','.cw-hero'],
  ['introvideo','#VideoS1','.cw-intro'],
  ['guideband','#CTAsV1','.cw-guide'],
  ['practiceareas','#ServicesS1','.cw-services'],
  ['latestnews','#BlogS1','.cw-news'],
]
async function prep(pg:Page,url:string){await pg.goto(url,{waitUntil:'load',timeout:60000});await pg.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=500){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,80))}window.scrollTo(0,0)});await pg.addStyleTag({content:'[data-onvisible],.anm,[class*="anm"],.reveal,.reveal-stagger,.reveal-stagger>*{opacity:1!important;transform:none!important;visibility:visible!important}'}).catch(()=>{});await pg.addStyleTag({content:'.cw-site-header,[id^="Header"],.hdr,header.hdr,[class*="-sticky"]{position:static!important;top:auto!important}'}).catch(()=>{});await pg.addStyleTag({content:SCORPION_HIDE_CSS}).catch(()=>{});await pg.evaluate(()=>Promise.all(Array.from(document.images).map(i=>i.complete?0:new Promise<void>(r=>{i.onload=()=>r();i.onerror=()=>r();setTimeout(()=>r(),4000)}))));await Promise.race([pg.evaluate(()=>document.fonts.ready.then(()=>undefined)),pg.waitForTimeout(4000)]).catch(()=>{});await pg.waitForTimeout(900)}
async function shot(pg:Page,sel:string){const l=pg.locator(sel).first();if(!await l.count())return null;await l.scrollIntoViewIfNeeded().catch(()=>{});await pg.waitForTimeout(300);try{return PNG.sync.read(await l.screenshot() as Buffer)}catch{return null}}
function canvas(s:PNG,w:number,h:number){const o=new PNG({width:w,height:h});o.data.fill(238);for(let y=0;y<Math.min(h,s.height);y++)for(let x=0;x<Math.min(w,s.width);x++){const si=(s.width*y+x)<<2,di=(w*y+x)<<2;o.data[di]=s.data[si];o.data[di+1]=s.data[si+1];o.data[di+2]=s.data[si+2];o.data[di+3]=255}return o}
function stack(o:PNG,c:PNG){const W=Math.max(o.width,c.width),gap=3,H=o.height+gap+c.height;const op=canvas(o,W,o.height),cp=canvas(c,W,c.height);const out=new PNG({width:W,height:H});out.data.fill(0);const blit=(s:PNG,oy:number)=>{for(let y=0;y<s.height;y++)for(let x=0;x<W;x++){const si=(W*y+x)<<2,di=(W*(oy+y)+x)<<2;out.data[di]=s.data[si];out.data[di+1]=s.data[si+1];out.data[di+2]=s.data[si+2];out.data[di+3]=255}};blit(op,0);blit(cp,o.height+gap);return out}
;(async()=>{mkdirSync(OUT,{recursive:true});const b=await chromium.launch()
  const pgO=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});await prep(pgO,ORIG+'/')
  const pgC=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});await prep(pgC,CLONE+'/')
  for(const [name,os,cs] of BANDS){const o=await shot(pgO,os),c=await shot(pgC,cs)
    if(!o||!c){console.log(`${name}: MISSING ${!o?'orig':'clone'}`);continue}
    writeFileSync(`${OUT}/${name}.png`,PNG.sync.write(stack(o,c)))
    console.log(`${name}: orig ${o.width}x${o.height} | clone ${c.width}x${c.height} ${o.width===c.width?'(same-scale ✓)':''} ${Math.abs(o.height-c.height)<=10?'~same height':'hΔ '+(c.height-o.height)}`)}
  await pgO.close();await pgC.close();await b.close()})()
