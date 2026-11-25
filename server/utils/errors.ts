import { createError } from 'h3'

/**
 * Errors returned to the client.
 *
 * Nitro's error handler serialises these to JSON. `statusMessage` carries the
 * sentence the UI shows; `data.code` lets the client branch on a cause without
 * matching prose, and `data.message` mirrors it for clients that read `data`.
 */
export function apiError(statusCode: number, code: string, message: string) {
  return createError({
    statusCode,
    statusMessage: message,
    data: { code, message }
  })
}

export function badRequest(message: string, code = 'invalid_input') {
  return apiError(400, code, message)
}

export function unauthorized(message = 'Sign in to continue.') {
  return apiError(401, 'unauthorized', message)
}

export function forbidden(message = 'You do not have permission to do that.') {
  return apiError(403, 'forbidden', message)
}

export function notFound(message = 'That lesson could not be found.') {
  return apiError(404, 'not_found', message)
}
