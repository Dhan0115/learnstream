import type {
  ChatMessage as ChatMessageDto,
  Comment as CommentDto,
  Conversation as ConversationDto,
  Subject as SubjectDto,
  Video as VideoDto
} from '../../src/types/index.ts'

/**
 * Rows in, API shapes out.
 *
 * Every response is built here so the wire format matches the frontend's
 * `src/types/index.ts` exactly — the UI needed no new types when the database
 * replaced the mock data layer.
 */

/**
 * Only the columns a response actually reads. Declaring the shape structurally
 * (rather than as a Prisma generic) lets one serializer accept both the lighter
 * list query and the fuller detail query.
 */
export interface VideoRowShape {
  id: string
  title: string
  description: string
  status: string
  viewCount: number
  likeCount: number
  dislikeCount: number
  createdAt: Date
  subject: { slug: string }
  uploader: { id: string; name: string }
  tags: { name: string }[]
  metadata: {
    storageKey: string | null
    thumbnailUrl: string | null
    thumbnailKey: string | null
    durationSec: number
  } | null
  captions?: { start: number; end: number; text: string }[]
  chapters?: { startSec: number; title: string }[]
}

/** Uploaded files are streamed from `/media`; seeded lessons carry no file. */
function mediaUrl(key: string | null): string {
  return key ? `/media/${key}` : ''
}

export function toVideoDto(row: VideoRowShape): VideoDto {
  const captions = row.captions?.map(cue => ({
    start: cue.start,
    end: cue.end,
    text: cue.text
  }))

  const chapters = row.chapters?.map(chapter => ({
    startSec: chapter.startSec,
    title: chapter.title
  }))

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    subjectSlug: row.subject.slug,
    tags: row.tags.map(tag => tag.name),
    uploaderId: row.uploader.id,
    uploaderName: row.uploader.name,
    src: mediaUrl(row.metadata?.storageKey ?? null),
    thumbnail:
      row.metadata?.thumbnailUrl ?? mediaUrl(row.metadata?.thumbnailKey ?? null),
    durationSec: row.metadata?.durationSec ?? 0,
    views: row.viewCount,
    likes: row.likeCount,
    dislikes: row.dislikeCount,
    createdAt: row.createdAt.toISOString(),
    status: row.status === 'published' ? 'published' : 'processing',
    ...(captions && captions.length ? { captions } : {}),
    ...(chapters && chapters.length ? { chapters } : {})
  }
}

export function toSubjectDto(row: {
  id: string
  slug: string
  name: string
  icon: string
  tagline: string
}): SubjectDto {
  return { id: row.id, slug: row.slug, name: row.name, icon: row.icon, tagline: row.tagline }
}

export function toCommentDto(row: {
  id: string
  videoId: string
  authorName: string
  body: string
  createdAt: Date
}): CommentDto {
  return {
    id: row.id,
    videoId: row.videoId,
    authorName: row.authorName,
    body: row.body,
    createdAt: row.createdAt.toISOString()
  }
}

export function toChatMessageDto(row: {
  id: string
  conversationId: string
  authorName: string
  fromStaff: boolean
  body: string
  createdAt: Date
}): ChatMessageDto {
  return {
    id: row.id,
    conversationId: row.conversationId,
    authorName: row.authorName,
    fromStaff: row.fromStaff,
    body: row.body,
    createdAt: row.createdAt.toISOString()
  }
}

/**
 * A thread as the inbox lists it. `lastMessage` and `unread` are computed by
 * the endpoint rather than stored, so neither can drift from the messages.
 */
export function toConversationDto(
  row: { id: string; userId: string; user: { name: string }; lastMessageAt: Date },
  summary: { lastMessage: string; unread: number }
): ConversationDto {
  return {
    id: row.id,
    studentId: row.userId,
    studentName: row.user.name,
    lastMessageAt: row.lastMessageAt.toISOString(),
    lastMessage: summary.lastMessage,
    unread: summary.unread
  }
}
