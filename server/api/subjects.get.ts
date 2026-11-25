import type { H3Event } from 'h3'
import { prisma } from '../utils/prisma'
import { toSubjectDto } from '../utils/serialize'

/**
 * The eight subjects, with a lesson count per subject.
 *
 * The count is derived here rather than stored on `Subject`, so it can never
 * disagree with the catalog (prisma/schema.prisma).
 */
export default defineEventHandler(async (_event: H3Event) => {
  const [subjects, counts] = await Promise.all([
    prisma.subject.findMany({ orderBy: { name: 'asc' } }),
    prisma.video.groupBy({
      by: ['subjectId'],
      where: { status: 'published' },
      _count: { _all: true }
    })
  ])

  const countBySubject = new Map(counts.map(row => [row.subjectId, row._count._all]))

  return {
    subjects: subjects.map(subject => ({
      ...toSubjectDto(subject),
      videoCount: countBySubject.get(subject.id) ?? 0
    }))
  }
})
