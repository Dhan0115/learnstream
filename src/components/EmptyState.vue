<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AppIcon from './AppIcon.vue'

withDefaults(defineProps<{
  title: string
  text?: string
  icon?: string
  actionLabel?: string
  actionTo?: string
}>(), {
  text: '',
  icon: 'search',
  actionLabel: '',
  actionTo: ''
})
</script>

<template>
  <div class="empty-state">
    <span class="empty-state__icon" aria-hidden="true">
      <AppIcon :name="icon" :size="26" />
    </span>
    <h2 class="empty-state__title">{{ title }}</h2>
    <p v-if="text" class="empty-state__text">{{ text }}</p>
    <RouterLink v-if="actionLabel && actionTo" class="empty-state__action" :to="actionTo">
      {{ actionLabel }}
    </RouterLink>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/scss/tokens' as *;
@use '@/assets/scss/mixins' as *;

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 1.5rem;
  text-align: center;
  background: $color-surface-muted;
  border: 1px dashed $color-border;
  border-radius: $radius-lg;

  &__icon {
    display: grid;
    place-items: center;
    width: 3rem;
    height: 3rem;
    color: $color-text-muted;
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: 999px;
  }

  &__title {
    font-size: 1.0625rem;
    font-weight: 600;
    color: $color-text-highlighted;
  }

  &__text {
    max-width: 34rem;
    font-size: 0.9375rem;
    line-height: 1.6;
    color: $color-text-muted;
  }

  &__action {
    margin-top: 0.25rem;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--ui-bg);
    text-decoration: none;
    background: $color-primary;
    border-radius: $radius-md;
    transition: opacity 150ms ease;

    &:hover {
      opacity: 0.9;
    }

    @include focus-ring;
  }
}
</style>
