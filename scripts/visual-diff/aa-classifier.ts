/*
 * AA-classifier adjudication — for each desktop band, decide whether the residual is a
 * pure-AA floor (height matches AND the diff is spatially DISTRIBUTED + thin per row)
 * or real structural/content residual (height mismatch, OR the diff concentrates in a
 * region/row). Pure-AA + geometry-verified = exception candidate; otherwise needs fix.
 * Usage: CLONE_ORIGIN=http://localhost:3210 npx tsx scripts/visual-diff/aa-classifier.ts
 */
import { chromium, type Page } from 'playwright'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'
const ORIG='https://www.estateplanningdfw.law', CLONE=process.env.CLONE_ORIGIN||'http://localhost:3210'
const P='/about-us/pricing/flat-rate-services/'
const BANDS=[
  {k:'intro+body',c:'.cw-fb-main',o:'#FAQsS2'},
  {k:'values',c:'.cw-values',o:'#ValuesV2'},
  {k:'faq',c:'.cw-faqband',o:'#FAQsS3'},
  {k:'testimonials',c:'.cw-reviews',o:'#ReviewsS8, .rvw'},
  {k:'footer',c:'footer.cw-site-footer, footer',o:'footer, [id^="Footer"]'},
]
async function prep(pg:Page,url:string){await pg.goto(url,{waitUntil:'load',timeout:60000});await pg.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){scrollTo(0,y);await new Promise(r=>setTimeout(r,60))}scrollTo(0,0)});await pg.addStyleTag({content:'[data-onvisible],.anm,[class*="anm"],.reveal,.reveal-stagger,.reveal-stagger>*{opacity:1!important;transform:none!important;visibility:visible!important}'});await pg.addStyleTag({content:'.cw-site-header,[id^="Header"],.hdr,[class*="-sticky"]{position:static!important;top:auto!important}'});await pg.addStyleTag({content:'#scorpion_connect,.connect-page,[class*="cta-tile"],[class*="ctas-tiles"]{display:none!important}'});await pg.evaluate(()=>{document.querySelectorAll('img[data-src]').forEach(e=>{const s=e.getAttribute('data-src');if(s)e.setAttribute('src',s)})});await pg.waitForTimeout(800)}
async function shot(pg:Page,sel:string){const l=pg.locator(sel).first();if(!await l.count())return null;await l.scrollIntoViewIfNeeded().catch(()=>{});await l.evaluate(el=>Promise.all([...el.querySelectorAll('img')].map(i=>i.complete?0:new Promise<void>(r=>{(i as any).loading='eager';i.onload=()=>r();i.onerror=()=>r();setTimeout(()=>r(),4000)})))).catch(()=>{});await pg.waitForTimeout(200);return PNG.sync.read(await l.screenshot() as Buffer)}
function pad(s:PNG,w:number,h:number){const o=new PNG({width:w,height:h});o.data.fill(255);for(let y=0;y<Math.min(h,s.height);y++)for(let x=0;x<Math.min(w,s.width);x++){const si=(s.width*y+x)<<2,di=(w*y+x)<<2;o.data[di]=s.data[si];o.data[di+1]=s.data[si+1];o.data[di+2]=s.data[si+2];o.data[di+3]=255}return o}
;(async()=>{
  const b=await chromium.launch()
  const pgO=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});await prep(pgO,ORIG+P)
  const pgC=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});await prep(pgC,CLONE+P)
  console.log('band            diff%   hΔ    rowMax%  rowMean%  spread  verdict')
  for(const bd of BANDS){
    const o=await shot(pgO,bd.o),c=await shot(pgC,bd.c)
    if(!o||!c){console.log(bd.k.padEnd(15),'missing');continue}
    const W=Math.max(o.width,c.width),H=Math.max(o.height,c.height)
    const a=pad(o,W,H),cc=pad(c,W,H),d=new PNG({width:W,height:H})
    const ch=pixelmatch(a.data,cc.data,d.data,W,H,{threshold:0.1})
    const pct=ch/(W*H)*100, hd=c.height-o.height
    // per-row diff profile
    const rows:number[]=[]
    for(let y=0;y<H;y++){let n=0;for(let x=0;x<W;x++){const i=(W*y+x)<<2;if(d.data[i]===255&&d.data[i+1]<100)n++}rows.push(n/W*100)}
    const rowMax=Math.max(...rows), rowMean=rows.reduce((s,v)=>s+v,0)/rows.length
    // spread: fraction of rows with >2% diff (distributed) vs concentrated
    const active=rows.filter(v=>v>2).length/rows.length
    // verdict: AA-floor if height matches (<=6px) AND distributed (rowMax not >>rowMean) AND rowMax modest
    const heightOk=Math.abs(hd)<=6
    const distributed=active>0.5 && rowMax < rowMean*4
    const verdict = !heightOk ? 'NEEDS-FIX (height '+hd+'px)' : (rowMax>45 ? 'NEEDS-FIX (concentrated '+rowMax.toFixed(0)+'%)' : (pct<6 && distributed ? 'AA-FLOOR candidate' : 'NEEDS-FIX (residual '+pct.toFixed(1)+'%)'))
    console.log(bd.k.padEnd(15),pct.toFixed(2).padStart(5),String(hd).padStart(5),rowMax.toFixed(1).padStart(7),rowMean.toFixed(2).padStart(8),(active*100).toFixed(0).padStart(6)+'%',' '+verdict)
  }
  await b.close()
})()
