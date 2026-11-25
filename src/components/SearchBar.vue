<script setup lang="ts">
import { ref, useId } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from './AppIcon.vue'

const props = withDefaults(defineProps<{
  compact?: boolean
  initial?: string
  placeholder?: string
  label?: string
}>(), {
  compact: false,
  initial: '',
  placeholder: 'Search videos, subjects, topics…',
  label: 'Search lessons'
})

const router = useRouter()
const inputId = useId()
const term = ref(props.initial)

function submit() {
  const query = term.value.trim()
  if (!query) return
  router.push({ path: '/search', query: { q: query } })
}
</script>

<template>
  <form
    class="search-bar"
    :class="{ 'search-bar--compact': compact }"
    role="search"
    @submit.prevent="submit"
  >
    <label class="search-bar__label" :for="inputId">{{ label }}</label>
    <span class="search-bar__icon" aria-hidden="true">
      <AppIcon name="search" :size="18" />
    </span>
    <input
      :id="inputId"
      v-model="term"
      class="search-bar__input"
      type="search"
      name="q"
      autocomplete="off"
      :placeholder="placeholder"
    />
    <button class="search-bar__submit" type="submit">
      Search
    </button>
  </form>
</template>

<style scoped lang="scss">
@use '@/assets/scss/tokens' as *;
@use '@/assets/scss/mixins' as *;

.search-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.375rem 0.375rem 0.375rem 0.875rem;
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  transition: border-color 150ms ease, box-shadow 150ms ease;

  &:focus-within {
    border-color: $color-primary;
    box-shadow: 0 0 0 3px color-mix(in oklab, $color-primary 25%, transparent);
  }

  &__label {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }

  &__icon {
    display: flex;
    color: $color-text-muted;
  }

  &__input {
    flex: 1 1 auto;
    min-width: 0;
    padding: 0.375rem 0;
    font-size: 1rem;
    color: $color-text;
    background: transparent;
    border: 0;
    outline: none;

    &::placeholder {
      color: $color-text-muted;
    }
  }

  &__submit {
    flex: none;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--ui-bg);
    background: $color-primary;
    border: 0;
    border-radius: $radius-md;
    cursor: pointer;
    transition: opacity 150ms ease;

    &:hover {
      opacity: 0.9;
    }

    @include focus-ring;
  }

  &--compact {
    padding: 0.25rem 0.25rem 0.25rem 0.75rem;

    .search-bar__input {
      font-size: 0.875rem;
    }

    .search-bar__submit {
      padding: 0.375rem 0.75rem;
      font-size: 0.8125rem;
    }
  }

  @include up(lg) {
    max-width: none;
  }
}
</style>
