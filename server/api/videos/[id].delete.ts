import { sendNoContent, type H3Event } from 'h3'
import { requireUser } from '../../utils/session'
import { parseOrThrow } from '../../utils/validation'
import { managedVideoId, deleteManagedVideo } from '../../utils/video-management'

export default defineEventHandler(async (event: H3Event) => {
  const actor = await requireUser(event)
  const id = parseOrThrow(managedVideoId, getRouterParam(event, 'id'))
  await deleteManagedVideo(id, actor)
  return sendNoContent(event)
})
