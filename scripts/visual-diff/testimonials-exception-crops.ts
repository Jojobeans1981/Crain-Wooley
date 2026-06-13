/*
 * Testimonials exception-review crops (1:1, EQUAL-DIMENSION — banner standard).
 * Geometry-verified after the DOM-pin: title y164/h44, photo y107, name y507, band
 * 732 all match the original (band-gate prep). Residual ~10% is the dense 8-line quote
 * text sub-pixel AA (~2px block drift) + the navy band watermark background image.
 * Usage: CLONE_ORIGIN=http://localhost:3210 npx tsx scripts/visual-diff/testimonials-exception-crops.ts
 */
import { chromium, type Page } from 'playwright'
import { writeFileSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { PNG } from 'pngjs'
const ORIG='https://www.estateplanningdfw.law', CLONE=process.env.CLONE_ORIGIN||'http://localhost:3210'
const P='/about-us/pricing/flat-rate-services/', OUT=`${homedir()}/Desktop/testimonials-exception-review`
async function prep(pg:Page,url:string){await pg.goto(url,{waitUntil:'load',timeout:60000});await pg.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,70))}window.scrollTo(0,0)});await pg.addStyleTag({content:'[data-onvisible],.anm,[class*="anm"],.reveal,.reveal-stagger,.reveal-stagger>*{opacity:1!important;transform:none!important;visibility:visible!important}'}).catch(()=>{});await pg.addStyleTag({content:'.cw-site-header,[id^="Header"],.hdr,header.hdr,[class*="-sticky"]{position:static!important;top:auto!important}'}).catch(()=>{});await pg.addStyleTag({content:'#scorpion_connect,.connect-page,[class*="cta-tile"],[class*="ctas-tiles"]{display:none!important}'}).catch(()=>{});await pg.evaluate(()=>Promise.all(Array.from(document.images).map(i=>i.complete?0:new Promise<void>(r=>{i.onload=()=>r();i.onerror=()=>r();setTimeout(()=>r(),4000)}))));await pg.waitForTimeout(900)}
async function shot(pg:Page,sel:string){const l=pg.locator(sel).first();await l.scrollIntoViewIfNeeded().catch(()=>{});await pg.waitForTimeout(300);return PNG.sync.read(await l.screenshot() as Buffer)}
function canvas(s:PNG,w:number,h:number){const o=new PNG({width:w,height:h});o.data.fill(238);for(let y=0;y<Math.min(h,s.height);y++)for(let x=0;x<Math.min(w,s.width);x++){const si=(s.width*y+x)<<2,di=(w*y+x)<<2;o.data[di]=s.data[si];o.data[di+1]=s.data[si+1];o.data[di+2]=s.data[si+2];o.data[di+3]=255}return o}
function sbs(o:PNG,c:PNG){const W=Math.max(o.width,c.width),H=Math.max(o.height,c.height);const op=canvas(o,W,H),cp=canvas(c,W,H);const gap=2,CW=W*2+gap;const out=new PNG({width:CW,height:H});out.data.fill(0);const blit=(s:PNG,ox:number)=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){const si=(W*y+x)<<2,di=(CW*y+(x+ox))<<2;out.data[di]=s.data[si];out.data[di+1]=s.data[si+1];out.data[di+2]=s.data[si+2];out.data[di+3]=255}};blit(op,0);blit(cp,W+gap);return out}
;(async()=>{mkdirSync(OUT,{recursive:true});const b=await chromium.launch()
  const pgO=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});await prep(pgO,ORIG+P)
  const pgC=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});await prep(pgC,CLONE+P)
  const o=await shot(pgO,'#ReviewsS8'),c=await shot(pgC,'.cw-reviews');await pgO.close();await pgC.close()
  writeFileSync(`${OUT}/testimonials-desktop.png`,PNG.sync.write(sbs(o,c)))
  console.log(`orig ${o.width}x${o.height} clone ${c.width}x${c.height} -> ${OUT}/testimonials-desktop.png`)
  await b.close()})()
