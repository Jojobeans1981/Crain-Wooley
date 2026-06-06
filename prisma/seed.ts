import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DIRECT_URL/DATABASE_URL is not set (expected a Postgres connection string).')
}
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
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
