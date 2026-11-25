import { createHash } from 'node:crypto'
import { getRequestHeader, getRequestIP, type H3Event } from 'h3'
import { viewerSecret } from './config'

/**
 * A salted fingerprint of the viewer's address and user agent.
 *
 * The duplicate-view guard needs to recognise a repeat viewer, but it must not
 * store anything identifying, so only this digest is ever written to the
 * database (prisma/schema.prisma, `View.viewerKey`).
 */
export function viewerKey(event: H3Event): string {
  const address = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const agent = getRequestHeader(event, 'user-agent') ?? 'unknown'

  return createHash('sha256').update(`${viewerSecret()}:${address}:${agent}`).digest('hex')
}
