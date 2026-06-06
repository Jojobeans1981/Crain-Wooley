import 'dotenv/config'
import { defineConfig } from 'prisma/config'

// Supabase Postgres. The app runtime connects via the PrismaPg adapter in
// lib/db/prisma.ts using the pooled DATABASE_URL. The Prisma CLI (migrate /
// generate) uses the URL below — prefer DIRECT_URL (port 5432, non-pooled)
// because migrations can't run over the pgbouncer pooled connection.
// Set DATABASE_URL (pooled) and DIRECT_URL (direct) in Vercel + .env.
export default defineConfig({
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || '',
  },
})
