import type { H3Event } from 'h3'
import { getQuery } from 'h3'
import type { Prisma } from '@prisma/client'
import { prisma } from './prisma'
import { toVideoDto } from './serialize'
import type { SortKey, Video } from '../../src/types/index.ts'

/**
 * Reading the catalog (design_spec.md §8.8).
 *
 * Filtering happens in the database, but ordering happens here: "Top rated" is
 * a ratio (likes ÷ votes) that SQLite cannot order by without a computed
 * column, and the other three sorts must agree with it on tie-breaking. Sorting
 * one list in JavaScript keeps all four orderings consistent and identical to
 * the behaviour learners already had.
 */

/** Columns every listing reads. Captions are detail-only and stay out of lists. */
const listInclude = {
  subject: true,
  uploader: true,
  tags: true,
  metadata: true
} satisfies Prisma.VideoInclude

/** The browse page shows every match; this cap only stops a runaway query. */
const MAX_LIST_ROWS = 500

const SORTS: readonly SortKey[] = ['newest', 'views', 'likes', 'rated']
const RANGE_DAYS: Record<string, number> = { week: 7, month: 30, year: 365 }
const DAY_MS = 86_400_000

export interface CatalogFilters {
  subjectSlug?: string
  search?: string
  sort?: SortKey
  since?: Date
  uploaderId?: string
  /** Set for an uploader looking at their own catalog, so drafts stay visible. */
  includeProcessing?: boolean
}

function readParam(query: Record<string, unknown>, key: string): string {
  const value = query[key]
  return typeof value === 'string' ? value.trim() : ''
}

/** Translate the URL's query string into filters. Unknown values fall back. */
export function readCatalogFilters(event: H3Event): CatalogFilters {
  const query = getQuery(event)

  const sort = readParam(query, 'sort')
  const days = RANGE_DAYS[readParam(query, 'range')]

  return {
    subjectSlug: readParam(query, 'subject') || undefined,
    search: readParam(query, 'q') || undefined,
    sort: SORTS.includes(sort as SortKey) ? (sort as SortKey) : 'newest',
    since: days ? new Date(Date.now() - days * DAY_MS) : undefined,
    uploaderId: readParam(query, 'uploader') || undefined
  }
}

function buildWhere(filters: CatalogFilters): Prisma.VideoWhereInput {
  const where: Prisma.VideoWhereInput = {}

  // A lesson still being processed is not part of the public catalog.
  if (!filters.includeProcessing) where.status = 'published'
  if (filters.subjectSlug) where.subject = { slug: filters.subjectSlug }
  if (filters.uploaderId) where.uploaderId = filters.uploaderId
  if (filters.since) where.createdAt = { gte: filters.since }

  const term = filters.search?.trim()
  if (term) {
    // Mirrors the fields the header search and browse page promise to cover.
    where.OR = [
      { title: { contains: term } },
      { description: { contains: term } },
      { uploader: { name: { contains: term } } },
      { subject: { name: { contains: term } } },
      { tags: { some: { name: { contains: term } } } }
    ]
  }

  return where
}

/** Share of votes that are likes, 0–1. No votes at all ranks last. */
function likeRatio(video: Video): number {
  const votes = video.likes + video.dislikes
  return votes === 0 ? 0 : video.likes / votes
}

function sortVideos(list: Video[], sort: SortKey): Video[] {
  const sorted = [...list]

  switch (sort) {
    case 'views':
      return sorted.sort((a, b) => b.views - a.views)
    case 'likes':
      return sorted.sort((a, b) => b.likes - a.likes)
    case 'rated':
      // Ratio first, then sheer like count so a 1/1 lesson cannot outrank a
      // 400/450 one.
      return sorted.sort((a, b) => likeRatio(b) - likeRatio(a) || b.likes - a.likes)
    case 'newest':
      return sorted.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
  }
}

export async function listVideos(filters: CatalogFilters): Promise<Video[]> {
  const rows = await prisma.video.findMany({
    where: buildWhere(filters),
    include: listInclude,
    take: MAX_LIST_ROWS
  })

  return sortVideos(rows.map(toVideoDto), filters.sort ?? 'newest')
}

export async function findVideo(id: string): Promise<Video | null> {
  const row = await prisma.video.findUnique({
    where: { id },
    include: {
      ...listInclude,
      captions: { orderBy: { position: 'asc' } },
      chapters: { orderBy: { position: 'asc' } }
    }
  })

  return row ? toVideoDto(row) : null
}

/**
 * Other lessons to watch next: same subject first, ranked by views, then topped
 * up with popular lessons from other subjects so the rail is never short.
 */
export async function relatedVideos(
  videoId: string,
  subjectSlug: string,
  limit = 6
): Promise<Video[]> {
  const sameSubject = await prisma.video.findMany({
    where: { status: 'published', subject: { slug: subjectSlug }, id: { not: videoId } },
    include: listInclude,
    orderBy: { viewCount: 'desc' },
    take: limit
  })

  if (sameSubject.length >= limit) return sameSubject.map(toVideoDto)

  const filler = await prisma.video.findMany({
    where: {
      status: 'published',
      id: { notIn: [videoId, ...sameSubject.map(row => row.id)] },
      subject: { slug: { not: subjectSlug } }
    },
    include: listInclude,
    orderBy: { viewCount: 'desc' },
    take: limit - sameSubject.length
  })

  return [...sameSubject, ...filler].map(toVideoDto)
}
