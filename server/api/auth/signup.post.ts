import { readBody, type H3Event } from 'h3'
import { prisma } from '../../utils/prisma'
import { hashPassword } from '../../utils/password'
import { parseOrThrow, signUpSchema } from '../../utils/validation'
import { startSession, toPublicUser } from '../../utils/session'
import { apiError } from '../../utils/errors'

/** Create an account and sign in, so a new learner lands ready to participate. */
export default defineEventHandler(async (event: H3Event) => {
  const input = parseOrThrow(signUpSchema, await readBody(event))
  const email = input.email.toLowerCase()

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw apiError(
      409,
      'email_taken',
      'An account with that email already exists — sign in instead.'
    )
  }

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email,
      passwordHash: await hashPassword(input.password),
      role: 'learner'
    }
  })

  await startSession(event, user.id)

  return { user: toPublicUser(user) }
})
