/**
 * The one place the app talks to the backend (design_spec.md §7).
 *
 * Every call goes through here so that three things are true everywhere:
 * the session cookie is always sent, a failed request always becomes an
 * `ApiError` carrying the sentence the UI should show, and no component has to
 * know the shape of an error response.
 */

interface ErrorBody {
  statusMessage?: string
  data?: { code?: string; message?: string }
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

const OFFLINE_MESSAGE = 'We could not reach the server. Check your connection and try again.'
const GENERIC_MESSAGE = 'Something went wrong. Please try again.'

function parseBody(text: string): unknown {
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

/** The one place a failed response becomes the sentence the UI shows. */
function toError(status: number, body: unknown): ApiError {
  const failure = (body ?? {}) as ErrorBody
  return new ApiError(
    status,
    failure.data?.code ?? 'error',
    failure.data?.message ?? failure.statusMessage ?? GENERIC_MESSAGE
  )
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  let response: Response

  try {
    response = await fetch(path, { credentials: 'same-origin', ...init })
  } catch {
    throw new ApiError(0, 'network_error', OFFLINE_MESSAGE)
  }

  if (response.status === 204) return undefined as T

  const body = parseBody(await response.text())

  if (!response.ok) throw toError(response.status, body)

  return body as T
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' })
}

export function apiSend<T>(
  path: string,
  method: 'POST' | 'PUT' | 'DELETE',
  body?: unknown
): Promise<T> {
  return request<T>(path, {
    method,
    headers: body === undefined ? undefined : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  })
}

/** Multipart upload — the browser sets the boundary, so no content type here. */
export function apiForm<T>(path: string, form: FormData): Promise<T> {
  return request<T>(path, { method: 'POST', body: form })
}

/**
 * Multipart upload that reports how much of the body has been sent.
 *
 * `fetch` cannot report upload progress, so this one call uses
 * `XMLHttpRequest`. The response, the error shape and the cookie behaviour are
 * identical to `apiForm`, so a caller can switch between them without changing
 * anything else.
 */
export function apiFormProgress<T>(
  path: string,
  form: FormData,
  onProgress: (percent: number) => void
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', path)
    xhr.withCredentials = true

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100))
    })

    xhr.addEventListener('load', () => {
      const body = parseBody(xhr.responseText)

      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100)
        resolve((xhr.status === 204 ? undefined : body) as T)
        return
      }

      reject(toError(xhr.status, body))
    })

    xhr.addEventListener('error', () => reject(new ApiError(0, 'network_error', OFFLINE_MESSAGE)))
    xhr.addEventListener('abort', () => reject(new ApiError(0, 'network_error', OFFLINE_MESSAGE)))

    xhr.send(form)
  })
}

/** Turn any thrown value into the sentence a component can render. */
export function messageFor(error: unknown): string {
  return error instanceof ApiError ? error.message : GENERIC_MESSAGE
}
