import { mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, extname, resolve, sep } from 'node:path'
import { randomUUID } from 'node:crypto'
import { mediaRoot } from './config'

/**
 * Media on disk.
 *
 * Everything is addressed by a `storageKey` — a relative path such as
 * `videos/8f3c….mp4` — and never by anything the client supplied, so a request
 * cannot name a file outside the media root.
 */

export function storagePath(key: string): string {
  return resolve(mediaRoot(), key)
}

/** True when `key` resolves to a path inside the media root. */
export function isInsideMediaRoot(key: string): boolean {
  const root = mediaRoot()
  const target = storagePath(key)
  return target === root || target.startsWith(root + sep)
}

/** A collision-proof key that keeps the file's real extension. */
export function newStorageKey(folder: string, extension: string): string {
  return `${folder}/${randomUUID()}${extension}`
}

const EXTENSION_BY_MIME: Record<string, string> = {
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp'
}

/**
 * The extension to store a file under. Taken from the uploaded name when it
 * looks like a plain extension, otherwise from the declared content type, so
 * `clip.mov` claiming to be H.264 MP4 is still stored as `.mp4`.
 */
export function extensionFor(fileName: string | undefined, mimeType: string): string {
  const fromName = fileName ? extname(fileName).toLowerCase() : ''
  if (/^\.[a-z0-9]{1,5}$/.test(fromName)) return fromName
  return EXTENSION_BY_MIME[mimeType] ?? ''
}

export async function saveUpload(key: string, data: Buffer): Promise<void> {
  const target = storagePath(key)
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, data)
}

/** Best-effort cleanup — a failed upload must not leave a stray file behind. */
export async function removeUpload(key: string): Promise<void> {
  if (!isInsideMediaRoot(key)) return
  await rm(storagePath(key), { force: true })
}
