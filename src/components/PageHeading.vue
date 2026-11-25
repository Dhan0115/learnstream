<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  count?: number
}>()
</script>

<template>
  <div class="page-heading">
    <h1 class="page-heading__title">{{ title }}</h1>
    <p v-if="subtitle" class="page-heading__subtitle">{{ subtitle }}</p>
    <p v-if="typeof count === 'number'" class="page-heading__count">
      {{ count }} {{ count === 1 ? 'lesson' : 'lessons' }}
    </p>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/scss/tokens' as *;
@use '@/assets/scss/mixins' as *;

.page-heading {
  margin-bottom: 1.75rem;

  &__title {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.2;
    color: $color-text-highlighted;

    @include up(md) {
      font-size: 1.875rem;
    }
  }

  &__subtitle {
    margin-top: 0.5rem;
    font-size: 1rem;
    line-height: 1.6;
    color: $color-text-muted;
  }

  &__count {
    margin-top: 0.5rem;
    font-size: 0.8125rem;
    font-weight: 600;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    color: $color-text-muted;
  }
}
</style>
