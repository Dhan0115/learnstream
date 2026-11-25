<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import AppIcon from '@/components/AppIcon.vue'
import Dropzone from '@/components/Dropzone.vue'
import EmptyState from '@/components/EmptyState.vue'
import PageHeading from '@/components/PageHeading.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import { useCatalog } from '@/composables/useCatalog'
import { useSession } from '@/composables/useSession'
import { apiFormProgress, messageFor } from '@/utils/api'
import type { Video } from '@/types'
import { formatDuration } from '@/utils/format'

// `.upload` page block (design_spec.md §4.4). The flow is guided: file →
// details → preview → publish. The video is streamed to `/api/videos`, which
// validates it, stores the file, and only then makes the lesson visible.
const { subjects, subjectName } = useCatalog()
const { canUpload } = useSession()

const ACCEPTED_VIDEO = '.mp4,.webm,video/mp4,video/webm'
const ACCEPTED_IMAGE = 'image/png,image/jpeg,image/webp'
const ACCEPTED_TRANSCRIPT = '.vtt,.srt'
const VALID_VIDEO_TYPES = ['video/mp4', 'video/webm']
const MAX_TAGS = 8

/** A chapter line the server will accept: a time, then the section title. */
const CHAPTER_LINE = /^\d{1,2}:\d{2}(?::\d{2})?\s*[-–—:.)]?\s+\S/

const titleId = useId()
const descriptionId = useId()
const subjectId = useId()
const tagsId = useId()
const chaptersId = useId()

const title = ref('')
const description = ref('')
const subjectSlug = ref('')
const tagsInput = ref('')
const chaptersInput = ref('')

const file = ref<File | null>(null)
const fileError = ref('')
const videoUrl = ref('')
const durationSec = ref(0)

const thumbnailFile = ref<File | null>(null)
const thumbnailError = ref('')
const thumbnailUrl = ref('')

const transcriptFile = ref<File | null>(null)
const transcriptError = ref('')

const submitted = ref(false)
const status = ref<'idle' | 'uploading' | 'success' | 'error'>('idle')
const statusMessage = ref('')
const publishedId = ref('')
/** Bytes sent, 0–100, while `status` is `uploading`. */
const progress = ref(0)

const tags = computed(() =>
  Array.from(
    new Set(
      tagsInput.value
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(Boolean)
    )
  ).slice(0, MAX_TAGS)
)

const label = computed(() => subjectSlug.value ? subjectName(subjectSlug.value) : 'No subject')

// The rules mirror the server's own schema, so a title or description that
// passes here is not rejected after the file has been uploaded (AGENTS.md §2.3).
const titleError = computed(() => {
  if (!submitted.value) return ''
  const value = title.value.trim()
  if (!value) return 'A title is required.'
  if (value.length < 3) return 'Use at least 3 characters for the title.'
  return ''
})

const descriptionError = computed(() => {
  if (!submitted.value) return ''
  const value = description.value.trim()
  if (!value) return 'Describe what the viewer will learn.'
  if (value.length < 10) return 'Add at least 10 characters to the description.'
  return ''
})

const subjectError = computed(() =>
  submitted.value && !subjectSlug.value ? 'Choose a subject for your lesson.' : ''
)

// Chapters are optional, but text that reads as chapters and matches none of
// them is a mistake the server would reject after the video was sent.
const chaptersError = computed(() => {
  if (!submitted.value) return ''
  const text = chaptersInput.value.trim()
  if (!text) return ''
  const readable = text.split('\n').some(line => CHAPTER_LINE.test(line.trim()))
  return readable ? '' : 'Each chapter needs a time and a title, like “0:00 Introduction”.'
})

const dropError = computed(() =>
  fileError.value || (submitted.value && !file.value ? 'Choose an MP4 or WebM video to upload.' : '')
)

const formValid = computed(() =>
  Boolean(file.value) &&
  title.value.trim().length >= 3 &&
  description.value.trim().length >= 10 &&
  Boolean(subjectSlug.value) &&
  !chaptersError.value
)

/** 16:9 poster generated from the title when no image is supplied. */
const autoThumbnail = computed(() => {
  const text = title.value.trim() || 'an online video lesson'
  return `https://coresg-normal.trae.ai/api/ide/v1/tool_text_to_image?prompt=${encodeURIComponent(
    `photorealistic still representing the lesson "${text}", clean uncluttered composition, soft natural light, no readable text`
  )}&image_size=landscape_16_9`
})

const previewThumbnail = computed(() => thumbnailUrl.value || autoThumbnail.value)
const showPreview = computed(() => Boolean(file.value) || Boolean(title.value.trim()))

