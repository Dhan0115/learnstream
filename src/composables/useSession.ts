import { computed, ref } from 'vue'
import { apiGet, messageFor, apiSend } from '@/utils/api'
import type { Role, User } from '@/types'

export interface SignupDetails {
  name: string
  email: string
  password: string
}

export interface LoginDetails {
  email: string
  password: string
}

export type AuthResult = { ok: true } | { ok: false; error: string }

/** The viewer's vote on a lesson; `null` means no vote. */
export type Reaction = 'like' | 'dislike' | null

/** A saved lesson plus when it was saved, so `/saved` can show the date. */
export interface SavedEntry {
  videoId: string
  /** ISO 8601. */
  savedAt: string
}

interface AccountResponse {
  user: User | null
  saved: SavedEntry[]
  reactions: Record<string, Exclude<Reaction, null>>
}

/**
 * The signed-in account and the library that belongs to it (design_spec.md §7).
 *
 * All three pieces of state live here because `/api/me` returns them together
 * and they are all invalidated by the same events — signing in, signing out,
 * and the first paint. `useLibrary` reads this state; nothing here reads back,
 * so the two modules never form a cycle.
 */
const user = ref<User | null>(null)
const savedEntries = ref<SavedEntry[]>([])
const reactions = ref<Record<string, Exclude<Reaction, null>>>({})
const ready = ref(false)

export { user, savedEntries, reactions, ready }

const role = computed<Role | null>(() => user.value?.role ?? null)
const canUpload = computed(() => role.value === 'admin')
const isStaff = computed(() => role.value === 'teacher' || role.value === 'admin')

function clearAccount() {
  user.value = null
  savedEntries.value = []
  reactions.value = {}
}

/**
 * Load the account for the current cookie. Called once before the app mounts,
 * so the router's auth guard — and the header — already know who is signed in
 * by the time the first route resolves.
 */
export async function loadAccount(): Promise<void> {
  try {
    const payload = await apiGet<AccountResponse>('/api/me')
    user.value = payload.user
    savedEntries.value = payload.saved
    reactions.value = payload.reactions
  } catch {
    // A visitor we cannot identify is simply signed out; the pages still work.
    clearAccount()
  } finally {
    ready.value = true
  }
}

export function useSession() {
  async function signup(details: SignupDetails): Promise<AuthResult> {
    try {
      const { user: created } = await apiSend<{ user: User }>('/api/auth/signup', 'POST', {
        name: details.name,
        email: details.email,
        password: details.password
      })
      user.value = created
      savedEntries.value = []
      reactions.value = {}
      return { ok: true }
    } catch (error) {
      return { ok: false, error: messageFor(error) }
    }
  }

  async function login(details: LoginDetails): Promise<AuthResult> {
    try {
      const { user: signedIn } = await apiSend<{ user: User }>('/api/auth/signin', 'POST', {
        email: details.email,
        password: details.password
      })
      user.value = signedIn
      // The new account's library is not in memory yet, so pull it in.
      await loadAccount()
      return { ok: true }
    } catch (error) {
      return { ok: false, error: messageFor(error) }
    }
  }

  async function logout(): Promise<void> {
    try {
      await apiSend('/api/auth/signout', 'POST')
    } finally {
      clearAccount()
    }
  }

  return { user, role, canUpload, isStaff, ready, signup, login, logout }
}
