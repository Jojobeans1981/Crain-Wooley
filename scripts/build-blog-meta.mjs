// Generate lib/legacy/blog-meta.json: per-post {date, author, categories:[{slug,name}], image}
// from a live crawl (og:image + category links + byline + <time>), with the APPROVED
// author + category normalization maps applied. Re-runnable. NOT a pixel/asset step.
import { readFileSync, writeFileSync } from 'node:fs'
const posts = readFileSync('/tmp/blog_posts.txt','utf8').trim().split('\n')
const blogImages = JSON.parse(readFileSync('lib/legacy/blog-images.json','utf8'))

// ---- APPROVED AUTHOR MAP ----
function canonAuthor(raw){
  const s=(raw||'').trim()
  if(!s) return 'Crain & Wooley'
  if(/^crain\s*&\s*wooley$/i.test(s)) return 'Crain & Wooley'
  if(/justin\s+(crain|carin|t\.?\s*crain)/i.test(s)) return 'Justin T. Crain, Managing Partner & Attorney'
  if(/shelly\s+joyner/i.test(s)) return 'Shelly Joyner, Associate Attorney'
  if(/jacob\s+k?\.?\s*wooley/i.test(s)) return 'Jacob Wooley, Partner & Attorney'
  if(/cole\s+mcneil/i.test(s)) return 'Cole McNeil, Associate Attorney'
  return s // unknown -> preserve verbatim (flagged in report if any)
}
// ---- APPROVED CATEGORY MAP (keyed by source slug) ----
// label-only fixes keep the slug; disability-plannng reassigns to disability-planning;
// website is dropped.
const CAT_NAME_FIX = { 'gaurdianship':'Guardianship', 'financial-power-of-attorney':'Financial Power of Attorney', 'medical-power-of-attorney':'Medical Power of Attorney' }
const CAT_REASSIGN = { 'disability-plannng': 'disability-planning' }
const DROP = new Set(['website'])
function canonCategory(slug, name){
  if(DROP.has(slug)) return null
  const tgt = CAT_REASSIGN[slug] || slug
  const display = CAT_NAME_FIX[tgt] || (tgt===slug ? name : 'Disability Planning')
  return { slug: tgt, name: display }
}

async function crawl(url){
  try{
    const ctrl=new AbortController(); const to=setTimeout(()=>ctrl.abort(),20000)
    const r=await fetch(url,{signal:ctrl.signal}); clearTimeout(to)
    if(r.status>=400) return {err:r.status}
    const html=await r.text()
    const meta=n=>{const re1=new RegExp(`<meta[^>]+(?:property|name)=["']${n}["'][^>]*content=["']([^"']*)["']`,'i'),re2=new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${n}["']`,'i');return (html.match(re1)||html.match(re2)||[])[1]||''}
    const date=html.match(/<time[^>]*>([^<]+)</i)?.[1]?.trim()||''
    const author=(html.match(/[Bb]y\s*<[^>]*>\s*([^<]+)/)?.[1]||'').trim()
    const catLinks=[...html.matchAll(/href=["'][^"']*\/blogs\/categories\/([^"'/]+)\/?["'][^>]*>([^<]+)</gi)].map(m=>({slug:m[1].trim(),name:m[2].trim()}))
    const ogImg=meta('og:image')
    return {date,author,catLinks,ogImg}
  }catch(e){return {err:e.name}}
}

const META={}; const errs=[]; const unknownAuthors=new Set()
const q=[...posts]; let active=0
await new Promise(res=>{const next=()=>{if(!q.length&&active===0)return res();while(active<12&&q.length){const url=q.shift();active++;crawl(url).then(d=>{
  const path=url.replace('https://www.estateplanningdfw.law','').replace(/\/$/,'')
  if(d.err){errs.push({path,err:d.err});return}
  const author=canonAuthor(d.author)
  if(d.author && !/justin|shelly|jacob|cole|crain\s*&\s*wooley/i.test(d.author)) unknownAuthors.add(d.author)
  const cats=[]; const seen=new Set()
  for(const c of d.catLinks){const cc=canonCategory(c.slug,c.name); if(cc && !seen.has(cc.slug)){seen.add(cc.slug); cats.push(cc)}}
  META[path]={ date:d.date, author, categories:cats, image: blogImages[path]||null, ogImage:d.ogImg||null }
}).finally(()=>{active--;next()})}};next()})

// build the canonical category catalog (slug -> {name, count})
const catalog={}
for(const p of Object.values(META)) for(const c of p.categories){ if(!catalog[c.slug]) catalog[c.slug]={slug:c.slug,name:c.name,count:0}; catalog[c.slug].count++ }
const uncategorized = Object.entries(META).filter(([,m])=>m.categories.length===0).map(([p])=>p)

writeFileSync('lib/legacy/blog-meta.json', JSON.stringify(META,null,1))
writeFileSync('lib/legacy/blog-categories.json', JSON.stringify(Object.values(catalog).sort((a,b)=>a.name.localeCompare(b.name)),null,1))
console.log(`META ${Object.keys(META).length}/${posts.length} | errors ${errs.length}`)
console.log(`categories ${Object.keys(catalog).length} | uncategorized posts ${uncategorized.length}`)
console.log('reassign disability-plannng->disability-planning applied; gaurdianship label=Guardianship; website dropped')
if(unknownAuthors.size) console.log('UNKNOWN AUTHORS (verbatim-kept):',JSON.stringify([...unknownAuthors]))
if(errs.length) console.log('ERRORS:',JSON.stringify(errs.slice(0,8)))
