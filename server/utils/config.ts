import { resolve } from 'node:path'

/**
 * Server configuration, read once from the environment.
 *
 * Values come from `.env` in development (see `.env.example`); in a deployment
 * they come from the platform's environment. Nothing here is ever sent to the
 * browser.
 */

/** How long a repeat view of the same lesson is ignored — the refresh guard. */
export const VIEW_DEDUPE_WINDOW_MS = 30 * 60 * 1000

/**
 * Largest upload accepted, in bytes. 256 MB.
 *
 * Multipart parsing buffers the file in memory before it is written to disk, so
 * this doubles as a memory guard: the request is rejected on its
 * `content-length` before anything is read.
 */
export const MAX_UPLOAD_BYTES = 256 * 1024 * 1024

/** Container formats the player can stream (design_spec.md §4.4). */
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'] as const

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

export const SESSION_COOKIE = 'learnstream_session'

export function sessionTtlDays(): number {
  const parsed = Number.parseInt(process.env.SESSION_TTL_DAYS ?? '', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 30
}

/** Absolute path to the directory holding uploaded media. */
export function mediaRoot(): string {
  return resolve(process.cwd(), process.env.MEDIA_DIR || 'server/storage/media')
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * Secret for hashing the viewer fingerprint used by the duplicate-view guard.
 * Falls back to a fixed development value so a fresh clone runs without setup.
 */
export function viewerSecret(): string {
  return process.env.VIEWER_SECRET || 'learnstream-development-viewer-secret'
}
