import type { H3Event } from 'h3'
import { prisma } from '../../../utils/prisma'
import { toCommentDto } from '../../../utils/serialize'
import { notFound } from '../../../utils/errors'

/** Questions and comments on a lesson, oldest first (design_spec.md §4.8). */
export default defineEventHandler(async (event: H3Event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw notFound()

  const exists = await prisma.video.findUnique({ where: { id }, select: { id: true } })
  if (!exists) throw notFound()

  const comments = await prisma.comment.findMany({
    where: { videoId: id },
    orderBy: { createdAt: 'asc' }
  })

  return { comments: comments.map(toCommentDto) }
})
