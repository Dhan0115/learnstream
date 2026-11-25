import { PrismaClient } from '@prisma/client'

/**
 * A single PrismaClient for the whole server process.
 *
 * Nitro reloads server code on change during development, so the instance is
 * cached on `globalThis` — otherwise every reload would open another pool of
 * connections to SQLite.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn']
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
