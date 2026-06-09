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
  const nextBin = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next')

  console.warn('prisma migrate deploy skipped - run separately when the database is reachable')

  const buildStatus = run(nextBin, ['build', '--webpack'])
  process.exit(buildStatus)
}

main()
