import type { H3Event } from 'h3'
import { findVideo, relatedVideos } from '../../../utils/catalog'
import { notFound } from '../../../utils/errors'

/** "Suggested lessons" on the watch page, ranked by subject then popularity. */
export default defineEventHandler(async (event: H3Event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw notFound()

  const video = await findVideo(id)
  if (!video) throw notFound()

  return { videos: await relatedVideos(video.id, video.subjectSlug) }
})
