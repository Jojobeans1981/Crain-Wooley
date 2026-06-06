import { Prisma, PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Lazy getter — only initializes the client (and opens the pool) on first use,
// never at build time. Postgres via the PrismaPg driver adapter, using the
// pooled DATABASE_URL (Supabase Supavisor / pgbouncer). DIRECT_URL is used only
// by `prisma migrate` (see prisma.config.ts).
export function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set (expected a Postgres connection string).')
  }
  const log: Prisma.LogLevel[] = process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']

  const adapter = new PrismaPg({ connectionString })
  const client = new PrismaClient({ adapter, log })

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client
  }

  return client
}

// Named export for convenience — still lazy
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getPrisma() as any)[prop]
  },
})
