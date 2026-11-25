import type { H3Event } from 'h3'
import { findVideo } from '../../utils/catalog'
import { currentUser } from '../../utils/session'
import { notFound, unauthorized } from '../../utils/errors'

/**
 * One lesson, for the watch page.
 *
 * Watching is for members only, so a visitor without an account is refused
 * here as well as by the route guard. A lesson that is still processing is
 * hidden from everyone except the person who uploaded it and administrators
 * who can manage it.
 */
export default defineEventHandler(async (event: H3Event) => {
  const user = await currentUser(event)
  if (!user) throw unauthorized('Sign in to watch this lesson.')

  const id = getRouterParam(event, 'id')
  if (!id) throw notFound()

  const video = await findVideo(id)
  if (!video) throw notFound()

  if (video.status !== 'published') {
    if (user.id !== video.uploaderId && user.role !== 'admin') {
      throw notFound('That lesson is still being processed and is not available yet.')
    }
  }

  return { video }
})
