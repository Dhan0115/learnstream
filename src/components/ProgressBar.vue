<script setup lang="ts">
import { computed } from 'vue'

// `.progress-bar` block (design_spec.md §5). Used by the upload flow and any
// future background task that needs a determinate progress readout.
const props = withDefaults(defineProps<{
  value: number
  label?: string
  status?: 'idle' | 'success' | 'error'
}>(), {
  label: '',
  status: 'idle'
})

const percent = computed(() => Math.min(100, Math.max(0, Math.round(props.value))))
</script>

<template>
  <div
    class="progress-bar"
    :class="{ 'progress-bar--success': status === 'success', 'progress-bar--error': status === 'error' }"
    role="progressbar"
    :aria-valuenow="percent"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-label="label || 'Progress'"
  >
    <div class="progress-bar__track">
      <div class="progress-bar__fill" :style="{ width: `${percent}%` }" />
    </div>
    <p class="progress-bar__value">{{ percent }}%</p>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/scss/tokens' as *;
@use '@/assets/scss/mixins' as *;

.progress-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &__track {
    flex: 1 1 auto;
    height: 0.5rem;
    overflow: hidden;
    background: $color-surface-muted;
    border: 1px solid $color-border;
    border-radius: 999px;
  }

  &__fill {
    height: 100%;
    background: $color-primary;
    border-radius: 999px;
    transition: width 200ms ease;
  }

  &__value {
    flex: none;
    min-width: 2.75rem;
    font-size: 0.8125rem;
    font-variant-numeric: tabular-nums;
    font-weight: 600;
    text-align: right;
    color: $color-text-muted;
  }

  &--success {
    .progress-bar__fill {
      background: $color-success;
    }

    .progress-bar__value {
      color: $color-success;
    }
  }

  &--error {
    .progress-bar__fill {
      background: $color-error;
    }

    .progress-bar__value {
      color: $color-error;
    }
  }
}
</style>
