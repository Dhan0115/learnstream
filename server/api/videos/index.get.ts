import type { H3Event } from 'h3'
import { listVideos, readCatalogFilters } from '../../utils/catalog'
import { currentUser } from '../../utils/session'

/**
 * The catalog: search, subject filter, upload-date window and sort
 * (design_spec.md §8.8).
 *
 * `?uploader=me` scopes the list to the signed-in uploader and, for that
 * request only, includes their lessons that are still processing — a learner
 * browsing the same catalog never sees them.
 */
export default defineEventHandler(async (event: H3Event) => {
  const filters = readCatalogFilters(event)

  if (filters.uploaderId === 'me') {
    const user = await currentUser(event)
    filters.uploaderId = user?.id
    filters.includeProcessing = Boolean(user)
  }

  return { videos: await listVideos(filters) }
})
