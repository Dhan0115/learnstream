<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppIcon from '@/components/AppIcon.vue'
import EmptyState from '@/components/EmptyState.vue'
import SearchBar from '@/components/SearchBar.vue'
import SectionHeader from '@/components/SectionHeader.vue'
import SubjectCard from '@/components/SubjectCard.vue'
import VideoCard from '@/components/VideoCard.vue'
import VideoSkeleton from '@/components/VideoSkeleton.vue'
import { useCatalog } from '@/composables/useCatalog'
import { useSession } from '@/composables/useSession'
import type { Video } from '@/types'
import { formatDuration } from '@/utils/format'

// `.home` page block (design_spec.md §4.1). The two rails are the catalog's
// "most viewed" and "newest" orderings, asked of the API rather than sorted
// from a private copy, so they always match what browse would show.
const { subjects, videoCount, fetchVideos } = useCatalog()
const { canUpload } = useSession()

const popularVideos = ref<Video[]>([])
const recentVideos = ref<Video[]>([])
const pending = ref(true)

const heroLesson = computed(() => recentVideos.value.find(video => video.src && video.thumbnail)
  ?? popularVideos.value.find(video => video.thumbnail))
const heroLevel = computed(() => heroLesson.value?.tags.find(tag => /^(beginner|intermediate|advanced)$/i.test(tag)))
const posterFailed = ref(false)

// Each glyph has a primary outline and a contrasting detail.
const subjectGlyphs: Record<string, readonly [string, string]> = {
  art: ['M20 4C10 3 3 10 3 19s7 15 15 15c4 0 6-2 5-5l-1-3q-1-3 4-3h3q7-1 5-8C32 8 27 4 20 4Z', 'M11 19h1m2-8h1m8-1h1m3 6h1'],
  business: ['M4 34h32M7 30v-7h4v7m6 0V19h4v11m6 0V14h4v16', 'm5 17 9-9 7 5L33 4m-7 0h7v7'],
  history: ['M7 4h26M7 36h26M10 5q0 10 8 15-8 5-8 15m20-30q0 10-8 15 8 5 8 15', 'M14 11h12m-8 4h4m-9 16 7-6 7 6Z'],
  languages: ['M4 15h18v12H12l-6 5v-5H4Zm4 5h9', 'M34 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-16 0h16m-8-8q-6 8 0 16 6-8 0-16Zm-3 32 4-11 4 11m-7-4h6'],
  mathematics: ['M5 5h30v30H5Zm15 0v30M5 20h30', 'M9 12h7m-3.5-3.5v7M24 12h7M9 25l6 6m0-6-6 6m15-5h7m-7 4h7'],
  programming: ['m12 11-9 9 9 9m16-18 9 9-9 9', 'm24 6-8 28'],
  science: ['M7 12c4-6 31 8 26 16S2 19 7 12Zm26 0C29 6 2 20 7 28s31-9 26-16Z', 'M20 3c9 0 9 34 0 34s-9-34 0-34Zm0 17h.1'],
  'test-preparation': ['M13 7H7v29h26V7h-6M11 17l2 2 4-5m-6 12 2 2 4-5', 'M16 5h8v5h-8Zm5 12h7m-7 9h7']
}

onMounted(async () => {
  try {
    const [popular, recent] = await Promise.all([
      fetchVideos({ sort: 'views' }),
      fetchVideos({ sort: 'newest' })
    ])
    popularVideos.value = popular.slice(0, 6)
    recentVideos.value = recent.slice(0, 6)
  } catch {
    // Both rails fall back to their empty state.
  } finally {
    pending.value = false
  }
})
</script>

