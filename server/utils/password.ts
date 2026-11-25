import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: string,
  keylen: number
) => Promise<Buffer>

/** Key length for the derived digest, in bytes. */
const KEY_LENGTH = 64

/**
 * Hashes a password with scrypt and a fresh 16-byte salt.
 *
 * The result is stored as `salt:hash`. scrypt is deliberately slow and
 * memory-hard, so a stolen database cannot be brute-forced at hash speed —
 * which is the whole reason a plain digest is not good enough.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const derived = await scryptAsync(password, salt, KEY_LENGTH)
  return `${salt}:${derived.toString('hex')}`
}

/**
 * Checks a password against a stored `salt:hash`, in constant time.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false

  const expected = Buffer.from(hash, 'hex')
  if (expected.length !== KEY_LENGTH) return false

  const derived = await scryptAsync(password, salt, KEY_LENGTH)
  return timingSafeEqual(derived, expected)
}

/** A 256-bit opaque session token, URL-safe so it can live in a cookie. */
export function createSessionToken(): string {
  return randomBytes(32).toString('base64url')
}