// Fallback shown when the generated thumbnail cannot be loaded.
const previewFailed = ref(false)
const previewMonogram = computed(() => (subjectSlug.value ? subjectName(subjectSlug.value) : 'L').slice(0, 1).toUpperCase())

watch(previewThumbnail, () => {
  previewFailed.value = false
})

function isAllowedVideo(next: File): boolean {
  if (VALID_VIDEO_TYPES.includes(next.type)) return true
  return /\.(mp4|webm)$/i.test(next.name)
}

function readDuration(url: string) {
  const probe = document.createElement('video')
  probe.preload = 'metadata'
  probe.addEventListener('loadedmetadata', () => {
    if (Number.isFinite(probe.duration)) durationSec.value = Math.round(probe.duration)
    probe.removeAttribute('src')
  })
  probe.addEventListener('error', () => {
    durationSec.value = 0
  })
  probe.src = url
}

// The blob URL is only for reading the duration and showing the preview; the
// file itself is what is sent to the server.
function onSelectVideo(next: File) {
  if (!isAllowedVideo(next)) {
    fileError.value = 'That file type is not supported. Upload an MP4 or WebM video.'
    file.value = null
    videoUrl.value = ''
    return
  }

  fileError.value = ''
  file.value = next
  videoUrl.value = URL.createObjectURL(next)
  readDuration(videoUrl.value)
}

function onSelectThumbnail(next: File) {
  if (!next.type.startsWith('image/')) {
    thumbnailError.value = 'Your thumbnail must be a PNG, JPG or WebP image.'
    thumbnailFile.value = null
    thumbnailUrl.value = ''
    return
  }

  thumbnailError.value = ''
  thumbnailFile.value = next
  thumbnailUrl.value = URL.createObjectURL(next)
}

function onSelectTranscript(next: File) {
  if (!/\.(vtt|srt)$/i.test(next.name)) {
    transcriptError.value = 'Your caption file must be WebVTT (.vtt) or SubRip (.srt).'
    transcriptFile.value = null
    return
  }

  transcriptError.value = ''
  transcriptFile.value = next
}

async function submit() {
  submitted.value = true

  if (!formValid.value) {
    status.value = 'error'
    statusMessage.value = 'Fix the highlighted fields, then publish your lesson.'
    return
  }

  const payload = file.value
  if (!payload) return

  status.value = 'uploading'
  progress.value = 0
  statusMessage.value = 'Uploading your video…'

  const form = new FormData()
  form.append('title', title.value.trim())
  form.append('description', description.value.trim())
  form.append('subject', subjectSlug.value)
  form.append('tags', tags.value.join(','))
  form.append('chapters', chaptersInput.value.trim())
  // Measured from the chosen file by `readDuration()`; the server validates it.
  form.append('durationSec', String(durationSec.value))
  form.append('file', payload)
  if (thumbnailFile.value) form.append('thumbnail', thumbnailFile.value)
  if (transcriptFile.value) form.append('transcript', transcriptFile.value)

  try {
    const { video } = await apiFormProgress<{ video: Video }>('/api/videos', form, (percent) => {
      progress.value = percent
    })
    publishedId.value = video.id
    status.value = 'success'
    statusMessage.value = 'Your lesson is live. It now appears in your dashboard, in browse and in search.'
  } catch (error) {
    // A rejected file type, an oversized video or a permission problem all
    // arrive here as the sentence the server sent back.
    status.value = 'error'
    statusMessage.value = messageFor(error)
  }
}
</script>

