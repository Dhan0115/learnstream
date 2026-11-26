import { readFormData, type H3Event } from 'h3'
import { prisma } from '../../utils/prisma'
import { requireUser } from '../../utils/session'
import {
  captionTrackSchema,
  chapterListSchema,
  durationField,
  parseOrThrow,
  videoFieldsSchema
} from '../../utils/validation'
import { apiError, badRequest, forbidden, notFound } from '../../utils/errors'
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_UPLOAD_BYTES
} from '../../utils/config'
import { extensionFor, newStorageKey, removeUpload, saveUpload } from '../../utils/storage'
import { slugify } from '../../utils/slug'
import { isTranscriptFile, parseChapters, parseTimedText } from '../../utils/transcript'
import { toVideoDto } from '../../utils/serialize'

/** Reads a text field out of a multipart body (files arrive as `File`). */
function readField(form: FormData, name: string): string {
  const value = form.get(name)
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * A part that carries a file. An untouched file input still submits a part, but
 * one with no name and no bytes, which is not a file the uploader chose.
 */
function readFile(form: FormData, name: string): File | undefined {
  const value = form.get(name)
  return value && typeof value !== 'string' && value.name ? value : undefined
}

/** `"python, beginner"` → `['python', 'beginner']`. */
function readTags(form: FormData): string[] {
  return readField(form, 'tags')
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean)
}

/**
 * Publish a lesson (design_spec.md §4.5).
 *
 * The file is validated and written to disk first, and only then does the row
 * become `published` — a lesson that failed to store is never listed. If the
 * database write fails, the file is removed so a retry starts clean.
 */
export default defineEventHandler(async (event: H3Event) => {
  const user = await requireUser(event)

  if (user.role !== 'admin') {
    throw forbidden('Only administrators can upload videos.')
  }

  // Reject an oversized body before it is buffered into memory.
  const declaredSize = Number.parseInt(getRequestHeader(event, 'content-length') ?? '', 10)
  if (Number.isFinite(declaredSize) && declaredSize > MAX_UPLOAD_BYTES) {
    throw apiError(413, 'file_too_large', 'That file is larger than the 256 MB limit.')
  }

  // The native multipart reader, not h3's byte-at-a-time one: the latter keeps
  // every byte of the file in a JavaScript array, which a lesson-sized video
  // exhausts long before the declared limit is reached (see decision 21).
  const contentType = getRequestHeader(event, 'content-type') ?? ''
  if (!contentType.startsWith('multipart/form-data')) {
    throw badRequest('Send the lesson as a multipart form.', 'invalid_content_type')
  }

  const form = await readFormData(event)

  const fields = parseOrThrow(videoFieldsSchema, {
    title: readField(form, 'title'),
    description: readField(form, 'description'),
    subjectSlug: readField(form, 'subject'),
    tags: readTags(form)
  })

  // The length is measured in the browser from the file it is about to send, so
  // a missing value is a zero rather than a rejection (see decision 22).
  const durationSec = parseOrThrow(durationField, readField(form, 'durationSec'))

  const subject = await prisma.subject.findUnique({ where: { slug: fields.subjectSlug } })
  if (!subject) throw notFound('That subject does not exist.')

  const videoPart = readFile(form, 'file')
  if (!videoPart) throw apiError(400, 'file_missing', 'Choose a video file to upload.')
  if (videoPart.size > MAX_UPLOAD_BYTES) {
    throw apiError(413, 'file_too_large', 'That file is larger than the 256 MB limit.')
  }
  if (!(ALLOWED_VIDEO_TYPES as readonly string[]).includes(videoPart.type ?? '')) {
    throw apiError(415, 'unsupported_type', 'Upload an MP4 or WebM video.')
  }

  const thumbnailPart = readFile(form, 'thumbnail')
  if (thumbnailPart && !(ALLOWED_IMAGE_TYPES as readonly string[]).includes(thumbnailPart.type ?? '')) {
    throw apiError(415, 'unsupported_type', 'Upload a JPEG, PNG or WebP image for the poster.')
  }

  // Both enhancements are optional (design_spec.md §8.16). A caption track comes
  // as a file, a chapter list as one typed line per section; either may be absent.
  const transcriptPart = readFile(form, 'transcript')
  let captions: { start: number; end: number; text: string }[] = []
  if (transcriptPart) {
    if (!isTranscriptFile(transcriptPart.name)) {
      throw apiError(415, 'unsupported_type', 'Upload a WebVTT (.vtt) or SubRip (.srt) caption file.')
    }
    captions = parseOrThrow(captionTrackSchema, parseTimedText(await transcriptPart.text()))
    if (!captions.length) {
      throw badRequest('That caption file has no timed cues. Upload a WebVTT or SubRip file with timestamps.')
    }
  }

  const chapterText = readField(form, 'chapters')
  const chapters = parseOrThrow(chapterListSchema, parseChapters(chapterText))
  if (chapterText && !chapters.length) {
    throw badRequest('Each chapter needs a time and a title, like “0:00 Introduction”.')
  }

  // Keys are generated here and never taken from the request, so a filename
  // such as `../../etc/passwd` cannot escape the media root.
  const videoKey = newStorageKey('videos', extensionFor(videoPart.name, videoPart.type ?? ''))
  const thumbnailKey = thumbnailPart
    ? newStorageKey('thumbnails', extensionFor(thumbnailPart.name, thumbnailPart.type ?? ''))
    : null

  await saveUpload(videoKey, Buffer.from(await videoPart.arrayBuffer()), videoPart.type ?? '')
  if (thumbnailPart && thumbnailKey) {
    await saveUpload(
      thumbnailKey,
      Buffer.from(await thumbnailPart.arrayBuffer()),
      thumbnailPart.type ?? ''
    )
  }

  try {
    const created = await prisma.video.create({
      data: {
        title: fields.title,
        description: fields.description,
        // Stored, then flipped to `published` below — the file is already safe
        // on disk at this point, so `processing` is never seen by a visitor.
        status: 'processing',
        subjectId: subject.id,
        uploaderId: user.id,
        metadata: {
          create: {
            storageKey: videoKey,
            fileName: videoPart.name || null,
            mimeType: videoPart.type || null,
            sizeBytes: videoPart.size,
            durationSec,
            thumbnailKey
          }
        },
        tags: {
          connectOrCreate: fields.tags.map(tag => ({
            where: { slug: slugify(tag) },
            create: { slug: slugify(tag), name: tag }
          }))
        },
        // `position` preserves the file's own cue order and the uploader's
        // chapter order, so a reader never has to sort by time to show them.
        captions: {
          create: captions.map((cue, index) => ({ position: index, ...cue }))
        },
        chapters: {
          create: chapters.map((chapter, index) => ({ position: index, ...chapter }))
        }
      },
      include: { subject: true, uploader: true, tags: true, metadata: true }
    })

    const published = await prisma.video.update({
      where: { id: created.id },
      data: { status: 'published' },
      include: {
        subject: true,
        uploader: true,
        tags: true,
        metadata: true,
        captions: { orderBy: { position: 'asc' } },
        chapters: { orderBy: { position: 'asc' } }
      }
    })

    return { video: toVideoDto(published) }
  } catch (error) {
    // Nothing references the files yet, so a failed publish leaves no orphan.
    await removeUpload(videoKey)
    if (thumbnailKey) await removeUpload(thumbnailKey)
    throw error
  }
})
