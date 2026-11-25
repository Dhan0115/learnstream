<script setup lang="ts">
// Loading placeholder shaped like `.video-card` (design_spec.md §5, §6). Purely
// decorative — the list that contains it carries `aria-busy` and a label.
</script>

<template>
  <div class="video-skeleton" aria-hidden="true">
    <span class="video-skeleton__thumb" />
    <span class="video-skeleton__line" />
    <span class="video-skeleton__line video-skeleton__line--short" />
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/scss/tokens' as *;
@use '@/assets/scss/mixins' as *;

@keyframes video-skeleton-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.55;
  }
}

.video-skeleton {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  height: 100%;

  &__thumb {
    aspect-ratio: 16 / 9;
    background: $color-surface-muted;
    border: 1px solid $color-border;
    border-radius: $radius-lg;
    animation: video-skeleton-pulse 1.4s ease-in-out infinite;
  }

  &__line {
    height: 0.875rem;
    background: $color-surface-muted;
    border-radius: $radius-sm;
    animation: video-skeleton-pulse 1.4s ease-in-out infinite;

    &--short {
      width: 55%;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .video-skeleton__thumb,
  .video-skeleton__line {
    animation: none;
  }
}
</style>
