<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Subject } from '@/types'

defineProps<{ subject: Subject; count: number }>()
</script>

<template>
  <RouterLink class="subject-card" :to="`/subjects/${subject.slug}`">
    <span class="subject-card__icon" aria-hidden="true"><slot name="icon">{{ subject.icon }}</slot></span>
    <span class="subject-card__body">
      <span class="subject-card__title">{{ subject.name }}</span>
      <span class="subject-card__tagline">{{ subject.tagline }}</span>
      <span class="subject-card__count">
        {{ count }} {{ count === 1 ? 'lesson' : 'lessons' }}
      </span>
    </span>
  </RouterLink>
</template>

<style scoped lang="scss">
@use '@/assets/scss/tokens' as *;
@use '@/assets/scss/mixins' as *;

.subject-card {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  height: 100%;
  padding: 1rem;
  text-decoration: none;
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  transition: border-color 150ms ease, transform 150ms ease;

  &:hover {
    border-color: $color-primary;
    transform: translateY(-2px);
  }

  @include focus-ring;

  &__icon {
    display: grid;
    flex: none;
    place-items: center;
    width: 2.75rem;
    height: 2.75rem;
    font-size: 1.125rem;
    font-weight: 700;
    color: $color-primary;
    background: $color-surface-muted;
    border-radius: $radius-md;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  }

  &__title {
    font-size: 1rem;
    font-weight: 600;
    color: $color-text-highlighted;
  }

  &__tagline {
    font-size: 0.8125rem;
    line-height: 1.45;
    color: $color-text-muted;
    @include truncate(2);
  }

  &__count {
    margin-top: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: $color-text-muted;
  }

  &--active {
    border-color: $color-primary;
    box-shadow: 0 0 0 1px $color-primary;
  }
}
</style>
