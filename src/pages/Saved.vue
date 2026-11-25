<script setup lang="ts">
import { onMounted, ref } from 'vue'
import EmptyState from '@/components/EmptyState.vue'
import PageHeading from '@/components/PageHeading.vue'
import VideoCard from '@/components/VideoCard.vue'
import VideoSkeleton from '@/components/VideoSkeleton.vue'
import { useCatalog } from '@/composables/useCatalog'
import { useLibrary } from '@/composables/useLibrary'
import type { Video } from '@/types'
import { formatRelativeDate } from '@/utils/format'

// `.saved` page block (design_spec.md §4.6) — the learner's own library. Each
// card carries the lesson's subject badge and the date it was saved.
const { fetchVideo } = useCatalog()
const { saved } = useLibrary()

interface SavedItem {
  video: Video
  savedAt: string
}

const items = ref<SavedItem[]>([])
const pending = ref(true)
const errorMessage = ref('')

onMounted(async () => {
  // The saved list carries ids, so each lesson is fetched for its card. One that
  // no longer resolves (removed, or still processing) is left off the shelf.
  const entries = saved.value
  const loaded = await Promise.all(
    entries.map(async entry => {
      try {
        return { video: await fetchVideo(entry.videoId), savedAt: entry.savedAt }
      } catch {
        return null
      }
    })
  )

  items.value = loaded.filter((item): item is SavedItem => item !== null)

  // Everything failing at once means the server, not the library, is the problem.
  if (entries.length > 0 && items.value.length === 0) {
    errorMessage.value = 'We could not load your saved lessons. Check your connection and try again.'
  }

  pending.value = false
})
</script>

<template>
  <div class="saved">
    <div class="saved__container">
      <PageHeading
        title="Saved videos"
        subtitle="Lessons you kept for later study."
        :count="items.length"
      />

      <ul v-if="pending" class="saved__grid" aria-busy="true" aria-label="Loading saved videos">
        <li v-for="n in 4" :key="n">
          <VideoSkeleton />
        </li>
      </ul>

      <p v-else-if="errorMessage" class="saved__error" role="alert">{{ errorMessage }}</p>

      <ul v-else-if="items.length" class="saved__grid">
        <li v-for="item in items" :key="item.video.id">
          <VideoCard :video="item.video" :note="`Saved ${formatRelativeDate(item.savedAt)}`" />
        </li>
      </ul>

      <EmptyState
        v-else
        icon="bookmark"
        title="No saved lessons yet"
        text="Use the Save button on any lesson and it will be waiting here for you later."
        action-label="Browse all lessons"
        action-to="/browse"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/scss/tokens' as *;
@use '@/assets/scss/mixins' as *;

.saved {
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

  &__error {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: $color-error;
    background: $color-surface-muted;
    border: 1px solid $color-error;
    border-radius: $radius-md;
  }

  &__grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 1.5rem 1rem;
    list-style: none;

    @include up(sm) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @include up(lg) {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    @include up(xl) {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }
}
</style>
