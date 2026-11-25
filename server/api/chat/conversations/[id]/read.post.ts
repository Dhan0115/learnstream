import type { H3Event } from 'h3'
import { prisma } from '../../../../utils/prisma'
import { isStaff, requireUser } from '../../../../utils/session'
import { forbidden, notFound } from '../../../../utils/errors'
import { publishChatEvent } from '../../../../utils/chat'

/**
 * Mark a conversation read for whoever is asking (design_spec.md §4.9).
 *
 * Each side has its own marker, so opening a thread for staff never hides an
 * unread badge from the student, and vice versa. A learner may only mark their
 * own thread; staff may mark any.
 */
export default defineEventHandler(async (event: H3Event) => {
  const user = await requireUser(event)

  const id = getRouterParam(event, 'id')
  if (!id) throw notFound('That conversation could not be found.')

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    select: { id: true, userId: true }
  })
  if (!conversation) throw notFound('That conversation could not be found.')

  const staff = isStaff(user)
  if (!staff && conversation.userId !== user.id) throw forbidden()

  const now = new Date()
  await prisma.conversation.update({
    where: { id },
    data: staff ? { staffReadAt: now } : { studentReadAt: now }
  })

  publishChatEvent({ type: 'read', conversationId: id, studentId: conversation.userId })

  return { ok: true }
})
