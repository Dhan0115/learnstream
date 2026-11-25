<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { computed } from 'vue'
import { useSession } from '@/composables/useSession'

const { canUpload } = useSession()
const columns = computed(() => [
  {
    title: 'Learn',
    links: [
      { label: 'Browse subjects', to: '/browse' },
      { label: 'Popular lessons', to: '/#featured' },
      { label: 'Recently uploaded', to: '/#recent' }
    ]
  },
  {
    title: 'Teach',
    links: [
      ...(canUpload.value ? [{ label: 'Upload a video', to: '/upload' }] : []),
      { label: 'Your dashboard', to: '/dashboard' },
      { label: 'Saved lessons', to: '/dashboard?tab=saved' }
    ]
  },
  {
    title: 'Subjects',
    links: [
      { label: 'Mathematics', to: '/subjects/mathematics' },
      { label: 'Programming', to: '/subjects/programming' },
      { label: 'Science', to: '/subjects/science' }
    ]
  }
])

</script>

<template>
  <footer class="app-footer">
    <div class="app-footer__inner">
      <div class="app-footer__brand">
        <RouterLink class="app-footer__logo" to="/" aria-label="LearnStream home">
          <span class="app-footer__mark" aria-hidden="true">LS</span>
          <span class="app-footer__wordmark">LearnStream</span>
        </RouterLink>
        <p class="app-footer__tagline">
          Learn any subject through clear, engaging video lessons — built for students,
          self-learners and teachers.
        </p>
      </div>

      <nav class="app-footer__columns" aria-label="Footer">
        <div v-for="column in columns" :key="column.title" class="app-footer__column">
          <h2 class="app-footer__column-title">{{ column.title }}</h2>
          <ul class="app-footer__list">
            <li v-for="link in column.links" :key="link.label">
              <RouterLink class="app-footer__link" :to="link.to">{{ link.label }}</RouterLink>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  </footer>
</template>

<style scoped lang="scss">
@use '@/assets/scss/tokens' as *;
@use '@/assets/scss/mixins' as *;

.app-footer {
  margin-top: 3rem;
  background:
    radial-gradient(ellipse at bottom left, color-mix(in srgb, rebeccapurple 10%, transparent), transparent 55%),
    linear-gradient(112deg, $color-surface, color-mix(in srgb, $color-primary 12%, $color-surface-muted));
  border-top: 1px solid $color-border;

  &__inner {
    display: grid;
    gap: 2rem;
    width: 100%;
    max-width: 80rem;
    margin: 0 auto;
    padding: 3rem 1rem;

    @include up(sm) {
      padding-inline: 1.5rem;
    }

    @include up(lg) {
      grid-template-columns: minmax(0, 1.4fr) minmax(0, 2fr);
      padding-inline: 2rem;
      padding-block: 4rem;
    }
  }

  &__brand {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-width: 30rem;
  }

  &__logo {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    border-radius: $radius-sm;

    @include focus-ring;
  }

  &__mark {
    display: grid;
    place-items: center;
    width: 2rem;
    height: 2rem;
    font-size: 0.75rem;
    font-weight: 800;
    color: var(--ui-bg);
    background: $color-primary;
    border-radius: $radius-md;
  }

  &__wordmark {
    font-size: 1.0625rem;
    font-weight: 700;
    color: $color-text-highlighted;
  }

  &__tagline {
    font-size: 0.9375rem;
    line-height: 1.6;
    color: $color-text-muted;
  }

  &__columns {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.5rem 1rem;

    @include up(sm) {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  &__column-title {
    margin-bottom: 0.75rem;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: $color-text-highlighted;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    list-style: none;
  }

  &__link {
    font-size: 0.9375rem;
    color: $color-text-muted;
    text-decoration: none;
    border-radius: $radius-sm;

    &:hover {
      color: $color-primary;
      text-decoration: underline;
    }

    @include focus-ring;
  }
}
</style>
