<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from './AppIcon.vue'
import { useCatalog } from '@/composables/useCatalog'
import type { Video, VideoStatus } from '@/types'
import { formatDuration } from '@/utils/format'

const props = withDefaults(defineProps<{
  video: Video
  compact?: boolean
  featured?: boolean
  status?: VideoStatus | ''
  /** Optional line under the card, e.g. when the lesson was saved. */
  note?: string
}>(), {
  compact: false,
  featured: false,
  status: '',
  note: ''
})

const { subjectName } = useCatalog()

const href = computed(() => `/watch/${props.video.id}`)
const badge = computed(() => subjectName(props.video.subjectSlug))
const level = computed(() => props.video.tags.find(tag => /^(beginner|intermediate|advanced)$/i.test(tag)))
const statusLabel = computed(() =>
  props.status === 'published' ? 'Published' : props.status === 'processing' ? 'Processing' : ''
)
const monogram = computed(() => badge.value.slice(0, 1).toUpperCase())

// The poster is fetched from an external generator. If it is unavailable the
// card falls back to a themed monogram so the grid never shows a broken image.
const imageFailed = ref(false)
</script>

<template>
  <article
    class="video-card"
    :class="{ 'video-card--compact': compact, 'video-card--featured': featured }"
  >
    <RouterLink class="video-card__thumb-link" :to="href" :aria-label="video.title">
      <img
        v-if="!imageFailed"
        class="video-card__thumb"
        :src="video.thumbnail"
        :alt="`Lesson thumbnail: ${video.title}`"
        width="640"
        height="360"
        loading="lazy"
        @error="imageFailed = true"
      >
      <span v-else class="video-card__thumb-fallback" aria-hidden="true">{{ monogram }}</span>
      <span v-if="featured" class="video-card__flag">Featured</span>
      <span class="video-card__play" aria-hidden="true">
        <AppIcon name="play" :size="24" />
      </span>
    </RouterLink>

    <div class="video-card__body">
      <RouterLink class="video-card__title" :to="href">{{ video.title }}</RouterLink>

      <p class="video-card__description">{{ video.description }}</p>
      <p class="video-card__meta">
        <AppIcon name="clock" :size="14" />
        <span><span class="sr-only">Duration: </span>{{ formatDuration(video.durationSec) }}</span>
        <span aria-hidden="true">·</span>
        <span class="video-card__label">{{ level || badge }}</span>
      </p>
      <p v-if="note" class="video-card__note">{{ note }}</p>
      <p
        v-if="statusLabel"
        class="video-card__status"
        :class="{ 'video-card__status--processing': status === 'processing' }"
      >
        {{ statusLabel }}
      </p>
    </div>
  </article>
</template>

<style scoped lang="scss">
@use '@/assets/scss/tokens' as *;
@use '@/assets/scss/mixins' as *;

.video-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  height: 100%;
  min-width: 0;
  padding: 0.375rem;
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-xl;
  box-shadow: var(--shadow-sm);

  &__thumb-link {
    position: relative;
    display: block;
    overflow: hidden;
    background: $color-surface-muted;
    border: 1px solid $color-border;
    border-radius: $radius-lg;
    aspect-ratio: 16 / 9;
    

    @include focus-ring;
  }

  &__thumb {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 200ms ease;
  }

  &__thumb-fallback {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    font-size: 2.25rem;
    font-weight: 800;
    letter-spacing: 0.02em;
    color: $color-primary;
    background: $color-surface-muted;
  }

  &:hover &__thumb {
    transform: scale(1.03);
  }

  &__play {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: grid;
    place-items: center;
    width: 2.875rem;
    height: 2.875rem;
    color: #fff;
    background: rgb(0 0 0 / 80%);
    border-radius: 999px;
    pointer-events: none;
    opacity: 0;

    :deep(svg) {
      fill: currentColor;
    }
  }

  &:hover &__play,
  &__thumb-link:focus-visible &__play {
    opacity: 1;
  }

  &__flag {
    position: absolute;
    left: 0.5rem;
    top: 0.5rem;
    padding: 0.125rem 0.5rem;
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--ui-bg);
    background: $color-primary;
    border-radius: $radius-sm;
  }

  &__body {
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 0.375rem;
    padding: 0 0.625rem 0.625rem;
    min-width: 0;
  }

  &__title {
    font-size: 1.0625rem;
    font-weight: 700;
    line-height: 1.35;
    color: $color-text-highlighted;
    text-decoration: none;
    @include truncate(2);
    border-radius: $radius-sm;

    &:hover {
      color: $color-primary;
    }

    @include focus-ring;
  }

  &__description {
    font-size: 0.8125rem;
    line-height: 1.4;
    color: $color-text;
    @include truncate(2);
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem;
    margin-top: auto;
    padding-top: 0.25rem;
    font-size: 0.75rem;
    color: $color-text-muted;
  }

  &__label {
    text-transform: capitalize;
  }

  &__note {
    margin-top: 0.125rem;
    font-size: 0.75rem;
    color: $color-text-muted;
  }

  &__status {
    align-self: flex-start;
    padding: 0.0625rem 0.4375rem;
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: $color-success;
    border: 1px solid $color-success;
    border-radius: $radius-sm;

    &--processing {
      color: $color-text-muted;
      border-color: $color-border;
    }
  }

  &--featured {
    .video-card__thumb-link {
      border-color: $color-primary;
      box-shadow: 0 0 0 1px $color-primary;
    }
  }

  &--compact {
    flex-direction: row;
    gap: 0.75rem;


    .video-card__thumb-link {
      flex: none;
      align-self: stretch;
      width: min(38%, 10rem);
    }

    .video-card__body {
      padding: 0.375rem 0.375rem 0.375rem 0;
    }
  }
}
</style>
