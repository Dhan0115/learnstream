import type { H3Event } from 'h3'
import { prisma } from '../../../utils/prisma'
import { currentUser } from '../../../utils/session'
import { viewerKey } from '../../../utils/viewer'
import { VIEW_DEDUPE_WINDOW_MS } from '../../../utils/config'
import { notFound } from '../../../utils/errors'

/**
 * Count a view (design_spec.md §4.3).
 *
 * The player calls this once playback is under way. A row is written so the
 * total is auditable, and a repeat view from the same viewer inside the dedupe
 * window is ignored — refreshing the page must not inflate the count. The same
 * decision is made inside the transaction as the increment, so two parallel
 * calls from one viewer cannot both count.
 */
export default defineEventHandler(async (event: H3Event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw notFound()

  const exists = await prisma.video.findUnique({ where: { id }, select: { id: true } })
  if (!exists) throw notFound()

  const user = await currentUser(event)
  const viewer = viewerKey(event)
  const since = new Date(Date.now() - VIEW_DEDUPE_WINDOW_MS)

  const views = await prisma.$transaction(async tx => {
    const recent = await tx.view.findFirst({
      where: { videoId: id, viewerKey: viewer, createdAt: { gte: since } },
      select: { id: true }
    })

    if (recent) {
      const video = await tx.video.findUnique({ where: { id }, select: { viewCount: true } })
      return video?.viewCount ?? 0
    }

    await tx.view.create({ data: { videoId: id, userId: user?.id ?? null, viewerKey: viewer } })
    const updated = await tx.video.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
      select: { viewCount: true }
    })
    return updated.viewCount
  })

  return { views }
})
