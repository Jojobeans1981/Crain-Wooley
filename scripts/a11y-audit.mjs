/**
 * Accessibility audit helper for docs/accessibility-audit.md.
 *
 *   node scripts/a11y-audit.mjs            → prints the Stage-1 contrast table
 *   node scripts/a11y-audit.mjs --axe      → prints the axe URL list + how to run it
 *
 * Contrast is computed deterministically here (no browser). The axe pass was run
 * by injecting node_modules/axe-core/axe.min.js into each served page via the
 * gstack headless browser and reading axe.run() off window; re-run instructions
 * are printed with --axe. Pure reporting tool — changes no app code.
 */

// ── WCAG relative-luminance contrast ──
const lin = (v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))
const lum = (hex) => {
  const [r, g, b] = hex.replace('#', '').match(/.{2}/g).map((h) => lin(parseInt(h, 16) / 255))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const ratio = (fg, bg) => {
  const a = lum(fg), b = lum(bg)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}
/** Alpha-composite an rgba foreground over a solid hex background → effective hex. */
const over = (fg, alpha, bg) => {
  const F = fg.replace('#', '').match(/.{2}/g).map((h) => parseInt(h, 16))
  const B = bg.replace('#', '').match(/.{2}/g).map((h) => parseInt(h, 16))
  return '#' + F.map((f, i) => Math.round(f * alpha + B[i] * (1 - alpha)).toString(16).padStart(2, '0')).join('')
}
const pass = (v, large) => (v >= (large ? 3 : 4.5) ? 'PASS' : 'FAIL')

const PAIRS = [
  ['gold #9B8059', 'white #FFFFFF', '#9B8059', '#FFFFFF', 'normal text / inline link / eyebrow labels'],
  ['gold #9B8059', 'off-white #F7F7F7', '#9B8059', '#F7F7F7', 'link / label on light surface'],
  ['gold #9B8059', 'slate #304451', '#9B8059', '#304451', 'nav hover, footer office headings, accents on slate'],
  ['white #FFFFFF', 'gold #9B8059', '#FFFFFF', '#9B8059', 'announcement bar + gold buttons (Contact/Book/Drain)'],
  ['gold-soft #D5C0A2', 'gold #9B8059', '#D5C0A2', '#9B8059', 'chip count number on active gold chip'],
  ['gold-soft #D5C0A2', 'slate #304451', '#D5C0A2', '#304451', 'active nav item + breadcrumb links on slate'],
  ['slate #304451', 'white #FFFFFF', '#304451', '#FFFFFF', 'headings + banner title on white'],
  ['body #3c4751', 'white #FFFFFF', '#3c4751', '#FFFFFF', 'our legacy / intro body text'],
  ['white #FFFFFF', 'slate #304451', '#FFFFFF', '#304451', 'nav links / banner H1 on slate'],
  ['legacy nested #56606a', 'white #FFFFFF', '#56606a', '#FFFFFF', 'sidebar depth-3 links / muted body'],
]
const ALPHA = [
  ['on-slate-mute white@.72', '#FFFFFF', 0.72, '#304451', 'phone city / muted text on slate'],
  ['flyout link white@.85', '#FFFFFF', 0.85, '#283b46', 'mega-menu flyout links'],
  ['hero-sub white@.9', '#FFFFFF', 0.9, '#304451', 'hero subcopy over overlay'],
  ['search-muted slate@.62', '#304451', 0.62, '#F7F7F7', 'search result count / muted'],
  ['search-placeholder slate@.5', '#304451', 0.5, '#FFFFFF', 'search input placeholder'],
]

if (process.argv.includes('--axe')) {
  console.log('Automated axe-core pass — re-run procedure:')
  console.log('  1. npm install -D axe-core')
  console.log('  2. npm run build && PORT=3110 npm start')
  console.log('  3. cat node_modules/axe-core/axe.min.js > /tmp/axe-run.js')
  console.log("     echo 'axe.run(document,{resultTypes:[\"violations\"]}).then(r=>window.__AXE=r)' >> /tmp/axe-run.js")
  console.log('  4. For each URL: headless goto → inject /tmp/axe-run.js → read window.__AXE.violations')
  console.log('\nRepresentative URL set:')
  for (const u of ['/', '/estate-planning/trusts', '/learn', '/learn/quizzes/do-you-need-a-trust', '/blogs', '/site-search?q=trust', '/learn/for/retirees', '/get-started', '/qualify', '/schedule', '/payment', '/confirmation']) {
    console.log('  ' + u)
  }
  process.exit(0)
}

console.log('Stage-1 token contrast (WCAG 1.4.3 / 1.4.11) — normal 4.5:1, large 3:1, UI 3:1\n')
console.log('foreground'.padEnd(26), 'background'.padEnd(18), 'ratio'.padEnd(8), 'normal', 'large')
const printRow = (fg, bg, r, use) => {
  const v = r.toFixed(2)
  console.log(fg.padEnd(26), bg.padEnd(18), (v + ':1').padEnd(8), pass(r, false).padEnd(6), pass(r, true), '|', use)
}
for (const [fg, bg, fHex, bHex, use] of PAIRS) printRow(fg, bg, ratio(fHex, bHex), use)
for (const [label, fg, a, bg, use] of ALPHA) printRow(`${label} → ${over(fg, a, bg)}`, bg, ratio(over(fg, a, bg), bg), use)