<template>
  <div class="home">
    <section class="home__hero">
      <div class="home__container">
        <div class="home__hero-layout">
          <div class="home__intro">
            <h1 class="home__headline">
              Learn any subject through clear, engaging video lessons.
            </h1>
            <p class="home__subcopy">
              Discover lessons in maths, science, programming, history, languages and more —
              taught by people who love the subject.
            </p>
            <div class="home__ctas">
              <UButton to="/browse" size="lg" label="Browse Lessons" />
              <RouterLink to="/#featured" class="home__start-learning">Start Learning</RouterLink>
            </div>
            <div class="home__search">
              <SearchBar placeholder="Search videos and topics…" />
            </div>
          </div>
          <div v-if="heroLesson" class="home__visual">
            <article class="home__lesson-card">
              <RouterLink class="home__preview" :to="`/watch/${heroLesson.id}`" :aria-label="`Watch ${heroLesson.title}`">
                <img v-if="!posterFailed" class="home__poster" :src="heroLesson.thumbnail" alt="" @error="posterFailed = true">
                <span v-else class="home__poster-title">{{ heroLesson.title }}</span>
                <span class="home__play"><AppIcon name="play" :size="30" /></span>
              </RouterLink>
              <div class="home__lesson-info">
                <h2 class="home__lesson-title">{{ heroLesson.title }}</h2>
                <p class="home__lesson-description">{{ heroLesson.description }}</p>
                <p class="home__lesson-meta">
                  <AppIcon name="clock" :size="14" />
                  <span>{{ formatDuration(heroLesson.durationSec) }}</span>
                  <template v-if="heroLevel">
                    <span aria-hidden="true">·</span>
                    <span>{{ heroLevel }}</span>
                  </template>
                </p>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section id="subjects" class="home__section home__subject-band">
      <div class="home__container">
      <SectionHeader
        title="Browse by subject"
        subtitle="Pick a subject to see every lesson in it."
        action-label="View all"
        action-to="/browse"
      />

      <ul class="home__subjects">
        <li v-for="subject in subjects" :key="subject.id">
          <SubjectCard :subject="subject" :count="videoCount(subject.slug)">
            <template #icon>
              <svg v-if="subjectGlyphs[subject.slug]" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path :d="subjectGlyphs[subject.slug]?.[0]" />
                <path :d="subjectGlyphs[subject.slug]?.[1]" stroke="var(--ui-success)" />
              </svg>
              <template v-else>{{ subject.icon }}</template>
            </template>
          </SubjectCard>
        </li>
      </ul>
      </div>
    </section>

    <section id="featured" class="home__section home__popular-band">
      <div class="home__container">
        <SectionHeader
          title="Popular lessons"
          subtitle="The lessons learners return to most."
          action-label="See more"
          action-to="/browse?sort=views"
        />

        <ul v-if="pending" class="home__grid home__grid--videos" aria-busy="true" aria-label="Loading popular lessons">
          <li v-for="n in 6" :key="n">
            <VideoSkeleton />
          </li>
        </ul>

        <ul v-else class="home__grid home__grid--videos">
          <li v-for="video in popularVideos" :key="video.id">
            <VideoCard :video="video" />
          </li>
        </ul>
      </div>
    </section>

    <section id="recent" class="home__section home__recent-band">
      <div class="home__container">
        <SectionHeader
          title="Recently uploaded"
          subtitle="Fresh lessons from our teachers."
          action-label="See more"
          action-to="/browse?sort=newest"
        />

        <ul v-if="pending" class="home__grid home__grid--recent" aria-busy="true" aria-label="Loading recent lessons">
          <li v-for="n in 6" :key="n">
            <VideoSkeleton />
          </li>
        </ul>

        <ul v-else-if="recentVideos.length" class="home__grid home__grid--recent">
          <li v-for="video in recentVideos" :key="video.id">
            <VideoCard :video="video" compact />
          </li>
        </ul>

        <EmptyState
          v-else
          icon="upload"
          title="No lessons yet"
          text="Published lessons will appear here."
          :action-label="canUpload ? 'Upload a Video' : undefined"
          :action-to="canUpload ? '/upload' : undefined"
        />
      </div>
    </section>

  </div>
</template>

<style scoped lang="scss">
@use '@/assets/scss/tokens' as *;
@use '@/assets/scss/mixins' as *;