<template>
  <div class="upload">
    <div class="upload__container">
      <PageHeading
        title="Upload a lesson"
        subtitle="Share a video, describe what learners will gain, and tag it with a subject."
      />

      <EmptyState
        v-if="!canUpload"
        icon="lock"
        title="Only administrators can upload videos"
        text="Explore the published lessons in the catalog."
        action-label="Browse all lessons"
        action-to="/browse"
      />

      <form v-else class="upload__form" novalidate @submit.prevent="submit">
        <section class="upload__step">
          <h2 class="upload__step-title">1. Choose your video</h2>
          <Dropzone
            :accept="ACCEPTED_VIDEO"
            label="Drag and drop your video here, or browse files"
            hint="MP4 or WebM. Other formats are rejected before the upload starts."
            :error="dropError"
            :file="file"
            @select="onSelectVideo"
          />
        </section>

        <section class="upload__step">
          <h2 class="upload__step-title">2. Lesson details</h2>

          <div class="upload__fields">
            <div class="upload__field">
              <label class="upload__label" :for="titleId">Title</label>
              <input
                :id="titleId"
                v-model="title"
                class="upload__input"
                type="text"
                placeholder="e.g. Calculus I — Limits and Continuity"
                :aria-invalid="Boolean(titleError)"
                :aria-describedby="titleError ? `${titleId}-error` : undefined"
              >
              <p v-if="titleError" :id="`${titleId}-error`" class="upload__error">{{ titleError }}</p>
            </div>

            <div class="upload__field">
              <label class="upload__label" :for="descriptionId">Description</label>
              <textarea
                :id="descriptionId"
                v-model="description"
                class="upload__textarea"
                rows="5"
                placeholder="Explain what the viewer will learn, and what they should already know."
                :aria-invalid="Boolean(descriptionError)"
                :aria-describedby="descriptionError ? `${descriptionId}-error` : undefined"
              />
              <p v-if="descriptionError" :id="`${descriptionId}-error`" class="upload__error">
                {{ descriptionError }}
              </p>
            </div>

            <div class="upload__row">
              <div class="upload__field">
                <label class="upload__label" :for="subjectId">Subject</label>
                <select
                  :id="subjectId"
                  v-model="subjectSlug"
                  class="upload__select"
                  :aria-invalid="Boolean(subjectError)"
                  :aria-describedby="subjectError ? `${subjectId}-error` : undefined"
                >
                  <option value="">Choose a subject</option>
                  <option v-for="subject in subjects" :key="subject.id" :value="subject.slug">
                    {{ subject.name }}
                  </option>
                </select>
                <p v-if="subjectError" :id="`${subjectId}-error`" class="upload__error">{{ subjectError }}</p>
              </div>

              <div class="upload__field">
                <label class="upload__label" :for="tagsId">Tags (optional)</label>
                <input
                  :id="tagsId"
                  v-model="tagsInput"
                  class="upload__input"
                  type="text"
                  placeholder="calculus, limits, continuity"
                >
              </div>
            </div>

            <div class="upload__field">
              <span class="upload__label">Thumbnail (optional)</span>
              <Dropzone
                compact
                :accept="ACCEPTED_IMAGE"
                label="Choose a thumbnail image"
                hint="PNG or JPG, 16:9 recommended. Leave empty and one is generated for you."
                :error="thumbnailError"
                :file="thumbnailFile"
                @select="onSelectThumbnail"
              />
            </div>

            <div class="upload__row">
              <div class="upload__field">
                <label class="upload__label" :for="chaptersId">Chapters (optional)</label>
                <textarea
                  :id="chaptersId"
                  v-model="chaptersInput"
                  class="upload__textarea"
                  rows="4"
                  placeholder="0:00 Introduction&#10;2:30 Worked example"
                  :aria-invalid="Boolean(chaptersError)"
                  :aria-describedby="`${chaptersId}-hint${chaptersError ? ` ${chaptersId}-error` : ''}`"
                />
                <p :id="`${chaptersId}-hint`" class="upload__hint">
                  One section per line: a time, then its title.
                </p>
                <p v-if="chaptersError" :id="`${chaptersId}-error`" class="upload__error">
                  {{ chaptersError }}
                </p>
              </div>

              <div class="upload__field">
                <span class="upload__label">Captions (optional)</span>
                <Dropzone
                  compact
                  :accept="ACCEPTED_TRANSCRIPT"
                  label="Upload a caption file"
                  hint="WebVTT (.vtt) or SubRip (.srt). Shown beside the player as a transcript."
                  :error="transcriptError"
                  :file="transcriptFile"
                  @select="onSelectTranscript"
                />
              </div>
            </div>
          </div>
        </section>

        <section v-if="showPreview" class="upload__preview">
          <h2 class="upload__step-title">3. Preview</h2>

          <div class="upload__preview-card">
            <img
              v-if="!previewFailed"
              class="upload__preview-thumb"
              :src="previewThumbnail"
              :alt="`Thumbnail preview for ${title || 'your lesson'}`"
              width="640"
              height="360"
              @error="previewFailed = true"
            >
            <span v-else class="upload__preview-fallback" aria-hidden="true">{{ previewMonogram }}</span>

            <div class="upload__preview-body">
              <p class="upload__preview-title">{{ title || 'Your lesson title' }}</p>
              <p class="upload__preview-meta">
                {{ label }} · {{ formatDuration(durationSec) }}
              </p>
              <p class="upload__preview-text">
                {{ description || 'Your description will appear here.' }}
              </p>

              <ul v-if="tags.length" class="upload__preview-tags">
                <li v-for="tag in tags" :key="tag" class="upload__preview-tag">#{{ tag }}</li>
              </ul>
            </div>
          </div>
        </section>

        <ProgressBar
          v-if="status === 'uploading'"
          class="upload__progress"
          :value="progress"
          label="Upload progress"
        />

        <p
          v-if="statusMessage"
          class="upload__status"
          :class="{
            'is-uploading': status === 'uploading',
            'is-success': status === 'success',
            'has-error': status === 'error'
          }"
          role="status"
        >
          <AppIcon :name="status === 'success' ? 'check' : status === 'error' ? 'alert' : 'upload'" :size="16" />
          <span>{{ statusMessage }}</span>
        </p>

        <div class="upload__actions">
          <UButton
            type="submit"
            size="lg"
            label="Publish lesson"
            :loading="status === 'uploading'"
            :disabled="status === 'uploading'"
          />
          <UButton
            v-if="publishedId"
            :to="`/watch/${publishedId}`"
            size="lg"
            variant="outline"
            color="neutral"
            label="View lesson"
          />
          <UButton
            to="/dashboard?tab=mine"
            size="lg"
            variant="ghost"
            color="neutral"
            label="Go to dashboard"
          />
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/scss/tokens' as *;
@use '@/assets/scss/mixins' as *;

