<script setup lang="ts">
import { computed, onMounted, ref, useId, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import FilterSelect from '@/components/FilterSelect.vue'
import EmptyState from '@/components/EmptyState.vue'
import PageHeading from '@/components/PageHeading.vue'
import VideoCard from '@/components/VideoCard.vue'
import VideoSkeleton from '@/components/VideoSkeleton.vue'
import { useCatalog } from '@/composables/useCatalog'
import { setPageMeta } from '@/composables/usePageMeta'
import { messageFor } from '@/utils/api'
import type { DateRangeKey, SortKey, Video } from '@/types'

const PAGE_SIZE = 12

const route = useRoute()
const { subjects, fetchVideos, subjectBySlug } = useCatalog()

const subjectSelectId = useId()
const sortSelectId = useId()
const rangeSelectId = useId()

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'views', label: 'Most viewed' },
  { value: 'likes', label: 'Most liked' },
  { value: 'rated', label: 'Top rated' }
]

const RANGE_OPTIONS: { value: DateRangeKey; label: string }[] = [
  { value: 'any', label: 'Any time' },
  { value: 'week', label: 'Past week' },
  { value: 'month', label: 'Past month' },
  { value: 'year', label: 'Past year' }
]

function readSingle(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

const subjectSlug = ref(readSingle(route.params.slug))
const subjectOptions = computed(() => [
  { label: 'All subjects', value: '__all__' },
  ...subjects.value.map(subject => ({ label: subject.name, value: subject.slug }))
])
const subjectFilter = computed({
  get: () => subjectSlug.value || '__all__',
  set: (value: string) => { subjectSlug.value = value === '__all__' ? '' : value }
})
const searchTerm = ref(readSingle(route.query.q))
const sort = ref<SortKey>(
  SORT_OPTIONS.some(option => option.value === route.query.sort)
    ? (route.query.sort as SortKey)
    : 'newest'
)
const range = ref<DateRangeKey>(
  RANGE_OPTIONS.some(option => option.value === route.query.range)
    ? (route.query.range as DateRangeKey)
    : 'any'
)
const page = ref(1)

watch(
  () => [route.params.slug, route.query.q, route.query.sort, route.query.range],
  () => {
    subjectSlug.value = readSingle(route.params.slug)
    searchTerm.value = readSingle(route.query.q)
    sort.value = SORT_OPTIONS.some(option => option.value === route.query.sort)
      ? (route.query.sort as SortKey)
      : 'newest'
    range.value = RANGE_OPTIONS.some(option => option.value === route.query.range)
      ? (route.query.range as DateRangeKey)
      : 'any'
  }
)

const activeSubject = computed(() => subjectBySlug(subjectSlug.value))
const hasBrowseFilters = computed(() => route.name === 'browse' || route.name === 'subject')

// Search, filtering and ordering all happen on the server (design_spec.md §8.8),
// so the results below are exactly what the catalog holds right now.
const results = ref<Video[]>([])
const pending = ref(true)
const errorMessage = ref('')
let requestId = 0

async function load() {
  const id = ++requestId
  pending.value = true
  errorMessage.value = ''

  try {
    const videos = await fetchVideos({
      subjectSlug: subjectSlug.value || undefined,
      search: searchTerm.value,
      sort: sort.value,
      range: range.value
    })
    if (id === requestId) results.value = videos
  } catch (error) {
    if (id !== requestId) return
    results.value = []
    errorMessage.value = messageFor(error)
  } finally {
    if (id === requestId) pending.value = false
  }
}

onMounted(load)

// Any change to a filter re-queries the server. The route watcher above writes
// the same refs, so a link to `/search?q=…` loads the right list too.
watch([subjectSlug, searchTerm, sort, range], (current, previous, onCleanup) => {
  if (hasBrowseFilters.value && current[1] !== previous[1]) {
    const timer = setTimeout(load, 250)
    onCleanup(() => clearTimeout(timer))
  } else {
    load()
  }
})

const totalPages = computed(() => Math.max(1, Math.ceil(results.value.length / PAGE_SIZE)))
const visible = computed(() =>
  results.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE)
)

watch(results, () => {
  page.value = 1
})

watch([page, totalPages], () => {
  if (page.value > totalPages.value) page.value = totalPages.value
})

const heading = computed(() => {
  if (route.name === 'browse') return 'Browse all lessons'
  if (!hasBrowseFilters.value && searchTerm.value) return `Results for “${searchTerm.value}”`
  if (activeSubject.value) return activeSubject.value.name
  return 'Browse all lessons'
})

const subtitle = computed(() => {
  if (!hasBrowseFilters.value && searchTerm.value) return 'Matching lesson titles, descriptions, subjects and tags.'
  if (activeSubject.value) return activeSubject.value.tagline
  return 'Every published lesson, across all eight subjects.'
})

// Browse, search and subject all render this view, so the title and description
// follow whatever the filters currently say (design_spec.md §4.8).
const metaDescription = computed(() => {
  const count = results.value.length
  const lessons = `${count} ${count === 1 ? 'lesson' : 'lessons'}`

  if (searchTerm.value) {
    return `${lessons} matching “${searchTerm.value}” on LearnStream, from every subject in the catalog.`
  }
  if (activeSubject.value) {
    return `${lessons} in ${activeSubject.value.name} on LearnStream. ${activeSubject.value.tagline}`
  }
  return `${lessons} across every subject on LearnStream — filter by subject, upload date, popularity or rating.`
})

