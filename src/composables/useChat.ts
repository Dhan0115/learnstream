import { computed, ref } from 'vue'
import { apiGet, apiSend, messageFor } from '@/utils/api'
import { useSession } from '@/composables/useSession'
import type { ChatMessage, Conversation } from '@/types'

/**
 * Live chat (design_spec.md §3.3 widget, §4.9 inbox).
 *
 * The state lives at module scope for two reasons: the widget is mounted once in
 * the app shell and must survive navigation, and a single `EventSource` then
 * feeds both the widget and the staff inbox. Nothing here touches a component,
 * so the same state is shared wherever `useChat()` is called.
 */

const { user, role } = useSession()

const isStaff = computed(() => role.value === 'teacher' || role.value === 'admin')

/** The open thread: the learner's own, or the one staff have selected. */
const messages = ref<ChatMessage[]>([])
const conversationId = ref<string | null>(null)

/** The staff inbox list. */
const conversations = ref<Conversation[]>([])
const activeId = ref<string | null>(null)

const loadingThread = ref(false)
const loadingList = ref(false)
const sending = ref(false)
const threadError = ref('')
const listError = ref('')

/** The widget panel is open. Shared so the unread badge and the panel agree. */
const panelOpen = ref(false)

/** Lines from staff that arrived while the panel was closed (design_spec.md §3.3). */
const unread = ref(0)

const activeConversation = computed(
  () => conversations.value.find(conversation => conversation.id === activeId.value) ?? null
)

/** Frames the server pushes on `/api/chat/stream`. */
type ChatEvent =
  | { type: 'message'; conversationId: string; studentId: string; message: ChatMessage }
  | { type: 'read'; conversationId: string; studentId: string }
  | { type: 'ping' }

let source: EventSource | null = null
let threadLoaded = false

function addMessage(message: ChatMessage): void {
  if (messages.value.some(existing => existing.id === message.id)) return
  messages.value = [...messages.value, message]
}

/** Staff only: keep the list preview and its ordering in step with a new line. */
function patchConversation(id: string, patch: Partial<Conversation>): void {
  conversations.value = conversations.value
    .map(conversation => (conversation.id === id ? { ...conversation, ...patch } : conversation))
    .sort((a, b) => Date.parse(b.lastMessageAt) - Date.parse(a.lastMessageAt))
}

/** Marks a thread read for the current viewer and clears its badge. */
function markRead(id: string): void {
  if (!id) return
  unread.value = 0
  conversations.value = conversations.value.map(conversation =>
    conversation.id === id ? { ...conversation, unread: 0 } : conversation
  )
  // Fire-and-forget: the badge has already cleared, and the next load agrees.
  void apiSend(`/api/chat/conversations/${encodeURIComponent(id)}/read`, 'POST').catch(() => {})
}

function applyEvent(event: ChatEvent): void {
  if (event.type !== 'message') return

  const incoming = event.message

  if (isStaff.value) {
    // A first line from a student the inbox has never seen: pull the list again
    // so the row arrives with the student's name, which the frame does not carry.
    if (!conversations.value.some(conversation => conversation.id === event.conversationId)) {
      void loadConversations()
      return
    }

    const isActive = event.conversationId === activeId.value
    const current = conversations.value.find(c => c.id === event.conversationId)

    patchConversation(event.conversationId, {
      lastMessage: incoming.body,
      lastMessageAt: incoming.createdAt,
      unread: !isActive && !incoming.fromStaff ? (current?.unread ?? 0) + 1 : current?.unread
    })

    if (isActive) {
      addMessage(incoming)
      if (!incoming.fromStaff) markRead(event.conversationId)
    }
    return
  }

  addMessage(incoming)
  // The badge counts what arrived unseen; opening the panel clears it again.
  if (incoming.fromStaff && !panelOpen.value) unread.value += 1
}

/** Opens the stream and loads the side of the conversation this viewer owns. */
function start(): void {
  if (!user.value) {
    stop()
    return
  }

  if (!source) {
    source = new EventSource('/api/chat/stream')
    source.onmessage = (event) => {
      try {
        applyEvent(JSON.parse(event.data) as ChatEvent)
      } catch {
        // A frame we cannot read is dropped; the next one still arrives.
      }
    }
  }

  if (!isStaff.value && !threadLoaded) void loadThread()
}

function stop(): void {
  source?.close()
  source = null
  messages.value = []
  conversationId.value = null
  conversations.value = []
  activeId.value = null
  unread.value = 0
  panelOpen.value = false
  threadError.value = ''
  listError.value = ''
  threadLoaded = false
}

async function loadThread(): Promise<void> {
  if (loadingThread.value) return
  loadingThread.value = true
  threadError.value = ''
  try {
    const payload = await apiGet<{ conversationId: string | null; messages: ChatMessage[] }>(
      '/api/chat/messages'
    )
    conversationId.value = payload.conversationId
    messages.value = payload.messages
    threadLoaded = true
  } catch (error) {
    threadError.value = messageFor(error)
  } finally {
    loadingThread.value = false
  }
}

async function loadConversations(): Promise<void> {
  if (loadingList.value) return
  loadingList.value = true
  listError.value = ''
  try {
    const payload = await apiGet<{ conversations: Conversation[] }>('/api/chat/conversations')
    conversations.value = payload.conversations
  } catch (error) {
    listError.value = messageFor(error)
  } finally {
    loadingList.value = false
  }
}

/** Staff only: open one student's thread and mark it read. */
async function openConversation(id: string): Promise<void> {
  activeId.value = id
  loadingThread.value = true
  threadError.value = ''
  try {
    const payload = await apiGet<{ conversationId: string | null; messages: ChatMessage[] }>(
      `/api/chat/messages?conversation=${encodeURIComponent(id)}`
    )
    conversationId.value = payload.conversationId
    messages.value = payload.messages
    markRead(id)
  } catch (error) {
    threadError.value = messageFor(error)
  } finally {
    loadingThread.value = false
  }
}

/** Sends one line; returns a sentence to show if it failed, otherwise `null`. */
async function send(body: string): Promise<string | null> {
  const text = body.trim()
  if (!text || sending.value) return null

  sending.value = true
  threadError.value = ''

  try {
    const { message } = await apiSend<{ message: ChatMessage }>('/api/chat/messages', 'POST', {
      body: text,
      ...(isStaff.value && activeId.value ? { conversationId: activeId.value } : {})
    })

    addMessage(message)

    if (isStaff.value) {
      patchConversation(message.conversationId, {
        lastMessage: message.body,
        lastMessageAt: message.createdAt,
        unread: 0
      })
    }

    return null
  } catch (error) {
    const sentence = messageFor(error)
    threadError.value = sentence
    return sentence
  } finally {
    sending.value = false
  }
}

function openPanel(): void {
  panelOpen.value = true
  if (conversationId.value) markRead(conversationId.value)
  else unread.value = 0
}

function closePanel(): void {
  panelOpen.value = false
}

function togglePanel(): void {
  if (panelOpen.value) closePanel()
  else openPanel()
}

export function useChat() {
  return {
    isStaff,
    messages,
    conversationId,
    conversations,
    activeId,
    activeConversation,
    loadingThread,
    loadingList,
    sending,
    threadError,
    listError,
    panelOpen,
    unread,
    start,
    stop,
    loadThread,
    loadConversations,
    openConversation,
    send,
    markRead,
    openPanel,
    closePanel,
    togglePanel
  }
}
