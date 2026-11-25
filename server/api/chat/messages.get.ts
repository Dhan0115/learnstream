import { getQuery, type H3Event } from 'h3'
import { prisma } from '../../utils/prisma'
import { isStaff, requireUser } from '../../utils/session'
import { toChatMessageDto } from '../../utils/serialize'
import { badRequest, notFound } from '../../utils/errors'

/**
 * The lines in one support conversation, oldest first (design_spec.md §4.9).
 *
 * A learner has exactly one thread — the schema makes `Conversation.userId`
 * unique — so theirs is found by account and a learner can never read someone
 * else's by guessing an id. Staff hold many threads, so they name the one they
 * are opening and the id is checked before any message is read.
 */
export default defineEventHandler(async (event: H3Event) => {
  const user = await requireUser(event)

  if (isStaff(user)) {
    const requested = getQuery(event).conversation
    if (typeof requested !== 'string' || !requested) {
      throw badRequest('Choose a conversation to open.', 'conversation_required')
    }

    const exists = await prisma.conversation.findUnique({
      where: { id: requested },
      select: { id: true }
    })
    if (!exists) throw notFound('That conversation could not be found.')

    const messages = await prisma.chatMessage.findMany({
      where: { conversationId: requested },
      orderBy: { createdAt: 'asc' }
    })

    return { conversationId: requested, messages: messages.map(toChatMessageDto) }
  }

  const conversation = await prisma.conversation.findUnique({
    where: { userId: user.id },
    select: { id: true }
  })

  // No thread yet is not an error: it appears with the learner's first message.
  if (!conversation) return { conversationId: null, messages: [] }

  const messages = await prisma.chatMessage.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: 'asc' }
  })

  return { conversationId: conversation.id, messages: messages.map(toChatMessageDto) }
})
