import { spawnSync } from 'node:child_process'
import path from 'node:path'

const root = process.cwd()
const nodeBin = process.execPath

function run(scriptPath, args) {
  const res = spawnSync(nodeBin, [scriptPath, ...args], {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  })

  if (res.error) {
    throw res.error
  }

  return res.status ?? 0
}

function main() {
  const prismaBin = path.join(root, 'node_modules', 'prisma', 'build', 'index.js')
  const nextBin = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next')

  // Generate the Prisma client before building. There is no postinstall hook, so a
  // fresh CI/Vercel install otherwise leaves @prisma/client ungenerated and `next
  // build` (which compiles the admin/intake routes importing it) fails. `prisma
  // generate` only reads the schema — it does NOT need DATABASE_URL.
  const genStatus = run(prismaBin, ['generate'])
  if (genStatus !== 0) process.exit(genStatus)

  console.warn('prisma migrate deploy skipped - run separately when the database is reachable')

  const buildStatus = run(nextBin, ['build', '--webpack'])
  process.exit(buildStatus)
}

main()
