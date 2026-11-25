<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import CommentSection from '@/components/CommentSection.vue'
import EmptyState from '@/components/EmptyState.vue'
import SectionHeader from '@/components/SectionHeader.vue'
import TagList from '@/components/TagList.vue'
import VideoCard from '@/components/VideoCard.vue'
import VideoPlayer from '@/components/VideoPlayer.vue'
import VideoManagement from '@/components/VideoManagement.vue'
import { useCatalog } from '@/composables/useCatalog'
import { useLibrary } from '@/composables/useLibrary'
import { setPageMeta } from '@/composables/usePageMeta'
import { useSession } from '@/composables/useSession'
import { ApiError } from '@/utils/api'
import type { Video } from '@/types'
import { formatCount, formatDuration, formatRelativeDate, formatViews } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const { getVideo, forgetVideo, fetchVideo, fetchRelated, subjectBySlug, subjectName, recordView } = useCatalog()
const { isSaved, toggleSave, reactionFor, setReaction, commentsFor } = useLibrary()
const { user } = useSession()

const playerRef = ref<InstanceType<typeof VideoPlayer> | null>(null)
const expanded = ref(false)
const following = ref(false)
const shareMessage = ref('')

// `loading` until the server answers, `missing` when the lesson is gone or still
// processing, `error` when the request itself failed (design_spec.md §4.3).
const state = ref<'loading' | 'ready' | 'missing' | 'error'>('loading')
const actionError = ref('')
const relatedVideos = ref<Video[]>([])

let shareTimer: number | undefined

const videoId = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''))
// Read from the shared cache, so a counted view or a placed vote shows up here
// without refetching the lesson.
const video = computed(() => getVideo(videoId.value))
function afterDelete(id: string) {
  forgetVideo(id)
  if (videoId.value === id) void router.replace({ name: 'browse' })
}
const subject = computed(() => (video.value ? subjectBySlug(video.value.subjectSlug) : undefined))
const commentCount = computed(() => (video.value ? commentsFor(video.value.id).length : 0))

const loading = computed(() => state.value === 'loading' && !video.value)
const emptyTitle = computed(() =>
  state.value === 'error' ? 'We could not load this lesson' : 'That lesson could not be found'
)
const emptyText = computed(() =>
  state.value === 'error'
    ? 'Something interrupted the request. Check your connection and try again.'
    : 'It may have been removed, or the lesson may still be processing.'
)

const reaction = computed(() => reactionFor(videoId.value))
const likeCount = computed(() => video.value?.likes ?? 0)
const dislikeCount = computed(() => video.value?.dislikes ?? 0)
const saved = computed(() => isSaved(videoId.value))

const captions = computed(() => video.value?.captions ?? [])
const chapters = computed(() => video.value?.chapters ?? [])
const isLongDescription = computed(() => (video.value?.description.length ?? 0) > 320)

/**
 * Liking, disliking and saving belong to an account (design_spec.md §4.3), so a
 * signed-out viewer is sent to sign in and returned here afterwards. Each action
 * is a server call, and a failure is shown instead of silently swallowed.
 */
function requireAccount(): boolean {
  if (!user.value) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return false
  }
  return true
}

async function onLike() {
  if (!requireAccount()) return
  actionError.value = (await setReaction(videoId.value, 'like')) ?? ''
}

async function onDislike() {
  if (!requireAccount()) return
  actionError.value = (await setReaction(videoId.value, 'dislike')) ?? ''
}

async function onSave() {
  if (!requireAccount()) return
  actionError.value = (await toggleSave(videoId.value)) ?? ''
}

/** Jump the player to a moment: a transcript cue or a chapter (design_spec.md §4.3). */
function onSeek(seconds: number) {
  playerRef.value?.seekTo(seconds)
}

async function share() {
  if (typeof window === 'undefined') return
  const url = `${window.location.origin}/watch/${videoId.value}`

  try {
    await navigator.clipboard.writeText(url)
    shareMessage.value = 'Link copied to clipboard'
  } catch {
    shareMessage.value = `Copy this link: ${url}`
  }

  window.clearTimeout(shareTimer)
  shareTimer = window.setTimeout(() => {
    shareMessage.value = ''
  }, 3000)
}

