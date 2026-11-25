<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import AppIcon from './AppIcon.vue'

// `.dropzone` block (design_spec.md §5). Drag-and-drop or click-to-browse; the
// parent owns format validation and passes the message back through `error`.
const props = withDefaults(defineProps<{
  accept?: string
  label?: string
  hint?: string
  error?: string
  file?: File | null
  compact?: boolean
}>(), {
  accept: '',
  label: '',
  hint: '',
  error: '',
  file: null,
  compact: false
})

const emit = defineEmits<{ select: [file: File] }>()

const inputId = useId()
const inputRef = ref<HTMLInputElement | null>(null)
const dragging = ref(false)

const resolvedLabel = computed(
  () => props.label || 'Drag and drop your video here, or browse files'
)

const fileSize = computed(() => {
  if (!props.file) return ''
  const megabytes = props.file.size / (1024 * 1024)
  return megabytes < 1
    ? `${Math.max(1, Math.round(props.file.size / 1024))} KB`
    : `${megabytes.toFixed(1)} MB`
})

function handle(file: File | undefined) {
  if (!file) return
  emit('select', file)
}

function onChange(event: Event) {
  const input = event.target as HTMLInputElement
  handle(input.files?.[0])
  input.value = ''
}

function onDrop(event: DragEvent) {
  dragging.value = false
  handle(event.dataTransfer?.files?.[0])
}

function clear() {
  if (inputRef.value) inputRef.value.value = ''
}
</script>

<template>
  <div
    class="dropzone"
    :class="{
      'dropzone--compact': compact,
      'is-dragging': dragging,
      'has-error': Boolean(error)
    }"
  >
    <label
      class="dropzone__input"
      :for="inputId"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <input
        :id="inputId"
        ref="inputRef"
        class="sr-only"
        type="file"
        :accept="accept"
        @change="onChange"
      >
      <AppIcon name="upload" :size="compact ? 18 : 24" />
      <span>{{ resolvedLabel }}</span>
    </label>

    <p class="dropzone__hint">{{ error || hint }}</p>

    <p v-if="file" class="dropzone__preview">
      <AppIcon name="check" :size="14" />
      {{ file.name }} · {{ fileSize }}
    </p>

    <button v-if="file" type="button" class="dropzone__clear" @click="clear">
      Remove file
    </button>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/scss/tokens' as *;
@use '@/assets/scss/mixins' as *;

.dropzone {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &__input {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 2rem 1.5rem;
    font-size: 0.9375rem;
    font-weight: 600;
    text-align: center;
    color: $color-text;
    background: $color-surface-muted;
    border: 1.5px dashed $color-border;
    border-radius: $radius-lg;
    cursor: pointer;
    transition: border-color 150ms ease, background 150ms ease;

    &:hover {
      border-color: $color-primary;
    }

    &:focus-within {
      @include focus-outline;
    }
  }

  &__hint {
    font-size: 0.8125rem;
    line-height: 1.5;
    color: $color-text-muted;
  }

  &__preview {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
    font-weight: 600;
    color: $color-success;
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-md;
  }

  &__clear {
    align-self: flex-start;
    padding: 0;
    font-size: 0.8125rem;
    font-weight: 600;
    color: $color-text-muted;
    background: none;
    border: 0;
    cursor: pointer;
    border-radius: $radius-sm;

    &:hover {
      color: $color-error;
    }

    @include focus-ring;
  }

  &.is-dragging {
    .dropzone__input {
      border-color: $color-primary;
      background: $color-surface;
    }
  }

  &.has-error {
    .dropzone__input {
      border-color: $color-error;
    }

    .dropzone__hint {
      color: $color-error;
    }
  }

  &--compact {
    .dropzone__input {
      flex-direction: row;
      justify-content: center;
      padding: 0.875rem 1rem;
      font-size: 0.875rem;
    }
  }
}
</style>
