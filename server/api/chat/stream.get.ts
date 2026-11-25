import { createEventStream, type H3Event } from 'h3'
import { isStaff, requireUser } from '../../utils/session'
import { subscribeToChat } from '../../utils/chat'

/**
 * The live-chat stream (design_spec.md decision 18).
 *
 * Server-Sent Events rather than a socket: the server already runs here, the
 * browser reconnects on its own, and the transport stays an ordinary HTTP
 * response, so no dependency or configuration is added. Each stream filters
 * for its own viewer — a learner hears only their own thread, staff hear every
 * thread so the inbox stays live too.
 */

/** A no-op line, so an idle connection is not closed by an intermediary. */
const KEEPALIVE_MS = 25_000

export default defineEventHandler(async (event: H3Event) => {
  const user = await requireUser(event)
  const staff = isStaff(user)

  const stream = createEventStream(event)

  const unsubscribe = subscribeToChat((chatEvent) => {
    // Filtering here rather than in the bus keeps one subscriber per stream and
    // means a learner can never be handed another learner's message.
    if (!staff && chatEvent.studentId !== user.id) return

    void stream.push(JSON.stringify(chatEvent))
  })

  const keepAlive = setInterval(() => {
    void stream.push(JSON.stringify({ type: 'ping' }))
  }, KEEPALIVE_MS)

  stream.onClosed(() => {
    clearInterval(keepAlive)
    unsubscribe()
  })

  return stream.send()
})
