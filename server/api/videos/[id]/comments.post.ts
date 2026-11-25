import type { H3Event } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireUser } from '../../../utils/session'
import { toCommentDto } from '../../../utils/serialize'
import { commentSchema, parseOrThrow } from '../../../utils/validation'
import { notFound } from '../../../utils/errors'

/**
 * Post a question on a lesson. The author's name is snapshotted onto the row so
 * the thread keeps its attribution if the account is later renamed.
 */
export default defineEventHandler(async (event: H3Event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw notFound()

  const user = await requireUser(event)
  const { body } = parseOrThrow(commentSchema, await readBody(event))

  const exists = await prisma.video.findUnique({ where: { id }, select: { id: true } })
  if (!exists) throw notFound()

  const comment = await prisma.comment.create({
    data: { videoId: id, userId: user.id, authorName: user.name, body }
  })

  return { comment: toCommentDto(comment) }
})
