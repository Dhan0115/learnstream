import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

/**
 * A single PrismaClient for the whole server process.
 *
 * Nitro reloads server code on change during development, so the instance is
 * cached on `globalThis` — otherwise every reload would open another pool of
 * connections to the database.
 *
 * Prisma 7 requires a driver adapter; PostgreSQL is reached through `pg` using
 * the pooled `DATABASE_URL` (prisma.config.ts uses `DIRECT_URL` for CLI work).
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn']
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
