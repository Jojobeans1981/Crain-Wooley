// One-time: crop the baked-in title/logo panel off the Scorpion "crain-wooley-ad"
// blog composites so /blogs cards show clean photos. Idempotent (ratio guard).
import sharp from 'sharp'
import { readdir } from 'node:fs/promises'
import path from 'node:path'

const DIR = 'public/legacy/blog'
const LEFT_FRAC = 0.358 // title panel = left 35.8% of the fixed Scorpion ad template

const files = (await readdir(DIR)).filter((f) => /^crain-wooley-ad.*\.(jpe?g|png)$/i.test(f))
let done = 0
for (const f of files) {
  const fp = path.join(DIR, f)
  const { width, height } = await sharp(fp).metadata()
  if (!width || !height) { console.log(`skip ${f} (no dims)`); continue }
  if (width / height < 1.7) { console.log(`skip ${f} (ratio ${(width / height).toFixed(2)} — already cropped / not a panel composite)`); continue }
  const left = Math.round(width * LEFT_FRAC)
  const buf = await sharp(fp).extract({ left, top: 0, width: width - left, height }).toBuffer()
  await sharp(buf).toFile(fp)
  console.log(`cropped ${f}: ${width}x${height} -> ${width - left}x${height}`)
  done++
}
console.log(`Done. Cropped ${done} of ${files.length} matched files.`)
