import type { H3Event } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireUser } from '../../../utils/session'
import { parseOrThrow, savedToggleSchema } from '../../../utils/validation'
import { notFound } from '../../../utils/errors'

/**
 * Add a lesson to, or remove it from, the learner's library (design_spec.md
 * §4.6). Saving twice is a no-op rather than an error, so an impatient tap on a
 * slow connection still lands on the intended state.
 */
export default defineEventHandler(async (event: H3Event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw notFound()

  const user = await requireUser(event)
  const { saved } = parseOrThrow(savedToggleSchema, await readBody(event))

  const exists = await prisma.video.findUnique({ where: { id }, select: { id: true } })
  if (!exists) throw notFound()

  if (saved) {
    await prisma.savedVideo.upsert({
      where: { videoId_userId: { videoId: id, userId: user.id } },
      create: { videoId: id, userId: user.id },
      update: {}
    })
  } else {
    await prisma.savedVideo.deleteMany({ where: { videoId: id, userId: user.id } })
  }

  return { saved }
})
