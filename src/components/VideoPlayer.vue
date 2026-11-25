<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import type { CaptionCue } from '@/types'
import { formatDuration } from '@/utils/format'

const props = withDefaults(defineProps<{
  src: string
  poster: string
  title: string
  captions?: CaptionCue[]
}>(), {
  captions: () => []
})

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2]

const rateSelectId = useId()
const stageEl = ref<HTMLElement | null>(null)
const videoEl = ref<HTMLVideoElement | null>(null)

const isPlaying = ref(false)
const isFullscreen = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(1)
const muted = ref(false)
const rate = ref(1)
const captionsOn = ref(false)

// Seeded demo lessons have no media file (design_spec.md §8.1); the controls
// stay visible but disabled so the intended UI is clear.
const hasSource = computed(() => props.src !== '')
const hasCaptions = computed(() => props.captions.length > 0)
const seekMax = computed(() => Math.max(duration.value, 0))

// Poster images come from an external generator; fall back to a themed plate
// rather than showing a broken image when it is unavailable.
const posterFailed = ref(false)

watch(() => props.poster, () => {
  posterFailed.value = false
})

const activeCue = computed<CaptionCue | null>(() => {
  if (!captionsOn.value) return null
  return props.captions.find(cue => currentTime.value >= cue.start && currentTime.value < cue.end) ?? null
})

function togglePlay() {
  const element = videoEl.value
  if (!element) return
  if (element.paused) void element.play()
  else element.pause()
}

function seekTo(seconds: number) {
  const element = videoEl.value
  const limit = duration.value > 0 ? duration.value : seconds
  const target = Math.min(Math.max(seconds, 0), limit)
  currentTime.value = target
  if (element) element.currentTime = target
}

function onSeekInput(event: Event) {
  seekTo(Number((event.target as HTMLInputElement).value))
}

function onVolumeInput(event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  volume.value = value
  muted.value = value === 0
  const element = videoEl.value
  if (element) {
    element.volume = value
    element.muted = value === 0
  }
}

function toggleMute() {
  muted.value = !muted.value
  const element = videoEl.value
  if (element) element.muted = muted.value
}

function onRateChange(event: Event) {
  const value = Number((event.target as HTMLSelectElement).value)
  rate.value = value
  const element = videoEl.value
  if (element) element.playbackRate = value
}

function toggleCaptions() {
  if (hasCaptions.value) captionsOn.value = !captionsOn.value
}

async function toggleFullscreen() {
  if (typeof document === 'undefined' || !stageEl.value) return
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    } else {
      await stageEl.value.requestFullscreen()
    }
  } catch {
    /* the browser refused fullscreen — nothing to undo */
  }
}

function onFullscreenChange() {
  isFullscreen.value = typeof document !== 'undefined' && document.fullscreenElement === stageEl.value
}

function onLoadedMetadata() {
  duration.value = videoEl.value?.duration ?? 0
}

function onTimeUpdate() {
  currentTime.value = videoEl.value?.currentTime ?? 0
}

onMounted(() => {
  document.addEventListener('fullscreenchange', onFullscreenChange)
})

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange)
})

defineExpose({ seekTo })
</script>

