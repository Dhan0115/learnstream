<script setup lang="ts">
import EmptyState from '@/components/EmptyState.vue'
</script>

<template>
  <div class="not-found">
    <EmptyState
      icon="alert"
      title="We couldn't find that page"
      text="The link may be broken or the lesson may have been removed. Try browsing all lessons instead."
      action-label="Browse all lessons"
      action-to="/browse"
    />
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/scss/mixins' as *;

.not-found {
  width: 100%;
  max-width: 48rem;
  margin: 0 auto;
  padding: 4rem 1rem;

  @include up(sm) {
    padding-inline: 1.5rem;
  }
}
</style>