.upload {
  &__container {
    width: 100%;
    max-width: 80rem;
    margin: 0 auto;
    padding: 2.5rem 1rem 0;

    @include up(sm) {
      padding-inline: 1.5rem;
    }

    @include up(lg) {
      padding-inline: 2rem;
    }

    @include up(md) {
      padding-top: 3.5rem;
    }
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    max-width: 52rem;
  }

  &__step {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  &__step-title {
    font-size: 1.0625rem;
    font-weight: 700;
    color: $color-text-highlighted;
  }

  &__fields {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  &__row {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 1.25rem;

    @include up(md) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    min-width: 0;
  }

  &__label {
    font-size: 0.8125rem;
    font-weight: 600;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    color: $color-text-muted;
  }

  &__input,
  &__textarea,
  &__select {
    width: 100%;
    padding: 0.625rem 0.75rem;
    font-size: 0.9375rem;
    font-family: inherit;
    line-height: 1.5;
    color: $color-text;
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-md;

    &::placeholder {
      color: $color-text-muted;
    }

    &:hover {
      border-color: $color-primary;
    }

    &[aria-invalid='true'] {
      border-color: $color-error;
    }

    @include focus-ring;
  }

  &__textarea {
    resize: vertical;
    min-height: 7rem;
  }

  &__select {
    cursor: pointer;
  }

  &__error {
    font-size: 0.8125rem;
    font-weight: 600;
    color: $color-error;
  }

  &__hint {
    font-size: 0.75rem;
    line-height: 1.5;
    color: $color-text-muted;
  }

  &__preview {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  &__preview-card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    background: $color-surface-muted;
    border: 1px dashed $color-border;
    border-radius: $radius-lg;

    @include up(md) {
      flex-direction: row;
    }
  }

  &__preview-thumb {
    flex: none;
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-md;

    @include up(md) {
      width: 16rem;
    }
  }

  &__preview-fallback {
    display: grid;
    place-items: center;
    flex: none;
    width: 100%;
    aspect-ratio: 16 / 9;
    font-size: 2.25rem;
    font-weight: 800;
    color: $color-primary;
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-md;

    @include up(md) {
      width: 16rem;
    }
  }

  &__preview-body {
    min-width: 0;
  }

  &__preview-title {
    font-size: 1.0625rem;
    font-weight: 700;
    line-height: 1.3;
    color: $color-text-highlighted;
  }

  &__preview-meta {
    margin-top: 0.25rem;
    font-size: 0.8125rem;
    color: $color-text-muted;
  }

  &__preview-text {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    line-height: 1.6;
    color: $color-text;
    @include truncate(4);
  }

  &__preview-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    margin-top: 0.75rem;
    list-style: none;
  }

  &__preview-tag {
    padding: 0.125rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: $color-primary;
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: 999px;
  }

  &__progress {
    margin-top: 0.25rem;
  }

  &__status {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    font-weight: 600;
    line-height: 1.5;
    border: 1px solid $color-border;
    border-radius: $radius-md;

    &.is-uploading {
      color: $color-text;
      background: $color-surface-muted;
    }

    &.is-success {
      color: $color-success;
      background: $color-surface-muted;
      border-color: $color-success;
    }

    &.has-error {
      color: $color-error;
      background: $color-surface-muted;
      border-color: $color-error;
    }
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.625rem;
  }
}
</style>
