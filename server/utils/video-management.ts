import { z } from 'zod'
import { prisma } from './prisma'
import { badRequest, forbidden, notFound } from './errors'
import { videoFieldsSchema } from './validation'
import { slugify } from './slug'
import { removeUpload } from './storage'
import { toVideoDto } from './serialize'
import type { Prisma } from '@prisma/client'

type Actor = { id: string; role: string }
export const managedVideoId = z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/)
export const editableVideo = videoFieldsSchema.strict().required()

async function authorize(tx: Prisma.TransactionClient, id: string, actor: Actor) {
  const video = await tx.video.findUnique({ where: { id }, select: { uploaderId: true } })
  if (!video) throw notFound()
  if (actor.role !== 'admin' && actor.id !== video.uploaderId) {
    throw forbidden('Only the uploader or an administrator can manage this video.')
  }
}

export async function updateVideoDetails(id: string, actor: Actor, fields: z.output<typeof editableVideo>) {
  return prisma.$transaction(async tx => {
    await authorize(tx, id, actor)
    const subject = await tx.subject.findUnique({ where: { slug: fields.subjectSlug }, select: { id: true } })
    if (!subject) throw badRequest('Choose an existing subject.')
    const tags = new Map(fields.tags.map(name => [slugify(name), name]))
    if (tags.has('')) throw badRequest('Each tag needs a letter or number.')
    const updated = await tx.video.update({
      where: { id },
      data: {
        title: fields.title, description: fields.description,
        subject: { connect: { id: subject.id } },
        tags: {
          set: [],
          connectOrCreate: Array.from(tags, ([slug, name]) => ({ where: { slug }, create: { slug, name } }))
        }
      },
      include: {
        subject: true, uploader: true, metadata: true, tags: true,
        captions: { orderBy: { position: 'asc' } }, chapters: { orderBy: { position: 'asc' } }
      }
    })
    return toVideoDto(updated)
  })
}

export async function deleteManagedVideo(id: string, actor: Actor): Promise<void> {
  const files = await prisma.$transaction(async tx => {
    await authorize(tx, id, actor)
    const files = await tx.videoMetadata.findUnique({
      where: { videoId: id }, select: { storageKey: true, thumbnailKey: true }
    })
    await tx.video.delete({ where: { id } })
    return files
  })
  // Do not touch files until the deletion commits. Shared tags and remote posters stay intact.
  for (const key of [files?.storageKey, files?.thumbnailKey]) {
    if (key) await removeUpload(key).catch(() => console.error('Video file cleanup failed', { videoId: id }))
  }
}
