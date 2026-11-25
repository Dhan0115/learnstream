import { EventEmitter } from 'node:events'
import type { ChatMessage as ChatMessageDto } from '../../src/types/index.ts'

/**
 * The live-chat fan-out (design_spec.md §3.3, decisions 18–19).
 *
 * A stream stays open on `GET /api/chat/stream`; when a message is written,
 * the endpoint publishes it here and every open stream decides whether its own
 * viewer is allowed to see it. This is what makes a reply appear without the
 * student refreshing.
 *
 * The bus is deliberately **in-process**: one Nitro instance, no dependency, no
 * second server. Running several instances behind a load balancer would need a
 * shared bus instead — recorded as an honest limitation in decision 18.
 */

export type ChatEvent =
  | { type: 'message'; conversationId: string; studentId: string; message: ChatMessageDto }
  | { type: 'read'; conversationId: string; studentId: string }

/**
 * Cached on `globalThis` for the same reason the Prisma client is: Nitro
 * reloads server code on change in development, and a fresh emitter on every
 * reload would silently orphan the streams that are still connected.
 */
const globalForChat = globalThis as unknown as { chatBus?: EventEmitter }

const bus = globalForChat.chatBus ?? new EventEmitter()

// Every open widget and inbox subscribes, so Node's default ceiling of ten
// listeners is far too low; exceeding it warns and then drops a listener.
bus.setMaxListeners(0)

globalForChat.chatBus = bus

export function publishChatEvent(event: ChatEvent): void {
  bus.emit('chat', event)
}

/** Subscribes for the lifetime of one stream. The return value unsubscribes. */
export function subscribeToChat(listener: (event: ChatEvent) => void): () => void {
  bus.on('chat', listener)
  return () => {
    bus.off('chat', listener)
  }
}
