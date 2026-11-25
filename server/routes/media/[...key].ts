import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { extname } from 'node:path'
import {
  getRequestHeader,
  getRouterParam,
  sendStream,
  setResponseHeader,
  setResponseStatus,
  type H3Event
} from 'h3'
import { apiError, unauthorized } from '../../utils/errors'
import { prisma } from '../../utils/prisma'
import { currentUser } from '../../utils/session'
import { isInsideMediaRoot, storagePath } from '../../utils/storage'

/**
 * Streams uploaded media (design_spec.md §4.4).
 *
 * Range requests are answered with 206 and a `content-range`, which is what
 * makes seeking work: without it the browser must download the whole file
 * before it can scrub. `storagePath` refuses any key that resolves outside the
 * media root, so this endpoint cannot be used to read arbitrary files.
 *
 * Video files are for members only, so a visitor without an account is refused
 * here as well as by the route guard. Thumbnails stay public so listings and
 * posters still render for visitors.
 */

const MIME_BY_EXT: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp'
}

interface ByteRange {
  start: number
  end: number
}

/** `bytes=0-`, `bytes=500-1500`, `bytes=-500`. Null when unsatisfiable. */
function parseRange(header: string, size: number): ByteRange | null {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim())
  if (!match) return null

  const [, rawStart, rawEnd] = match
  if (rawStart === '' && rawEnd === '') return null

  let start: number
  let end: number

  if (rawStart === '') {
    // Suffix range: the final N bytes.
    const length = Number.parseInt(rawEnd, 10)
    if (!Number.isFinite(length) || length <= 0) return null
    start = Math.max(0, size - length)
    end = size - 1
  } else {
    start = Number.parseInt(rawStart, 10)
    end = rawEnd === '' ? size - 1 : Number.parseInt(rawEnd, 10)
  }

  if (!Number.isFinite(start) || !Number.isFinite(end)) return null
  if (start < 0 || start >= size || end < start) return null

  return { start, end: Math.min(end, size - 1) }
}

export default defineEventHandler(async (event: H3Event) => {
  const key = getRouterParam(event, 'key') ?? ''
  const missing = apiError(404, 'not_found', 'That file could not be found.')

  if (!key || !isInsideMediaRoot(key)) throw missing
  const linked = await prisma.videoMetadata.findFirst({
    where: { OR: [{ storageKey: key }, { thumbnailKey: key }] },
    select: { storageKey: true }
  })
  if (!linked) throw missing

  // A video file is members-only; a thumbnail is public so listings render.
  if (linked.storageKey === key) {
    const user = await currentUser(event)
    if (!user) throw unauthorized('Sign in to watch this lesson.')
  }

  const path = storagePath(key)
  const info = await stat(path).catch(() => null)
  if (!info?.isFile()) throw missing

  const size = info.size
  const contentType = MIME_BY_EXT[extname(path).toLowerCase()] ?? 'application/octet-stream'
  const isHead = event.method === 'HEAD'

  setResponseHeader(event, 'content-type', contentType)
  setResponseHeader(event, 'accept-ranges', 'bytes')
  setResponseHeader(event, 'cache-control', 'no-cache')

  const header = getRequestHeader(event, 'range')
  const range = header ? parseRange(header, size) : null

  if (header && !range) {
    setResponseStatus(event, 416)
    setResponseHeader(event, 'content-range', `bytes */${size}`)
    return ''
  }

  if (range) {
    setResponseStatus(event, 206)
    setResponseHeader(event, 'content-range', `bytes ${range.start}-${range.end}/${size}`)
    setResponseHeader(event, 'content-length', range.end - range.start + 1)

    if (isHead) return ''
    return sendStream(event, createReadStream(path, { start: range.start, end: range.end }))
  }

  setResponseHeader(event, 'content-length', size)

  if (isHead) return ''
  return sendStream(event, createReadStream(path))
})
