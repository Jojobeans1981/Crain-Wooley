import { Prisma, PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Lazy getter — only initializes when first called (not at build time)
export function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma

  const connectionString = process.env.DATABASE_URL || 'file:./.data/dev.db'
  const log: Prisma.LogLevel[] = process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']

  // Postgres needs the pg adapter; SQLite does not.
  let client: PrismaClient
  if (connectionString && connectionString.startsWith('postgres')) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaPg } = require('@prisma/adapter-pg')
    const adapter = new PrismaPg({ connectionString })
    client = new PrismaClient({ adapter, log })
  } else {
    // Prisma 7+ requires a driver adapter for direct database connections.
    // For local dev we use better-sqlite3 (file:... URLs).
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
    const adapter = new PrismaBetterSqlite3({ url: connectionString })
    client = new PrismaClient({ adapter, log })
  }

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
