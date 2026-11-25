<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineProps<{
  subjectLabel: string
  subjectTo: string
  tags: string[]
}>()
</script>

<template>
  <div class="tag-list">
    <RouterLink class="tag-list__subject" :to="subjectTo">{{ subjectLabel }}</RouterLink>
    <span v-for="tag in tags" :key="tag" class="tag-list__item">#{{ tag }}</span>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/scss/tokens' as *;
@use '@/assets/scss/mixins' as *;

.tag-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.375rem;

  &__subject {
    padding: 0.1875rem 0.5625rem;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: $color-primary;
    text-decoration: none;
    background: $color-surface-muted;
    border: 1px solid $color-border;
    border-radius: $radius-sm;

    &:hover {
      border-color: $color-primary;
    }

    @include focus-ring;
  }

  &__item {
    padding: 0.1875rem 0.5625rem;
    font-size: 0.8125rem;
    color: $color-text-muted;
    background: $color-surface-muted;
    border: 1px solid transparent;
    border-radius: $radius-sm;
  }
}
</style>
