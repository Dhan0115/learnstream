import { readBody, type H3Event } from 'h3'
import { prisma } from '../../utils/prisma'
import { verifyPassword } from '../../utils/password'
import { parseOrThrow, signInSchema } from '../../utils/validation'
import { startSession, toPublicUser } from '../../utils/session'
import { apiError } from '../../utils/errors'

export default defineEventHandler(async (event: H3Event) => {
  const input = parseOrThrow(signInSchema, await readBody(event))

  // The same message whether the email is unknown or the password is wrong, so
  // the form never reveals which addresses have accounts.
  const failure = apiError(401, 'invalid_credentials', 'Email or password is incorrect.')

  const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } })
  if (!user) throw failure

  const matches = await verifyPassword(input.password, user.passwordHash)
  if (!matches) throw failure

  await startSession(event, user.id)

  return { user: toPublicUser(user) }
})
