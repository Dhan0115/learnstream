<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AppIcon from './AppIcon.vue'

defineProps<{
  title: string
  subtitle?: string
  actionLabel?: string
  actionTo?: string
}>()
</script>

<template>
  <div class="section-header">
    <div class="section-header__text">
      <h2 class="section-header__title">{{ title }}</h2>
      <p v-if="subtitle" class="section-header__subtitle">{{ subtitle }}</p>
    </div>

    <RouterLink
      v-if="actionLabel && actionTo"
      class="section-header__action"
      :to="actionTo"
    >
      {{ actionLabel }}
      <AppIcon name="chevron-right" :size="16" />
    </RouterLink>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/scss/tokens' as *;
@use '@/assets/scss/mixins' as *;

.section-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;

  &__title {
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.25;
    color: $color-text-highlighted;

    @include up(md) {
      font-size: 1.5rem;
    }
  }

  &__subtitle {
    margin-top: 0.25rem;
    font-size: 0.875rem;
    color: $color-text-muted;
  }

  &__action {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    flex: none;
    font-size: 0.875rem;
    font-weight: 600;
    color: $color-primary;
    text-decoration: none;
    border-radius: $radius-sm;

    &:hover {
      text-decoration: underline;
    }

    @include focus-ring;
  }
}
</style>
