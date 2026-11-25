import { ref } from 'vue'
import { apiGet, apiSend } from '@/utils/api'
import type { DateRangeKey, SortKey, Subject, Video } from '@/types'

/**
 * Reading the catalog through the API (design_spec.md §8.8).
 *
 * Filtering, search and ordering all happen on the server, so the interface
 * never holds a private copy of the catalog that could drift from the database.
 * `videoCache` exists only so a video already fetched (a list, a detail page, a
 * related rail) can be read synchronously by another component, and so a
 * reaction can update the counts on screen without refetching.
 */

export interface CatalogQuery {
  subjectSlug?: string
  search?: string
  sort?: SortKey
  range?: DateRangeKey
  /** `me` scopes the list to the signed-in uploader, drafts included. */
  uploader?: 'me'
}

/** The API adds a derived lesson count to each subject. */
export interface SubjectWithCount extends Subject {
  videoCount: number
}

const subjects = ref<SubjectWithCount[]>([])
const subjectsReady = ref(false)
const videoCache = ref<Record<string, Video>>({})

let subjectsLoading: Promise<void> | null = null

/** Loaded once; every screen that names a subject reads the same list. */
export function loadSubjects(): Promise<void> {
  subjectsLoading ??= apiGet<{ subjects: SubjectWithCount[] }>('/api/subjects')
    .then(payload => {
      subjects.value = payload.subjects
    })
    .catch(() => {
      subjects.value = []
    })
    .finally(() => {
      subjectsReady.value = true
    })

  return subjectsLoading
}

function buildQuery(query: CatalogQuery): string {
  const params = new URLSearchParams()
  if (query.subjectSlug) params.set('subject', query.subjectSlug)
  if (query.search?.trim()) params.set('q', query.search.trim())
  if (query.sort) params.set('sort', query.sort)
  if (query.range && query.range !== 'any') params.set('range', query.range)
  if (query.uploader) params.set('uploader', query.uploader)

  const search = params.toString()
  return search ? `?${search}` : ''
}

function remember(videos: Video[]) {
  for (const video of videos) videoCache.value[video.id] = video
}

/** Update the counts on a cached lesson without refetching it. */
export function patchVideo(id: string, patch: Partial<Video>) {
  const current = videoCache.value[id]
  if (current) videoCache.value[id] = { ...current, ...patch }
}

export function useCatalog() {
  function subjectBySlug(slug: string | undefined): SubjectWithCount | undefined {
    if (!slug) return undefined
    return subjects.value.find(item => item.slug === slug)
  }

  function subjectName(slug: string): string {
    return subjectBySlug(slug)?.name ?? 'General'
  }

  function videoCount(slug: string): number {
    return subjectBySlug(slug)?.videoCount ?? 0
  }

  async function fetchVideos(query: CatalogQuery = {}): Promise<Video[]> {
    const payload = await apiGet<{ videos: Video[] }>(`/api/videos${buildQuery(query)}`)
    remember(payload.videos)
    return payload.videos
  }

  /** The uploader's own lessons, including ones still processing. */
  function fetchMine(): Promise<Video[]> {
    return fetchVideos({ uploader: 'me' })
  }

  async function fetchVideo(id: string): Promise<Video> {
    const payload = await apiGet<{ video: Video }>(`/api/videos/${encodeURIComponent(id)}`)
    remember([payload.video])
    return payload.video
  }

  async function fetchRelated(id: string, limit = 6): Promise<Video[]> {
    const payload = await apiGet<{ videos: Video[] }>(
      `/api/videos/${encodeURIComponent(id)}/related`
    )
    remember(payload.videos)
    return payload.videos.slice(0, limit)
  }

  /** Synchronous read of anything fetched already; undefined before that. */
  function getVideo(id: string): Video | undefined {
    return videoCache.value[id]
  }

  /**
   * Count a view. The server ignores a repeat view from the same viewer inside
   * its dedupe window, so the count that comes back is the one to display
   * (design_spec.md §4.3).
   */
  async function recordView(id: string): Promise<number | null> {
    try {
      const { views } = await apiSend<{ views: number }>(
        `/api/videos/${encodeURIComponent(id)}/views`,
        'POST'
      )
      patchVideo(id, { views })
      return views
    } catch {
      // A view is not worth interrupting the lesson for.
      return null
    }
  }

  return {
    forgetVideo(id: string) { delete videoCache.value[id] },
    subjects,
    subjectsReady,
    subjectBySlug,
    subjectName,
    videoCount,
    fetchVideos,
    fetchMine,
    fetchVideo,
    fetchRelated,
    getVideo,
    patchVideo,
    recordView
  }
}
