import type { CaptionCue, Chapter } from '../../src/types/index.ts'

/**
 * Transcript and chapter parsing (design_spec.md §9, slice 14, decision 16).
 *
 * An uploader may attach a caption track and a chapter list. Both arrive as
 * plain text — a `.vtt`/`.srt` file and one line per chapter — and both are
 * turned into rows here, so nothing downstream has to know either format.
 */

/** `2:30`, `02:30`, `00:02:30.000` and `00:02:30,000` are all accepted. */
const TIME = /^(?:(\d+):)?(\d{1,2}):(\d{2})(?:[.,](\d{1,3}))?$/

/** `00:00:01.000 --> 00:00:04.000 align:middle` — only the two times matter. */
const TIMING = /^\s*(\S+)\s*-->\s*(\S+)/

/** A chapter line: a time, an optional separator, then the title. */
const CHAPTER = /^(\d{1,2}:\d{2}(?::\d{2})?)\s*[-–—:.)]?\s+(.+)$/

/** One cue's text is capped by the API schema; a lesson's cue count is capped here. */
export const MAX_CUES = 5000
export const MAX_CHAPTERS = 50

/** `undefined` when the text is not a time at all. */
function parseTime(value: string): number | undefined {
  const match = TIME.exec(value.trim())
  if (!match) return undefined

  const hours = match[1] ? Number(match[1]) : 0
  const minutes = Number(match[2])
  const seconds = Number(match[3])
  const millis = match[4] ? Number(match[4].padEnd(3, '0')) : 0

  return hours * 3600 + minutes * 60 + seconds + millis / 1000
}

/** Drop WebVTT markup such as `<c>` or `<00:00:01.000>` and collapse whitespace. */
function cleanText(value: string): string {
  return value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

/**
 * Read a WebVTT or SubRip track into cues.
 *
 * Both formats put a timing line above the lines it speaks, so the parser looks
 * for timing lines and takes what follows each one until the next blank line.
 * Cue numbers and the `WEBVTT` header are skipped because they are not timing
 * lines. A file without timestamps yields no cues, which the caller reports.
 */
export function parseTimedText(text: string): CaptionCue[] {
  const lines = text.replace(/\r\n?/g, '\n').split('\n')
  const cues: CaptionCue[] = []

  let index = 0
  while (index < lines.length && cues.length < MAX_CUES) {
    const timing = TIMING.exec(lines[index])
    if (!timing) {
      index += 1
      continue
    }

    const start = parseTime(timing[1])
    const end = parseTime(timing[2])
    index += 1

    const spoken: string[] = []
    while (index < lines.length && lines[index].trim() !== '') {
      spoken.push(lines[index])
      index += 1
    }

    const cueText = cleanText(spoken.join(' '))
    if (start === undefined || end === undefined || !cueText) continue

    cues.push({ start, end: Math.max(end, start), text: cueText })
  }

  return cues
}

/**
 * Read `0:00 Introduction` lines into chapters, ordered by time. A line that
 * does not start with a time is skipped, so a stray note cannot become one.
 */
export function parseChapters(text: string): Chapter[] {
  const chapters: Chapter[] = []

  for (const raw of text.replace(/\r\n?/g, '\n').split('\n')) {
    if (chapters.length >= MAX_CHAPTERS) break

    const match = CHAPTER.exec(raw.trim())
    if (!match) continue

    const startSec = parseTime(match[1])
    const title = cleanText(match[2])
    if (startSec === undefined || !title) continue

    chapters.push({ startSec, title })
  }

  return chapters.sort((a, b) => a.startSec - b.startSec)
}

/** A transcript is only accepted as WebVTT or SubRip, by extension. */
export function isTranscriptFile(filename: string | undefined): boolean {
  return /\.(vtt|srt)$/i.test(filename ?? '')
}
