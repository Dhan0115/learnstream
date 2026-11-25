// Database seed (design_spec.md §8.9).
//
// Reproduces exactly the content the site shipped with as static data, so the
// catalog looks identical the day the database takes over. Run with
// `pnpm db:seed`; it is idempotent — the tables are cleared first, because a
// re-seed must never mix old rows with new ones.
//
// Node runs this file directly (type stripping), so the imports below carry
// explicit `.ts` extensions.

import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../server/utils/password.ts'
import { slugify } from '../server/utils/slug.ts'
import { seedVideos } from '../src/data/videos.ts'
import { seedComments } from '../src/data/comments.ts'
import { subjects } from '../src/data/subjects.ts'

const prisma = new PrismaClient()

/** Every seeded account signs in with this password in development only. */
const DEV_PASSWORD = 'learnstream-dev'

/** The single administrator. Sign-up never offers this role (validation.ts). */
const ADMIN_EMAIL = 'admin@learnstream.test'

/** `u-amara` → `amara@learnstream.test`. */
function emailFor(uploaderId: string): string {
  return `${slugify(uploaderId.replace(/^u-/, ''))}@learnstream.test`
}

async function main() {
  // Clear in foreign-key order so the seed can be re-run at any time.
  await prisma.caption.deleteMany()
  await prisma.chapter.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.savedVideo.deleteMany()
  await prisma.reaction.deleteMany()
  await prisma.view.deleteMany()
  await prisma.videoMetadata.deleteMany()
  await prisma.video.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.subject.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()

  await prisma.subject.createMany({ data: subjects })

  const passwordHash = await hashPassword(DEV_PASSWORD)

  // One account per seeded uploader, taken from the lessons themselves so the
  // two can never disagree.
  const uploaders = new Map<string, string>()
  for (const video of seedVideos) uploaders.set(video.uploaderId, video.uploaderName)

  for (const [id, name] of uploaders) {
    await prisma.user.create({
      data: { id, name, email: emailFor(id), passwordHash, role: 'teacher' }
    })
  }

  // One administrator, for the moderation tools in the brief's "if time
  // permits" list. No lesson is owned by it, so it cannot be an uploader.
  await prisma.user.create({
    data: { name: 'LearnStream Admin', email: ADMIN_EMAIL, passwordHash, role: 'admin' }
  })

  // Tags are free-form, so gather the union before inserting.
  const tagNames = new Set(seedVideos.flatMap(video => video.tags))
  for (const name of tagNames) {
    await prisma.tag.create({ data: { slug: slugify(name), name } })
  }
  const tags = await prisma.tag.findMany()
  const tagIdBySlug = new Map(tags.map(tag => [tag.slug, tag.id]))

  const subjectBySlug = new Map(subjects.map(subject => [subject.slug, subject.id]))

  for (const video of seedVideos) {
    const subjectId = subjectBySlug.get(video.subjectSlug)
    if (!subjectId) throw new Error(`Unknown subject "${video.subjectSlug}" on ${video.id}`)

    await prisma.video.create({
      data: {
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
    await prisma.comment.create({
      data: {
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
  console.log(`Seeded accounts sign in with the password "${DEV_PASSWORD}".`)
  console.log(`Administrator: ${ADMIN_EMAIL}`)
}

main()
  .catch(error => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
