import type { H3Event } from 'h3'
import { prisma } from '../utils/prisma'

/**
 * Liveness probe. Reports whether the API can reach the database, so a failed
 * deploy is caught by a request rather than by a user.
 */
export default defineEventHandler(async (_event: H3Event) => {
  await prisma.$queryRaw`SELECT 1`

  return {
    status: 'ok',
    database: 'up',
    time: new Date().toISOString()
  }
})
