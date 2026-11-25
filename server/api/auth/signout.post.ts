import type { H3Event } from 'h3'
import { endSession } from '../../utils/session'

export default defineEventHandler(async (event: H3Event) => {
  await endSession(event)
  return { ok: true }
})
