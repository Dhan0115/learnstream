// Domain types for LearnStream's mock data layer (design_spec.md §7).

export type Role = 'learner' | 'teacher' | 'admin'

export type VideoStatus = 'published' | 'processing'

export interface User {
  id: string
  /** Display name shown on the profile, dashboard and comments. */
  name: string
  /** The account identifier a learner signs in with. */
  email: string
  /** Monogram fallback when no image is available. */
  initials: string
  role: Role
}

export interface Subject {
  id: string
  slug: string
  name: string
  /** Monogram shown in the subject tile (design_spec.md §8.7). */
  icon: string
  tagline: string
}

/** A single timed caption/transcript cue, in seconds. */
export interface CaptionCue {
  start: number
  end: number
  text: string
}

/** A named section of a longer lesson, in seconds from the start. */
export interface Chapter {
  startSec: number
  title: string
}

export interface Video {
  id: string
  title: string
  description: string
  subjectSlug: string
  tags: string[]
  uploaderId: string
  uploaderName: string
  /** Empty for seeded demo lessons (design_spec.md §8.1). */
  src: string
  thumbnail: string
  durationSec: number
  views: number
  likes: number
  dislikes: number
  /** ISO 8601. */
  createdAt: string
  status: VideoStatus
  /** Present only when a caption track has been authored. */
  captions?: CaptionCue[]
  /** Present only when the uploader split the lesson into sections. */
  chapters?: Chapter[]
}

export interface Comment {
  id: string
  videoId: string
  authorName: string
  body: string
  /** ISO 8601. */
  createdAt: string
}

/** One line of live chat (design_spec.md §3.3). */
export interface ChatMessage {
  id: string
  conversationId: string
  /** Snapshotted when the line was written, so it survives a rename. */
  authorName: string
  /** True when the line came from a teacher or an admin. */
  fromStaff: boolean
  body: string
  /** ISO 8601. */
  createdAt: string
}

/** One learner's support thread, as the staff inbox lists it (design_spec.md §4.9). */
export interface Conversation {
  id: string
  studentId: string
  studentName: string
  /** ISO 8601. */
  lastMessageAt: string
  /** The most recent line, for the list preview. */
  lastMessage: string
  /** Lines from the student that staff have not opened yet. */
  unread: number
}

/** `rated` is the like-to-vote ratio (Top Rated); the rest are raw totals. */
export type SortKey = 'newest' | 'views' | 'likes' | 'rated'

/** Upload-date windows offered by the browse filters. */
export type DateRangeKey = 'any' | 'week' | 'month' | 'year'
