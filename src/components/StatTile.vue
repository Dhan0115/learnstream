<script setup lang="ts">
import AppIcon from './AppIcon.vue'

// `.stat-tile` block (design_spec.md §5) — one number with a label, used by
// the uploader dashboard.
withDefaults(defineProps<{
  value: string | number
  label: string
  icon?: string
}>(), {
  icon: ''
})
</script>

<template>
  <div class="stat-tile">
    <span v-if="icon" class="stat-tile__icon" aria-hidden="true">
      <AppIcon :name="icon" :size="18" />
    </span>
    <p class="stat-tile__value">{{ value }}</p>
    <p class="stat-tile__label">{{ label }}</p>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/scss/tokens' as *;
@use '@/assets/scss/mixins' as *;

.stat-tile {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding: 1rem 1.125rem;
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-lg;

  &__icon {
    display: grid;
    place-items: center;
    width: 2rem;
    height: 2rem;
    margin-bottom: 0.375rem;
    color: $color-primary;
    background: $color-surface-muted;
    border-radius: 999px;
  }

  &__value {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.15;
    color: $color-text-highlighted;
  }

  &__label {
    font-size: 0.8125rem;
    color: $color-text-muted;
  }
}
</style>
