import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || 'file:./.data/dev.db' }),
})

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL
  if (!email) {
    console.log('SEED_ADMIN_EMAIL not set; skipping admin seed.')
    return
  }

  await prisma.adminUser.upsert({
    where: { email },
    update: { role: 'SUPER_ADMIN' },
    create: { email, role: 'SUPER_ADMIN' },
  })

  console.log(`Seeded SUPER_ADMIN: ${email}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
