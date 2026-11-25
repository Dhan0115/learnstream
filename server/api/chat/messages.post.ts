import type { H3Event } from 'h3'
import { prisma } from '../../utils/prisma'
import { isStaff, requireUser } from '../../utils/session'
import { toChatMessageDto } from '../../utils/serialize'
import { chatMessageSchema, parseOrThrow } from '../../utils/validation'
import { badRequest, notFound } from '../../utils/errors'
import { publishChatEvent } from '../../utils/chat'

/**
 * Write a line of live chat (design_spec.md §3.3).
 *
 * A learner writes into their own single thread, which is created on the first
 * message so an account that never asks a question leaves no empty row behind.
 * Staff must name the conversation they are answering. Publishing the row on
 * the bus is what turns it into a live update for whoever is watching.
 */
export default defineEventHandler(async (event: H3Event) => {
  const user = await requireUser(event)
  const { body, conversationId: requestedId } = parseOrThrow(chatMessageSchema, await readBody(event))

  const staff = isStaff(user)

  let targetId: string
  let studentId: string

  if (staff) {
    if (!requestedId) throw badRequest('Choose a conversation to reply to.', 'conversation_required')

    const conversation = await prisma.conversation.findUnique({
      where: { id: requestedId },
      select: { id: true, userId: true }
    })
    if (!conversation) throw notFound('That conversation could not be found.')

    targetId = conversation.id
    studentId = conversation.userId
  } else {
    const conversation = await prisma.conversation.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
      select: { id: true, userId: true }
    })

    targetId = conversation.id
    studentId = conversation.userId
  }

  const now = new Date()

  // The message and the thread's ordering/read markers move together, so the
  // inbox can never sort by a line it has not stored yet.
  const [message] = await prisma.$transaction([
    prisma.chatMessage.create({
      data: {
        conversationId: targetId,
        authorId: user.id,
        authorName: user.name,
        fromStaff: staff,
        body
      }
    }),
    prisma.conversation.update({
      where: { id: targetId },
      data: {
        lastMessageAt: now,
        // Writing a line is proof of having read everything before it.
        ...(staff ? { staffReadAt: now } : { studentReadAt: now })
      }
    })
  ])

  const created = toChatMessageDto(message)
  publishChatEvent({ type: 'message', conversationId: targetId, studentId, message: created })

  return { message: created }
})
