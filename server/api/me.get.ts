import type { H3Event } from 'h3'
import { prisma } from '../utils/prisma'
import { currentUser, toPublicUser } from '../utils/session'

/**
 * Everything the app needs on first paint for the current visitor.
 *
 * Signed-out visitors get an empty library rather than a 401, so the header and
 * the watch page can call this once without branching on the status code.
 */
export default defineEventHandler(async (event: H3Event) => {
  const user = await currentUser(event)
  if (!user) return { user: null, saved: [], reactions: {} }

  const [saved, reactions] = await Promise.all([
    prisma.savedVideo.findMany({ where: { userId: user.id }, orderBy: { savedAt: 'desc' } }),
    prisma.reaction.findMany({ where: { userId: user.id } })
  ])

  return {
    user: toPublicUser(user),
    saved: saved.map(entry => ({
      videoId: entry.videoId,
      savedAt: entry.savedAt.toISOString()
    })),
    reactions: Object.fromEntries(reactions.map(row => [row.videoId, row.kind]))
  }
})