<template>
  <div
    ref="stageEl"
    class="video-player"
    :class="{ 'video-player--fullscreen': isFullscreen, 'is-playing': isPlaying }"
  >
    <div class="video-player__stage">
      <video
        v-if="hasSource"
        ref="videoEl"
        class="video-player__media"
        :src="src"
        :poster="poster"
        preload="metadata"
        playsinline
        @click="togglePlay"
        @play="isPlaying = true"
        @pause="isPlaying = false"
        @ended="isPlaying = false"
        @loadedmetadata="onLoadedMetadata"
        @timeupdate="onTimeUpdate"
      />
      <img
        v-else-if="!posterFailed"
        class="video-player__media"
        :src="poster"
        :alt="`Lesson poster: ${title}`"
        width="1280"
        height="720"
        @error="posterFailed = true"
      >
      <div v-else class="video-player__poster-fallback">
        <AppIcon name="play" :size="40" />
        <span>{{ title }}</span>
      </div>

      <p v-if="!hasSource" class="video-player__demo">
        Demo lesson — no video file is attached in this preview.
      </p>

      <p v-if="activeCue" class="video-player__caption">{{ activeCue.text }}</p>
    </div>

    <div class="video-player__controls">
      <button
        type="button"
        class="video-player__button"
        :aria-label="isPlaying ? 'Pause' : 'Play'"
        :disabled="!hasSource"
        @click="togglePlay"
      >
        <AppIcon :name="isPlaying ? 'pause' : 'play'" :size="18" />
      </button>

      <input
        class="video-player__seek"
        type="range"
        min="0"
        :max="seekMax"
        step="0.1"
        :value="currentTime"
        :disabled="!hasSource"
        aria-label="Seek through the lesson"
        @input="onSeekInput"
      >

      <p class="video-player__time">
        {{ formatDuration(currentTime) }} / {{ formatDuration(duration) }}
      </p>

      <button
        type="button"
        class="video-player__button"
        :aria-label="muted ? 'Unmute' : 'Mute'"
        :disabled="!hasSource"
        @click="toggleMute"
      >
        <AppIcon :name="muted ? 'volume-off' : 'volume'" :size="18" />
      </button>

      <input
        class="video-player__volume"
        type="range"
        min="0"
        max="1"
        step="0.05"
        :value="muted ? 0 : volume"
        :disabled="!hasSource"
        aria-label="Volume"
        @input="onVolumeInput"
      >

      <div class="video-player__speed">
        <label class="video-player__speed-label" :for="rateSelectId">Speed</label>
        <select
          :id="rateSelectId"
          class="video-player__speed-select"
          :value="rate"
          :disabled="!hasSource"
          @change="onRateChange"
        >
          <option v-for="value in PLAYBACK_RATES" :key="value" :value="value">{{ value }}×</option>
        </select>
      </div>

      <button
        type="button"
        class="video-player__button"
        :aria-label="captionsOn ? 'Turn captions off' : 'Turn captions on'"
        :aria-pressed="captionsOn"
        :disabled="!hasCaptions"
        :title="hasCaptions ? undefined : 'No captions available for this lesson'"
        @click="toggleCaptions"
      >
        <AppIcon name="closed-captions" :size="18" />
      </button>

      <button
        type="button"
        class="video-player__button"
        :aria-label="isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'"
        :disabled="!hasSource"
        @click="toggleFullscreen"
      >
        <AppIcon :name="isFullscreen ? 'minimize' : 'maximize'" :size="18" />
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/scss/tokens' as *;
@use '@/assets/scss/mixins' as *;

.video-player {
  overflow: hidden;
  background: #000;
  border: 1px solid $color-border;
  border-radius: $radius-lg;

  &__stage {
    position: relative;
    aspect-ratio: 16 / 9;
    background: #000;
  }

  &__media {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  &__poster-fallback {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    width: 100%;
    height: 100%;
    padding: 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    text-align: center;
    color: $color-text-muted;
    background: $color-surface-muted;
  }

  &__demo {
    position: absolute;
    left: 50%;
    top: 0.75rem;
    transform: translateX(-50%);
    padding: 0.3125rem 0.75rem;
    font-size: 0.8125rem;
    font-weight: 600;
    color: #fff;
    background: rgb(0 0 0 / 65%);
    border-radius: 999px;
    white-space: nowrap;
  }

  &__caption {
    position: absolute;
    left: 50%;
    bottom: 1rem;
    width: max-content;
    max-width: 90%;
    transform: translateX(-50%);
    padding: 0.375rem 0.75rem;
    font-size: 0.9375rem;
    line-height: 1.45;
    text-align: center;
    color: #fff;
    background: rgb(0 0 0 / 78%);
    border-radius: $radius-sm;
  }

  &__controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: #0b0b0b;
  }

  &__button {
    display: grid;
    place-items: center;
    flex: none;
    width: 2rem;
    height: 2rem;
    color: #fff;
    background: transparent;
    border: 0;
    border-radius: $radius-sm;
    cursor: pointer;

    &:hover:not(:disabled) {
      background: rgb(255 255 255 / 14%);
    }

    &:disabled {
      color: rgb(255 255 255 / 35%);
      cursor: not-allowed;
    }

    @include focus-ring;
  }

  &__seek {
    flex: 1 1 auto;
    min-width: 4rem;
    accent-color: $color-primary;

    &:disabled {
      opacity: 0.4;
    }

    @include focus-ring;
  }

  &__volume {
    flex: none;
    width: 4.5rem;
    accent-color: $color-primary;

    &:disabled {
      opacity: 0.4;
    }

    @include focus-ring;

    @media (max-width: 640px) {
      display: none;
    }
  }

  &__time {
    flex: none;
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
    color: rgb(255 255 255 / 80%);
  }

  &__speed {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    flex: none;

    @media (max-width: 640px) {
      display: none;
    }
  }

  &__speed-label {
    font-size: 0.75rem;
    color: rgb(255 255 255 / 60%);
  }

  &__speed-select {
    padding: 0.25rem 0.375rem;
    font-size: 0.75rem;
    color: #fff;
    background: rgb(255 255 255 / 10%);
    border: 1px solid rgb(255 255 255 / 22%);
    border-radius: $radius-sm;
    cursor: pointer;

    &:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    @include focus-ring;
  }

  &:fullscreen {
    display: flex;
    flex-direction: column;
    justify-content: center;
    border: 0;
    border-radius: 0;

    .video-player__stage {
      flex: 1 1 auto;
      aspect-ratio: auto;
    }
  }
}
</style>
