import type { H3Event } from 'h3'
import { requireUser } from '../../utils/session'
import { parseOrThrow } from '../../utils/validation'
import { managedVideoId, editableVideo, updateVideoDetails } from '../../utils/video-management'

export default defineEventHandler(async (event: H3Event) => {
  const actor = await requireUser(event)
  const id = parseOrThrow(managedVideoId, getRouterParam(event, 'id'))
  const fields = parseOrThrow(editableVideo, await readBody(event))
  return { video: await updateVideoDetails(id, actor, fields) }
})
