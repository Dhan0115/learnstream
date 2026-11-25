import { z } from 'zod'
import { badRequest } from './errors'
import { MAX_CHAPTERS, MAX_CUES } from './transcript'

/**
 * Input validation for every mutating endpoint (AGENTS.md §2.3).
 *
 * Client-side checks mirror these rules so a learner gets instant feedback, but
 * the server never trusts what it receives — the schemas below are the boundary.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const emailField = z
  .string()
  .trim()
  .max(254, 'Keep your email under 254 characters.')
  .regex(EMAIL_PATTERN, 'Enter a valid email address.')

export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Enter the name you want learners to see.')
    .max(80, 'Keep your name under 80 characters.'),
  email: emailField,
  password: z.string().min(8, 'Use at least 8 characters for your password.').max(200)
}).strict()

export const signInSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Enter your password.').max(200)
})

export const captionCueSchema = z.object({
  start: z.number().min(0),
  end: z.number().min(0),
  text: z.string().trim().min(1).max(500, 'Keep each caption line under 500 characters.')
})

/**
 * A parsed caption track. The parser already caps, trims and strips markup,
 * but the file it read came from a visitor, so its output is checked here too.
 */
export const captionTrackSchema = z
  .array(captionCueSchema)
  .max(MAX_CUES, 'That caption file has too many lines.')

/** One named section of a lesson, as typed on the upload form. */
export const chapterSchema = z.object({
  startSec: z.number().min(0),
  title: z.string().trim().min(1).max(120, 'Keep each chapter title under 120 characters.')
})

export const chapterListSchema = z
  .array(chapterSchema)
  .max(MAX_CHAPTERS, 'Use at most 50 chapters.')

export const videoFieldsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Give your lesson a title of at least 3 characters.')
    .max(140, 'Keep the title under 140 characters.'),
  description: z
    .string()
    .trim()
    .min(10, 'Add a description of at least 10 characters.')
    .max(5000, 'Keep the description under 5000 characters.'),
  subjectSlug: z.string().trim().min(1, 'Choose a subject.').max(60),
  tags: z.array(z.string().trim().min(1).max(30)).max(8, 'Use at most 8 tags.').default([])
})

/** `null` clears the vote — clicking an active reaction removes it. */
export const reactionSchema = z.object({
  kind: z.enum(['like', 'dislike']).nullable()
})

/**
 * The measured length of an upload, in seconds.
 *
 * Kept out of `videoFieldsSchema` on purpose: the edit endpoint consumes that
 * schema with `.strict()`, and duration is measured once at upload rather than
 * typed into the edit form. 24 hours is far past any lesson we host.
 */
export const durationField = z.coerce
  .number()
  .int('Send the duration as whole seconds.')
  .min(0, 'Send the duration as whole seconds.')
  .max(86_400, 'Send the duration as whole seconds.')
  .default(0)

/** Saving and unsaving are one endpoint, so the intent is explicit. */
export const savedToggleSchema = z.object({
  saved: z.boolean()
})

export const commentSchema = z.object({
  body: z.string().trim().min(2, 'Write at least 2 characters.').max(2000, 'Keep it under 2000 characters.')
})

/**
 * One line of live chat. `conversationId` is only read when the writer is
 * staff — a learner has a single thread, so naming one would be meaningless.
 */
export const chatMessageSchema = z.object({
  body: z.string().trim().min(1, 'Write a message first.').max(2000, 'Keep it under 2000 characters.'),
  conversationId: z.string().trim().min(1).max(40).optional()
})

/** The first message is the one nearest the field that failed, so it is the one shown. */
export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'That input was not valid.'
}

/** Parse, or fail the request with 400 and a sentence the UI can show. */
export function parseOrThrow<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value)
  if (!result.success) throw badRequest(firstIssue(result.error))
  return result.data
}