watchEffect(() => {
  setPageMeta(heading.value, metaDescription.value)
})

function goToPage(next: number) {
  page.value = Math.min(Math.max(1, next), totalPages.value)
  if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="browse" :class="{ 'browse--subject': route.name === 'subject' }">
    <div class="browse__container">
      <PageHeading :class="{ 'browse__heading--all': hasBrowseFilters }" :title="heading" :subtitle="subtitle" :count="results.length" />

      <div class="browse__filters" :class="{ 'browse__filters--all': hasBrowseFilters, 'browse__filters--subject': route.name === 'subject' }">
        <div v-if="hasBrowseFilters" class="browse__search" role="search">
          <AppIcon name="search" :size="18" class="browse__search-icon" aria-hidden="true" />
          <input
            v-model="searchTerm"
            class="browse__search-input"
            type="search"
            aria-label="Search lessons"
            placeholder="Search lessons..."
          />
        </div>
        <div v-if="route.name !== 'subject'" class="browse__field">
          <label class="browse__label" :for="subjectSelectId">Subject</label>
          <FilterSelect :id="subjectSelectId" v-model="subjectFilter" :items="subjectOptions" class="browse__select" />
        </div>

        <div class="browse__field">
          <label class="browse__label" :for="rangeSelectId">Uploaded</label>
          <FilterSelect :id="rangeSelectId" v-model="range" :items="RANGE_OPTIONS" class="browse__select" />
        </div>

        <div class="browse__field">
          <label class="browse__label" :for="sortSelectId">Sort by</label>
          <FilterSelect :id="sortSelectId" v-model="sort" :items="SORT_OPTIONS" class="browse__select" />
        </div>
      </div>

      <ul v-if="pending" class="browse__grid" aria-busy="true" aria-label="Loading lessons">
        <li v-for="n in 8" :key="n">
          <VideoSkeleton />
        </li>
      </ul>

      <ul v-else-if="visible.length" class="browse__grid">
        <li v-for="video in visible" :key="video.id">
          <VideoCard :video="video" />
        </li>
      </ul>

      <p v-else-if="errorMessage" class="browse__error" role="alert">{{ errorMessage }}</p>

      <EmptyState
        v-else
        :title="searchTerm ? 'No lessons matched your search' : 'No lessons here yet'"
        :text="searchTerm
          ? 'Try a different keyword, or browse a subject instead.'
          : 'No lesson matches these filters yet. Widen the upload date, or explore another subject.'"
        action-label="Browse all lessons"
        action-to="/browse"
      />

      <nav v-if="!pending && totalPages > 1" class="browse__pagination" aria-label="Pagination">
        <button
          type="button"
          class="browse__page-button"
          :disabled="page === 1"
          @click="goToPage(page - 1)"
        >
          Previous
        </button>
        <p class="browse__page-status">Page {{ page }} of {{ totalPages }}</p>
        <button
          type="button"
          class="browse__page-button"
          :disabled="page === totalPages"
          @click="goToPage(page + 1)"
        >
          Next
        </button>
      </nav>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/scss/tokens' as *;
@use '@/assets/scss/mixins' as *;

.browse {
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

  &__filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 1.75rem;
    padding-bottom: 1.75rem;
    border-bottom: 1px solid $color-border;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 12rem;
  }

  &__label {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: $color-text-muted;
  }

  &__select {
    padding: 0.5rem 0.625rem;
    font-size: 0.875rem;
    color: $color-text;
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    cursor: pointer;

    @include focus-ring;
  }

  &__filters--all {
    --select-inset: 0.625rem;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-items: end;
    gap: 0.875rem;

    @include up(sm) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @include up(md) {
      grid-template-columns: minmax(0, 1.4fr) repeat(3, minmax(0, 1fr));
    }

    .browse__field {
      min-width: 0;
      display: grid;
      grid-template-columns: minmax(0, 1fr);
    }

    .browse__select {
      height: 2.75rem;
      font-size: 1rem;
      grid-area: 2 / 1;
      padding-inline: var(--select-inset) calc(2 * var(--select-inset) + 0.5rem);
    }
  }

  &__filters--subject {
    @include up(sm) {
      .browse__search { grid-column: 1 / -1; }
    }

    @include up(md) {
      grid-template-columns: minmax(0, 1.4fr) repeat(2, minmax(0, 1fr));
      .browse__search { grid-column: auto; }
    }
  }

  &__heading--all {
    margin-bottom: 1rem;

    :deep(.page-heading__count) {
      display: inline-block;
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
      background: color-mix(in srgb, $color-primary 12%, $color-surface);
      color: $color-text;
    }
  }

  &__search {
    position: relative;
  }

  &__search-icon {
    position: absolute;
    inset-inline-start: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: $color-text-muted;
    pointer-events: none;
  }

  &__search-input {
    width: 100%;
    height: 2.75rem;
    padding-inline: 2.5rem 0.75rem;
    font-size: 1rem;
    color: $color-text;
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-md;

    @include focus-ring;
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

  &__pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-top: 2.5rem;
  }

  &__page-button {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: $color-text;
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    cursor: pointer;
    transition: border-color 150ms ease;

    &:hover:not(:disabled) {
      border-color: $color-primary;
      color: $color-primary;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    @include focus-ring;
  }

  &__page-status {
    font-size: 0.875rem;
    color: $color-text-muted;
  }
}
</style>
