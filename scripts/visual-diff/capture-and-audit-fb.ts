/*
 * Capture a family-B page's baseline HTML ONCE (courteous single fetch), commit
 * it, then audit the <main> section breakdown OFFLINE so the >=99% body-text gate
 * is reproducible (no live re-fetch). If the baseline already exists on disk it is
 * loaded offline — the live site is never hit twice for the same URL.
 *
 * Usage: npx tsx scripts/visual-diff/capture-and-audit-fb.ts /estate-planning/asset-protection/
 */
import { chromium } from 'playwright'
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs'

const ORIGIN = 'https://www.estateplanningdfw.law'

async function main() {
  const raw = process.argv[2]
  if (!raw) throw new Error('usage: capture-and-audit-fb.ts <path>')
  const key = '/' + raw.replace(/^\/+|\/+$/g, '')
  const slug = key.replace(/^\//, '').replace(/\//g, '__')
  const dir = `docs/reference/capture/${slug}/desktop`
  const file = `${dir}/original.html`

  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } })

  if (existsSync(file)) {
    await p.route('**', (r) => r.abort())
    await p.setContent(readFileSync(file, 'utf8'), { waitUntil: 'commit', timeout: 15000 }).catch(() => {})
    await p.waitForTimeout(200)
    console.log('loaded baseline OFFLINE:', file)
  } else {
    // courtesy: a single load, generous timeout, no tight retry loop
    await p.goto(ORIGIN + key + '/', { waitUntil: 'load', timeout: 60_000 })
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)) } window.scrollTo(0, 0) })
    await p.waitForTimeout(800)
    const html = await p.content()
    mkdirSync(dir, { recursive: true })
    writeFileSync(file, html)
    console.log('captured baseline (committed):', file)
  }

  const audit = await p.evaluate(() => {
    const mainEl = (document.querySelector('main') || document.body) as HTMLElement
    const rows: unknown[] = []
    let bodyChars = 0
    let closerChars = 0
    let droppedChars = 0
    for (const sec of Array.from(mainEl.children) as HTMLElement[]) {
      const stx = (sec.textContent || '').replace(/\s+/g, ' ').trim()
      const cls = (sec.className?.toString() || '').toLowerCase()
      let kind = 'content'
      if (/Estate Planning With Us Means|DESIGNED FOR YOUR COMFORT/i.test(stx) || /(^|\s)vls(\s|$)/.test(cls)) kind = 'closer:pillars'
      else if (/Schedule a Consultation Today/i.test(stx) || /(^|\s)cta(\s|$)/.test(cls)) kind = 'closer:schedule'
      else if (/What (Our|People)[^.]{0,30}Say|client testimonials|hear from our clients/i.test(stx) || /(^|\s)(rvw|tst|testim|review)/.test(cls)) kind = 'closer:testimonials'
      else if (sec.tagName === 'FORM' || sec.id === 'Form_BannerV1' || /banner/.test(cls)) kind = 'banner'
      else if (/(^|\s)(aws|awards|stf|staff)/.test(cls)) kind = 'skip:awards/staff'
      if (kind === 'content') bodyChars += stx.length
      else if (kind.startsWith('closer')) closerChars += stx.length
      else droppedChars += stx.length
      rows.push({ tag: sec.tagName.toLowerCase(), id: sec.id || '', cls: cls.slice(0, 28), kind, chars: stx.length })
    }
    return { rows, bodyChars, closerChars, droppedChars }
  })
  await b.close()
  console.log('\n=== <main> section breakdown for ' + key + ' ===')
  for (const r of audit.rows as Record<string, unknown>[]) console.log(`  [${String(r.kind).padEnd(18)}] ${String(r.tag)}#${String(r.id)}.${String(r.cls)}  chars=${r.chars}`)
  console.log(`\n  BODY (content) chars:   ${audit.bodyChars}`)
  console.log(`  CLOSER chars (masked):  ${audit.closerChars}`)
  console.log(`  banner/awards dropped:  ${audit.droppedChars}`)
}
main().catch((e) => { console.error(e); process.exit(1) })
