// Database seed (design_spec.md §8.9).
//
// Run `pnpm exec prisma db seed` to add missing fixtures without resetting data.

import { randomUUID } from 'node:crypto'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../server/utils/password.ts'
import { slugify } from '../server/utils/slug.ts'
import { seedVideos } from '../src/data/videos.ts'
import { seedComments } from '../src/data/comments.ts'
import { subjects } from '../src/data/subjects.ts'

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL
if (!connectionString || !/^postgres(?:ql)?:\/\//i.test(connectionString)) {
  throw new Error('Set DIRECT_URL or DATABASE_URL to a PostgreSQL connection string.')
}
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

/** Every seeded account signs in with this password in development only. */
const DEV_PASSWORD = 'learnstream-dev'

/** The single administrator. Sign-up never offers this role (validation.ts). */
const ADMIN_EMAIL = 'admin@learnstream.test'

/** `u-amara` → `amara@learnstream.test`. */
function emailFor(uploaderId: string): string {
  return `${slugify(uploaderId.replace(/^u-/, ''))}@learnstream.test`
}

async function main() {
  await prisma.subject.createMany({ data: subjects, skipDuplicates: true })

  const localDemo = process.env.NODE_ENV !== 'production' &&
    ['localhost', '127.0.0.1', '[::1]'].includes(new URL(connectionString!).hostname)
  const passwordHash = await hashPassword(localDemo ? DEV_PASSWORD : randomUUID())

  // One account per seeded uploader, taken from the lessons themselves so the
  // two can never disagree.
  const uploaders = new Map<string, string>()
  for (const video of seedVideos) uploaders.set(video.uploaderId, video.uploaderName)

  for (const [id, name] of uploaders) {
    await prisma.user.upsert({
      where: { id }, update: {},
      create: { id, name, email: emailFor(id), passwordHash, role: 'teacher' }
    })
  }

  // One administrator, for the moderation tools in the brief's "if time
  // permits" list. No lesson is owned by it, so it cannot be an uploader.
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL }, update: {},
    create: { name: 'LearnStream Admin', email: ADMIN_EMAIL, passwordHash, role: 'admin' }
  })

  // Tags are free-form, so gather the union before inserting.
  const tagNames = new Set(seedVideos.flatMap(video => video.tags))
  for (const name of tagNames) {
    const slug = slugify(name)
    await prisma.tag.upsert({ where: { slug }, update: {}, create: { slug, name } })
  }
  const tags = await prisma.tag.findMany({ where: { slug: { in: [...tagNames].map(slugify) } } })
  const tagIdBySlug = new Map(tags.map(tag => [tag.slug, tag.id]))

  const subjectBySlug = new Map(subjects.map(subject => [subject.slug, subject.id]))

  for (const video of seedVideos) {
    const subjectId = subjectBySlug.get(video.subjectSlug)
    if (!subjectId) throw new Error(`Unknown subject "${video.subjectSlug}" on ${video.id}`)

    await prisma.video.upsert({
      where: { id: video.id }, update: {},
      create: {
        id: video.id,
        title: video.title,
        description: video.description,
        status: video.status,
        viewCount: video.views,
        likeCount: video.likes,
        dislikeCount: video.dislikes,
        createdAt: new Date(video.createdAt),
        subjectId,
        uploaderId: video.uploaderId,
        metadata: {
          create: {
            storageKey: video.src.startsWith('/media/') ? video.src.slice('/media/'.length) : null,
            thumbnailUrl: video.thumbnail.startsWith('/media/') ? null : video.thumbnail,
            thumbnailKey: video.thumbnail.startsWith('/media/') ? video.thumbnail.slice('/media/'.length) : null,
            durationSec: video.durationSec
          }
        },
        tags: {
          connect: video.tags
            .map(tag => tagIdBySlug.get(slugify(tag)))
            .filter((id): id is string => Boolean(id))
            .map(id => ({ id }))
        },
        captions: {
          create: (video.captions ?? []).map((cue, position) => ({
            position,
            start: cue.start,
            end: cue.end,
            text: cue.text
          }))
        }
      }
    })
  }

  for (const comment of seedComments) {
    await prisma.comment.upsert({
      where: { id: comment.id }, update: {},
      create: {
        id: comment.id,
        videoId: comment.videoId,
        // Seeded authors are not accounts, so the name is snapshotted only.
        authorName: comment.authorName,
        body: comment.body,
        createdAt: new Date(comment.createdAt)
      }
    })
  }

  console.log(
    `Seeded ${subjects.length} subjects, ${seedVideos.length} lessons, ` +
      `${tagNames.size} tags, ${seedComments.length} comments.`
  )
}

main()
  .catch(error => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
