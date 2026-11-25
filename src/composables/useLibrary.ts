import { computed, ref } from 'vue'
import { apiGet, apiSend, messageFor } from '@/utils/api'
import { patchVideo } from '@/composables/useCatalog'
import { reactions, savedEntries, type Reaction } from '@/composables/useSession'
import type { Comment } from '@/types'

export type { Reaction, SavedEntry } from '@/composables/useSession'

/**
 * The viewer's library and the conversation on a lesson (design_spec.md §4.3,
 * §4.6, §4.8).
 *
 * Saving and voting are server actions, so each one is sent first and the local
 * state follows the server's answer. The returned totals are the ones shown, so
 * two tabs cannot end up disagreeing about how many likes a lesson has.
 */

const commentsByVideo = ref<Record<string, Comment[]>>({})

export function useLibrary() {
  /** Saved lessons, most recently saved first. */
  const saved = computed(() =>
    [...savedEntries.value].sort((a, b) => Date.parse(b.savedAt) - Date.parse(a.savedAt))
  )

  const savedIds = computed(() => saved.value.map(entry => entry.videoId))

  function isSaved(videoId: string): boolean {
    return savedEntries.value.some(entry => entry.videoId === videoId)
  }

  function savedAt(videoId: string): string | undefined {
    return savedEntries.value.find(entry => entry.videoId === videoId)?.savedAt
  }

  /** Saves or unsaves, and returns a sentence to show if it failed. */
  async function toggleSave(videoId: string): Promise<string | null> {
    const next = !isSaved(videoId)

    try {
      await apiSend(`/api/videos/${encodeURIComponent(videoId)}/saved`, 'PUT', { saved: next })
    } catch (error) {
      return messageFor(error)
    }

    savedEntries.value = next
      ? [
          { videoId, savedAt: new Date().toISOString() },
          ...savedEntries.value.filter(entry => entry.videoId !== videoId)
        ]
      : savedEntries.value.filter(entry => entry.videoId !== videoId)

    return null
  }

  function reactionFor(videoId: string): Reaction {
    return reactions.value[videoId] ?? null
  }

  /** Clicking an active reaction clears it, so the same button toggles. */
  async function setReaction(
    videoId: string,
    next: Exclude<Reaction, null>
  ): Promise<string | null> {
    const kind: Reaction = reactionFor(videoId) === next ? null : next

    let totals: { likes: number; dislikes: number }
    try {
      totals = await apiSend<{ likes: number; dislikes: number }>(
        `/api/videos/${encodeURIComponent(videoId)}/reaction`,
        'PUT',
        { kind }
      )
    } catch (error) {
      return messageFor(error)
    }

    patchVideo(videoId, { likes: totals.likes, dislikes: totals.dislikes })

    if (kind) {
      reactions.value = { ...reactions.value, [videoId]: kind }
    } else {
      const { [videoId]: _cleared, ...rest } = reactions.value
      reactions.value = rest
    }

    return null
  }

  function commentsFor(videoId: string): Comment[] {
    return commentsByVideo.value[videoId] ?? []
  }

  async function loadComments(videoId: string): Promise<string | null> {
    try {
      const payload = await apiGet<{ comments: Comment[] }>(
        `/api/videos/${encodeURIComponent(videoId)}/comments`
      )
      commentsByVideo.value = { ...commentsByVideo.value, [videoId]: payload.comments }
      return null
    } catch (error) {
      return messageFor(error)
    }
  }

  async function addComment(videoId: string, body: string): Promise<string | null> {
    const text = body.trim()
    if (!text) return null

    try {
      const { comment } = await apiSend<{ comment: Comment }>(
        `/api/videos/${encodeURIComponent(videoId)}/comments`,
        'POST',
        { body: text }
      )
      commentsByVideo.value = {
        ...commentsByVideo.value,
        [videoId]: [...commentsFor(videoId), comment]
      }
      return null
    } catch (error) {
      return messageFor(error)
    }
  }

  return {
    saved,
    savedIds,
    isSaved,
    savedAt,
    toggleSave,
    reactionFor,
    setReaction,
    commentsFor,
    loadComments,
    addComment
  }
}