.home {
  &__container {
    width: 100%;
    max-width: 80rem;
    margin: 0 auto;
    padding-inline: 1rem;

    @include up(sm) {
      padding-inline: 1.5rem;
    }

    @include up(lg) {
      padding-inline: 2rem;
    }
  }

  &__hero {
    overflow: clip;
    padding-block: clamp(2rem, 5vw, 4.5rem);
    background:
      radial-gradient(ellipse at bottom left, color-mix(in srgb, rebeccapurple 10%, transparent), transparent 55%),
      linear-gradient(112deg, $color-surface, color-mix(in srgb, $color-primary 12%, $color-surface-muted));
  }

  &__hero-layout {
    position: relative;
    display: grid;
    align-items: center;
    gap: 2.5rem;

    @include up(md) {
      grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
      gap: 2rem;
    }

    @include up(lg) {
      gap: 3rem;
    }
  }

  &__intro {
    position: relative;
    z-index: 1;
  }

  &__visual {
    position: relative;
    isolation: isolate;
    padding: 5% 3%;

    &::before, &::after {
      content: '';
      position: absolute;
      z-index: -1;
      border-radius: $radius-xl;
    }

    &::before {
      inset: 3% 7%;
      transform: rotate(-33deg);
      border: 2px solid color-mix(in srgb, $color-primary 45%, transparent);
    }

    &::after {
      inset: 5% 3%;
      transform: translate(0.75rem, 0.75rem);
      background: linear-gradient(45deg, var(--ui-secondary), $color-primary);
    }
  }

  &__lesson-card {
    overflow: hidden;
    padding: 0.5rem;
    background: $color-surface;
    border-radius: $radius-xl;
    box-shadow: var(--shadow-xl);
  }

  &__preview {
    position: relative;
    display: grid;
    place-items: center;
    overflow: hidden;
    aspect-ratio: 16 / 9;
    background: $color-surface-elevated;
    border-radius: $radius-lg;
    @include focus-ring;
  }

  &__poster {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__poster-title {
    align-self: end;
    padding: 0.75rem;
    font-weight: 600;
    color: $color-text-highlighted;
  }

  &__lesson-info {
    padding: 0.875rem 1rem 1rem;
  }

  &__lesson-title {
    display: -webkit-box;
    overflow: hidden;
    font-size: 1.125rem;
    font-weight: 700;
    line-height: 1.35;
    color: $color-text-highlighted;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  &__lesson-description {
    display: -webkit-box;
    overflow: hidden;
    margin-top: 0.375rem;
    font-size: 0.875rem;
    line-height: 1.5;
    color: $color-text-muted;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  &__lesson-meta {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    margin-top: 0.75rem;
    font-size: 0.8125rem;
    color: $color-text-muted;
  }

  &__play {
    position: absolute;
    display: grid;
    place-items: center;
    width: 3.5rem;
    aspect-ratio: 1;
    border-radius: 50%;
    color: var(--color-white);
    background: color-mix(in srgb, var(--color-black) 70%, transparent);

    :deep(svg) {
      fill: currentColor;
    }
  }

  &__headline {
    max-width: 46rem;
    font-size: 1.875rem;
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -0.02em;
    color: $color-text-highlighted;

    @include up(md) {
      font-size: 2.75rem;
    }

    @include up(lg) {
      font-size: 3.25rem;
    }
  }

  &__subcopy {
    max-width: 40rem;
    margin-top: 1rem;
    font-size: 1rem;
    line-height: 1.65;
    color: $color-text-muted;

    @include up(md) {
      font-size: 1.125rem;
    }
  }

  &__ctas {
    display: flex;
    flex-wrap: wrap;
    gap: 0.625rem;
    margin-top: 1.75rem;
  }

  &__start-learning {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: $color-text;
    text-decoration: none;
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    transition: border-color 150ms ease;

    &:hover {
      border-color: $color-primary;
      color: $color-primary;
    }

    @include focus-ring;
  }

  &__search {
    max-width: 40rem;
    margin-top: 1.75rem;
  }

  &__section {
    padding-block: 2.5rem;

    @include up(md) {
      padding-block: 4rem;
    }
  }

  &__recent-band::after {
    content: '';
    display: block;
    height: 3rem;
  }

  &__subject-band {
    position: relative;
    isolation: isolate;
    overflow: clip;

    :deep(.section-header__title) { font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 700; }
  }

  &__subjects {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 1rem;
    list-style: none;

    @include up(sm) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @include up(lg) {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    :deep(.subject-card) {
      position: relative;
      align-items: stretch;
      min-height: 9.5rem;
      box-shadow: var(--shadow-md);
    }

    :deep(.subject-card:is(:hover, :focus-visible)) {
      border-color: $color-primary;
      transform: translateY(-2px);
      box-shadow: 0.4rem 0.4rem 0 color-mix(in srgb, $color-primary, var(--ui-success));
    }

    :deep(.subject-card__icon) { background: transparent; width: 2.5rem; height: 2.5rem; }
    :deep(.subject-card__title) { line-height: 1.25; }
    :deep(.subject-card__tagline) { -webkit-line-clamp: 3; }
    :deep(.subject-card__count) { margin-top: 0.5rem; padding-top: 1rem; padding-right: 1rem; color: $color-text-highlighted; }
  }

  &__grid {
    display: grid;
    gap: 1.5rem 1rem;
    list-style: none;

    &--videos {
      grid-template-columns: minmax(0, 1fr);

      @include up(sm) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      @include up(lg) {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }

    &--recent {
      grid-template-columns: minmax(0, 1fr);

      @include up(md) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
  }

}
:global(.app-main:has(> .home) + .app-footer) {
  margin-top: 0;
}
</style>
