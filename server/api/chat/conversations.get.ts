import type { H3Event } from 'h3'
import { prisma } from '../../utils/prisma'
import { isStaff, requireUser } from '../../utils/session'
import { toConversationDto } from '../../utils/serialize'
import { forbidden } from '../../utils/errors'

/**
 * Every student's thread, newest first — the staff inbox (design_spec.md §4.9).
 *
 * Staff-only: a learner has one thread and reads it through the widget, so
 * being able to list all of them is exactly the teacher's view.
 */
export default defineEventHandler(async (event: H3Event) => {
  const user = await requireUser(event)
  if (!isStaff(user)) throw forbidden('Only teachers and admins have an inbox.')

  const rows = await prisma.conversation.findMany({
    orderBy: { lastMessageAt: 'desc' },
    include: {
      user: { select: { id: true, name: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 }
    }
  })

  // 'Unread' compares each thread against its own marker, which no single
  // grouped query can express, so it is one count per thread. Threads only
  // exist once a student has written, so this is bounded by the class size.
  const conversations = await Promise.all(
    rows.map(async (row) => {
      const unread = await prisma.chatMessage.count({
        where: {
          conversationId: row.id,
          fromStaff: false,
          ...(row.staffReadAt ? { createdAt: { gt: row.staffReadAt } } : {})
        }
      })

      return toConversationDto(row, { lastMessage: row.messages[0]?.body ?? '', unread })
    })
  )

  return { conversations }
})