/** Load the lesson, then its related rail, then count the open as a view. */
async function load(id: string) {
  state.value = 'loading'
  actionError.value = ''
  relatedVideos.value = []

  try {
    await fetchVideo(id)
    state.value = 'ready'

    // The server ignores a repeat view from the same viewer inside its window,
    // so the count it returns is the one worth showing (design_spec.md §4.3).
    void recordView(id)
    void loadRelated(id)
  } catch (error) {
    state.value = error instanceof ApiError && error.status === 404 ? 'missing' : 'error'
  }
}

async function loadRelated(id: string) {
  try {
    relatedVideos.value = await fetchRelated(id, 6)
  } catch {
    // The rail simply stays empty; the lesson itself still plays.
  }
}

watch(
  videoId,
  (id: string) => {
    expanded.value = false
    following.value = false
    shareMessage.value = ''

    if (id) {
      void load(id)
    } else {
      state.value = 'missing'
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  window.clearTimeout(shareTimer)
})

// A lesson page is the one most likely to be reached from a search result, so
// its title and description name the lesson, subject and uploader rather than
// the generic route wording (design_spec.md §4.8).
function applyVideoMeta(current: Video) {
  const subjectLabel = subjectName(current.subjectSlug)
  setPageMeta(
    `${current.title} · ${subjectLabel}`,
    `${current.title} — a ${subjectLabel} lesson by ${current.uploaderName} on LearnStream. ${current.description}`
  )
}

watch(
  () => [video.value?.id, video.value?.title, video.value?.description, video.value?.subjectSlug],
  () => {
    const current = video.value
    if (current) {
      applyVideoMeta(current)
    } else if (state.value === 'missing') {
      setPageMeta('Lesson not found', 'This lesson could not be found or is still being processed.')
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="watch">
    <div class="watch__container">
      <div v-if="loading" class="watch__loading" aria-busy="true">
        <p class="watch__loading-text" role="status">Loading lesson…</p>
      </div>

      <div v-else-if="video && state !== 'missing'" class="watch__layout">
        <div class="watch__primary">
          <VideoPlayer
            ref="playerRef"
            :src="video.src"
            :poster="video.thumbnail"
            :title="video.title"
            :captions="captions"
          />

          <h1 class="watch__title">{{ video.title }}</h1>
          <VideoManagement
            v-if="user && (user.id === video.uploaderId || user.role === 'admin')"
            :key="video.id"
            :video="video"
            @removed="afterDelete"
          />

          <p class="watch__meta">
            <span>{{ formatViews(video.views) }}</span>
            <span class="watch__sep" aria-hidden="true">·</span>
            <span>{{ formatRelativeDate(video.createdAt) }}</span>
            <span class="watch__sep" aria-hidden="true">·</span>
            <span>{{ formatDuration(video.durationSec) }}</span>
          </p>

          <div class="watch__channel">
            <span class="watch__channel-avatar" aria-hidden="true">
              {{ video.uploaderName.slice(0, 1).toUpperCase() }}
            </span>
            <div class="watch__channel-text">
              <p class="watch__channel-name">{{ video.uploaderName }}</p>
              <p class="watch__channel-role">Educator on LearnStream</p>
            </div>
            <button
              type="button"
              class="watch__follow"
              :class="{ 'watch__follow--active': following }"
              :aria-pressed="following"
              @click="following = !following"
            >
              {{ following ? 'Following' : 'Follow' }}
            </button>
          </div>

          <div class="watch__actions">
            <button
              type="button"
              class="watch__action"
              :class="{ 'watch__action--active': reaction === 'like' }"
              :aria-pressed="reaction === 'like'"
              @click="onLike"
            >
              <AppIcon name="heart" :size="16" />
              <span>{{ formatCount(likeCount) }}</span>
              <span class="watch__action-label">Like</span>
            </button>

            <button
              type="button"
              class="watch__action"
              :class="{ 'watch__action--active': reaction === 'dislike' }"
              :aria-pressed="reaction === 'dislike'"
              @click="onDislike"
            >
              <AppIcon name="thumbs-down" :size="16" />
              <span>{{ formatCount(dislikeCount) }}</span>
              <span class="watch__action-label">Dislike</span>
            </button>

            <button
              type="button"
              class="watch__action"
              :class="{ 'watch__action--active': saved }"
              :aria-pressed="saved"
              @click="onSave"
            >
              <AppIcon name="bookmark" :size="16" />
              <span>{{ saved ? 'Saved' : 'Save' }}</span>
            </button>

            <button type="button" class="watch__action" @click="share">
              <AppIcon name="share" :size="16" />
              <span>Share</span>
            </button>
          </div>

          <p v-if="shareMessage" class="watch__share-status" role="status">{{ shareMessage }}</p>

          <p v-if="actionError" class="watch__action-error" role="alert">{{ actionError }}</p>

          <div class="watch__tags">
            <TagList
              :subject-label="subjectName(video.subjectSlug)"
              :subject-to="`/subjects/${video.subjectSlug}`"
              :tags="video.tags"
            />
          </div>

          <div class="watch__description">
            <h2 class="watch__section-title">About this lesson</h2>
            <p class="watch__description-text" :class="{ 'watch__description-text--clamped': !expanded && isLongDescription }">
              {{ video.description }}
            </p>
            <button
              v-if="isLongDescription"
              type="button"
              class="watch__description-toggle"
              @click="expanded = !expanded"
            >
              {{ expanded ? 'Show less' : 'Show more' }}
            </button>
          </div>

          <section v-if="chapters.length" class="watch__chapters" aria-labelledby="chapters-heading">
            <h2 id="chapters-heading" class="watch__section-title">Chapters</h2>
            <ol class="watch__chapter-list">
              <li v-for="(chapter, index) in chapters" :key="index">
                <button type="button" class="watch__chapter" @click="onSeek(chapter.startSec)">
                  <span class="watch__chapter-time">{{ formatDuration(chapter.startSec) }}</span>
                  <span class="watch__chapter-title">{{ chapter.title }}</span>
                </button>
              </li>
            </ol>
          </section>

          <section v-if="captions.length" class="watch__transcript" aria-labelledby="transcript-heading">
            <h2 id="transcript-heading" class="watch__section-title">Transcript</h2>
            <p class="watch__transcript-hint">
              Select a line to jump to that moment. Captions can also be switched on inside the player.
            </p>
            <ol class="watch__transcript-list">
              <li v-for="(cue, index) in captions" :key="index">
                <button type="button" class="watch__transcript-line" @click="onSeek(cue.start)">
                  <span class="watch__transcript-time">{{ formatDuration(cue.start) }}</span>
                  <span class="watch__transcript-text">{{ cue.text }}</span>
                </button>
              </li>
            </ol>
          </section>

          <CommentSection class="watch__comments" :video-id="video.id" />
        </div>

        <aside class="watch__aside">
          <SectionHeader
            :title="`More in ${subjectName(video.subjectSlug)}`"
            :subtitle="`${commentCount} ${commentCount === 1 ? 'question' : 'questions'} on this lesson`"
          />

          <div class="watch__related">
            <VideoCard v-for="item in relatedVideos" :key="item.id" :video="item" compact />
          </div>

          <router-link v-if="subject" class="watch__subject-link" :to="`/subjects/${subject.slug}`">
            View all {{ subject.name }} lessons
            <AppIcon name="chevron-right" :size="16" />
          </router-link>
        </aside>
      </div>

      <EmptyState
        v-else
        icon="alert"
        :title="emptyTitle"
        :text="emptyText"
        action-label="Browse all lessons"
        action-to="/browse"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/scss/tokens' as *;
@use '@/assets/scss/mixins' as *;

.watch {
  &__container {
    width: 100%;
    max-width: 80rem;
    margin: 0 auto;
    padding: 1.5rem 1rem 0;

    @include up(sm) {
      padding-inline: 1.5rem;
    }

    @include up(lg) {
      padding-inline: 2rem;
      padding-top: 2.5rem;
    }
  }

  &__layout {
    display: grid;
    gap: 2.5rem;

    @include up(lg) {
      grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
      gap: 2rem;
    }
  }

  &__primary {
    min-width: 0;
  }

  &__title {
    margin-top: 1.25rem;
    font-size: 1.375rem;
    font-weight: 700;
    line-height: 1.3;
    color: $color-text-highlighted;

    @include up(md) {
      font-size: 1.625rem;
    }
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.375rem;
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: $color-text-muted;
  }

  &__sep {
    color: $color-border;
  }

  &__channel {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 1.25rem;
    padding-block: 1rem;
    border-block: 1px solid $color-border;
  }

  &__channel-avatar {
    display: grid;
    place-items: center;
    flex: none;
    width: 2.75rem;
    height: 2.75rem;
    font-size: 1.125rem;
    font-weight: 700;
    color: $color-primary;
    background: $color-surface-muted;
    border: 1px solid $color-border;
    border-radius: 999px;
  }

  &__channel-text {
    min-width: 0;
  }

  &__channel-name {
    font-size: 0.9375rem;
    font-weight: 600;
    color: $color-text-highlighted;
  }

  &__channel-role {
    font-size: 0.8125rem;
    color: $color-text-muted;
  }

  &__follow {
    margin-left: auto;
    flex: none;
    padding: 0.4375rem 0.875rem;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--ui-bg);
    background: $color-primary;
    border: 1px solid transparent;
    border-radius: $radius-md;
    cursor: pointer;
    transition: opacity 150ms ease;

    &:hover {
      opacity: 0.9;
    }

    @include focus-ring;

    &--active {
      color: $color-text;
      background: transparent;
      border-color: $color-border;
    }
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  &__action {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 0.875rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: $color-text;
    background: $color-surface-muted;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    cursor: pointer;
    transition: border-color 150ms ease, color 150ms ease;

    &:hover {
      border-color: $color-primary;
      color: $color-primary;
    }

    @include focus-ring;

    &--active {
      color: $color-primary;
      border-color: $color-primary;
    }
  }

  &__action-label {
    @media (max-width: 400px) {
      display: none;
    }
  }

  &__share-status {
    margin-top: 0.75rem;
    font-size: 0.8125rem;
    font-weight: 600;
    color: $color-success;
  }

  &__action-error {
    margin-top: 0.75rem;
    font-size: 0.8125rem;
    font-weight: 600;
    color: $color-error;
  }

  &__loading {
    display: grid;
    place-items: center;
    min-height: 40vh;
  }

  &__loading-text {
    font-size: 0.9375rem;
    font-weight: 600;
    color: $color-text-muted;
  }

  &__tags {
    margin-top: 1.25rem;
  }

  &__section-title {
    margin-bottom: 0.5rem;
    font-size: 1.0625rem;
    font-weight: 700;
    color: $color-text-highlighted;
  }

  &__description {
    margin-top: 1.75rem;
    padding: 1.25rem;
    background: $color-surface-muted;
    border-radius: $radius-lg;
  }

  &__description-text {
    font-size: 0.9375rem;
    line-height: 1.7;
    color: $color-text;

    &--clamped {
      @include truncate(4);
    }
  }

  &__description-toggle {
    margin-top: 0.5rem;
    padding: 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: $color-primary;
    background: none;
    border: 0;
    cursor: pointer;
    border-radius: $radius-sm;

    @include focus-ring;
  }

  &__chapters {
    margin-top: 1.75rem;
  }

  &__chapter-list {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    padding: 0.5rem;
    background: $color-surface-muted;
    border-radius: $radius-lg;
    list-style: none;
  }

  &__transcript {
    margin-top: 1.75rem;
  }

  &__transcript-hint {
    margin-bottom: 0.75rem;
    font-size: 0.8125rem;
    color: $color-text-muted;
  }

  &__transcript-list {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    max-height: 20rem;
    overflow-y: auto;
    padding: 0.5rem;
    background: $color-surface-muted;
    border-radius: $radius-lg;
    list-style: none;
  }

  // Chapters and transcript lines are the same control: jump the player to a moment.
  &__chapter,
  &__transcript-line {
    display: flex;
    gap: 0.75rem;
    width: 100%;
    padding: 0.5rem 0.625rem;
    text-align: left;
    background: transparent;
    border: 0;
    border-radius: $radius-md;
    cursor: pointer;

    &:hover {
      background: $color-surface;
    }

    @include focus-ring;
  }

  &__chapter-time,
  &__transcript-time {
    flex: none;
    font-size: 0.8125rem;
    font-variant-numeric: tabular-nums;
    font-weight: 600;
    color: $color-primary;
  }

  &__chapter-title {
    font-size: 0.875rem;
    font-weight: 600;
    line-height: 1.55;
    color: $color-text;
  }

  &__transcript-text {
    font-size: 0.875rem;
    line-height: 1.55;
    color: $color-text;
  }

  &__comments {
    margin-top: 2.5rem;
  }

  &__aside {
    min-width: 0;
  }

  &__related {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  &__subject-link {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    margin-top: 1.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: $color-primary;
    text-decoration: none;
    border-radius: $radius-sm;

    &:hover {
      text-decoration: underline;
    }

    @include focus-ring;
  }
}
</style>
