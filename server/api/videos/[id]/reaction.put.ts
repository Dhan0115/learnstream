import type { H3Event } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireUser } from '../../../utils/session'
import { parseOrThrow, reactionSchema } from '../../../utils/validation'
import { notFound } from '../../../utils/errors'

/**
 * Set, change or clear the viewer's vote on a lesson (design_spec.md §4.3).
 *
 * A person holds at most one vote per lesson, so choosing a like while a
 * dislike is stored replaces it rather than adding a second row. Counters are
 * adjusted by the difference and written in the same transaction, so the totals
 * on the card always match the rows behind them.
 */
export default defineEventHandler(async (event: H3Event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw notFound()

  const user = await requireUser(event)
  const { kind } = parseOrThrow(reactionSchema, await readBody(event))

  const exists = await prisma.video.findUnique({ where: { id }, select: { id: true } })
  if (!exists) throw notFound()

  const totals = await prisma.$transaction(async tx => {
    const existing = await tx.reaction.findUnique({
      where: { videoId_userId: { videoId: id, userId: user.id } },
      select: { kind: true }
    })

    if (existing?.kind === kind) {
      const video = await tx.video.findUniqueOrThrow({
        where: { id },
        select: { likeCount: true, dislikeCount: true }
      })
      return video
    }

    const data: { likeCount?: { increment: number }; dislikeCount?: { increment: number } } = {}
    if (existing?.kind === 'like') data.likeCount = { increment: -1 }
    if (existing?.kind === 'dislike') data.dislikeCount = { increment: -1 }
    if (kind === 'like') data.likeCount = { increment: 1 }
    if (kind === 'dislike') data.dislikeCount = { increment: 1 }

    if (kind === null) {
      await tx.reaction.deleteMany({ where: { videoId: id, userId: user.id } })
    } else {
      await tx.reaction.upsert({
        where: { videoId_userId: { videoId: id, userId: user.id } },
        create: { videoId: id, userId: user.id, kind },
        update: { kind }
      })
    }

    return tx.video.update({
      where: { id },
      data,
      select: { likeCount: true, dislikeCount: true }
    })
  })

  return { likes: totals.likeCount, dislikes: totals.dislikeCount, reaction: kind }
})
