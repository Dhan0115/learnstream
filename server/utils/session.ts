import { deleteCookie, getCookie, setCookie, type H3Event } from 'h3'
import type { User as UserRow } from '@prisma/client'
import { prisma } from './prisma'
import { SESSION_COOKIE, isProduction, sessionTtlDays } from './config'
import { createSessionToken } from './password'
import { unauthorized } from './errors'
import type { Role, User } from '../../src/types/index.ts'

/**
 * Cookie-backed sessions (design_spec.md §7).
 *
 * The cookie holds an opaque 256-bit token and nothing else — no user id, no
 * role, no signature to verify. Every request looks the token up in the
 * `Session` table, so signing out, expiring a session, or deleting an account
 * revokes access immediately rather than at the next token refresh.
 */

const ROLES: readonly Role[] = ['learner', 'teacher', 'admin']

function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value)
}

/** `Priya Raghavan` → `PR`. Mirrors the client's monogram fallback. */
export function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'LS'

  const first = parts[0].charAt(0)
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : ''
  return `${first}${last}`.toUpperCase()
}

/**
 * The teachers and admins — the side of a support conversation that answers
 * (design_spec.md §3.3). The same pair that may publish, so chat adds no role.
 */
export function isStaff(user: Pick<UserRow, 'role'>): boolean {
  return user.role === 'teacher' || user.role === 'admin'
}

/** The public shape of an account — the password hash never leaves the server. */
export function toPublicUser(user: Pick<UserRow, 'id' | 'name' | 'email' | 'role'>): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    initials: initialsFor(user.name),
    role: isRole(user.role) ? user.role : 'learner'
  }
}

/** Issue a session and hand the token to the browser in an HTTP-only cookie. */
export async function startSession(event: H3Event, userId: string): Promise<void> {
  const token = createSessionToken()
  const expiresAt = new Date(Date.now() + sessionTtlDays() * 24 * 60 * 60 * 1000)

  await prisma.session.create({ data: { id: token, userId, expiresAt } })

  setCookie(event, SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: isProduction(),
    expires: expiresAt
  })
}

/** The signed-in account, or null. Expired sessions are cleaned up on sight. */
export async function currentUser(event: H3Event): Promise<UserRow | null> {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token) return null

  const session = await prisma.session.findUnique({
    where: { id: token },
    include: { user: true }
  })
  if (!session) return null

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.deleteMany({ where: { id: token } })
    deleteCookie(event, SESSION_COOKIE, { path: '/' })
    return null
  }

  return session.user
}

/** Use in any handler that must know who is acting. Throws 401 otherwise. */
export async function requireUser(event: H3Event): Promise<UserRow> {
  const user = await currentUser(event)
  if (!user) throw unauthorized()
  return user
}

export async function endSession(event: H3Event): Promise<void> {
  const token = getCookie(event, SESSION_COOKIE)

  // Deleting the row, not just the cookie, is what actually signs the user out.
  if (token) await prisma.session.deleteMany({ where: { id: token } })

  deleteCookie(event, SESSION_COOKIE, { path: '/' })
}
