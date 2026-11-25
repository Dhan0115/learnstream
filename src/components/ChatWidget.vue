<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, useId, watch } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from './AppIcon.vue'
import { useChat } from '@/composables/useChat'
import { useSession } from '@/composables/useSession'
import { formatRelativeDate } from '@/utils/format'

// `.chat-widget` (design_spec.md §3.3) — the live-chat launcher. It is part of
// the shell, so it is mounted once in `src/App.vue` and survives navigation.
const { user } = useSession()
const {
  messages,
  loadingThread,
  sending,
  threadError,
  unread,
  panelOpen,
  isStaff,
  start,
  stop,
  send,
  closePanel,
  togglePanel
} = useChat()

const inputId = useId()
const draft = ref('')
const listRef = ref<HTMLElement | null>(null)
const toggleRef = ref<HTMLButtonElement | null>(null)

const heading = computed(() => (isStaff.value ? 'Your inbox' : 'Chat with us'))

// The count is repeated in the button's accessible name so the badge is never
// signalled by colour alone (design_spec.md §6).
const toggleLabel = computed(() => {
  const action = panelOpen.value ? 'Close chat' : 'Open chat'
  if (!unread.value) return action
  const count = unread.value === 1 ? '1 unread message' : `${unread.value} unread messages`
  return `${action} — ${count}`
})

async function submit() {
  const text = draft.value.trim()
  if (!text || sending.value) return
  // A failed send keeps the draft so the message is not lost.
  if ((await send(text)) === null) draft.value = ''
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !panelOpen.value) return
  closePanel()
  toggleRef.value?.focus()
}

// The log always shows its newest line.
watch(
  () => messages.value.length,
  () => {
    void nextTick(() => {
      const list = listRef.value
      if (list) list.scrollTop = list.scrollHeight
    })
  }
)

onMounted(() => {
  start()
  window.addEventListener('keydown', handleKeydown)
})

watch(user, () => start())

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  stop()
})
</script>

<template>
  <div class="chat-widget" :class="{ 'chat-widget--open': panelOpen }">
    <section
      v-show="panelOpen"
      id="chat-widget-panel"
      class="chat-widget__panel"
      aria-label="Live chat"
    >
      <header class="chat-widget__head">
        <h2 class="chat-widget__title">{{ heading }}</h2>
        <button type="button" class="chat-widget__close" aria-label="Close chat" @click="closePanel">
          <AppIcon name="close" :size="18" />
        </button>
      </header>

      <p v-if="!user" class="chat-widget__signin">
        <RouterLink class="chat-widget__signin-link" to="/login">Sign in</RouterLink>
        to message your teacher.
      </p>

      <div v-else-if="isStaff" class="chat-widget__staff-inbox">
        <p class="chat-widget__staff-text">Answer your students from the inbox.</p>
        <RouterLink class="chat-widget__staff-link" to="/inbox">Open inbox</RouterLink>
      </div>

      <template v-else>
        <p v-if="threadError" class="chat-widget__error" role="alert">{{ threadError }}</p>

        <div
          ref="listRef"
          class="chat-widget__list"
          role="log"
          aria-label="Messages"
          :aria-busy="loadingThread"
        >
          <p v-if="!messages.length" class="chat-widget__empty">
            No messages yet — ask your teacher anything.
          </p>
          <div
            v-for="message in messages"
            :key="message.id"
            class="chat-widget__item"
            :class="{ 'chat-widget__item--own': !message.fromStaff }"
          >
            <p class="chat-widget__meta">
              <span class="chat-widget__author">{{ message.authorName }}</span>
              <span class="chat-widget__sep" aria-hidden="true">·</span>
              <span>{{ formatRelativeDate(message.createdAt) }}</span>
            </p>
            <p class="chat-widget__text">{{ message.body }}</p>
          </div>
        </div>

        <form class="chat-widget__form" @submit.prevent="submit">
          <label class="chat-widget__label" :for="inputId">Message</label>
          <input
            :id="inputId"
            v-model="draft"
            class="chat-widget__input"
            type="text"
            name="message"
            autocomplete="off"
            placeholder="Write a message…"
          />
          <button
            type="submit"
            class="chat-widget__send"
            aria-label="Send message"
            :disabled="!draft.trim() || sending"
          >
            <AppIcon name="send" :size="18" />
          </button>
        </form>
      </template>
    </section>

    <button
      ref="toggleRef"
      type="button"
      class="chat-widget__toggle"
      :aria-label="toggleLabel"
      :aria-expanded="panelOpen"
      aria-controls="chat-widget-panel"
      @click="togglePanel"
    >
      <AppIcon :name="panelOpen ? 'close' : 'chat'" :size="22" />
      <span v-if="unread" class="chat-widget__badge" aria-hidden="true">{{ unread }}</span>
    </button>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/scss/tokens' as *;
@use '@/assets/scss/mixins' as *;

.chat-widget {
  position: fixed;
  bottom: 1.25rem;
  left: 1.25rem;
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;

  &__panel {
    display: flex;
    flex-direction: column;
    width: 22rem;
    max-width: calc(100vw - 2.5rem);
    max-height: min(32rem, calc(100vh - 8rem));
    overflow: hidden;
    background: $color-surface-elevated;
    border: 1px solid $color-border;
    border-radius: $radius-xl;
    box-shadow: 0 12px 32px color-mix(in oklab, $color-text 14%, transparent);
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid $color-border;
  }

  &__title {
    font-size: 1rem;
    font-weight: 700;
    color: $color-text-highlighted;
  }

  &__close {
    display: grid;
    place-items: center;
    flex: none;
    width: 2rem;
    height: 2rem;
    color: $color-text-muted;
    background: transparent;
    border: 0;
    border-radius: $radius-md;
    cursor: pointer;
    transition: color 150ms ease;

    &:hover {
      color: $color-text-highlighted;
    }

    @include focus-ring;
  }

  &__list {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 0.75rem;
    min-height: 6rem;
    padding: 1rem;
    overflow-y: auto;
  }

  &__empty {
    padding: 1.5rem 0.5rem;
    font-size: 0.875rem;
    line-height: 1.6;
    text-align: center;
    color: $color-text-muted;
  }

  &__item {
    display: flex;
    flex-direction: column;
    gap: 0.1875rem;
    max-width: 85%;

    &--own {
      align-self: flex-end;
      align-items: flex-end;
    }
  }

  &__item--own &__text {
    color: var(--ui-bg);
    background: $color-primary;
    border-color: transparent;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    color: $color-text-muted;
  }

  &__author {
    font-weight: 600;
    color: $color-text-highlighted;
  }

  &__sep {
    color: $color-border;
  }

  &__text {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    line-height: 1.5;
    color: $color-text;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
    background: $color-surface-muted;
    border: 1px solid $color-border;
    border-radius: $radius-lg;
  }

  &__error {
    padding: 0.5rem 1rem;
    font-size: 0.8125rem;
    font-weight: 600;
    color: $color-error;
  }

  &__signin {
    padding: 1rem;
    font-size: 0.875rem;
    line-height: 1.6;
    color: $color-text-muted;
  }

  &__signin-link {
    font-weight: 600;
    color: $color-primary;
    text-decoration: none;
    border-radius: $radius-sm;

    &:hover {
      text-decoration: underline;
    }

    @include focus-ring;
  }

  &__staff-inbox {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
  }

  &__staff-text {
    font-size: 0.875rem;
    line-height: 1.6;
    color: $color-text-muted;
  }

  &__staff-link {
    align-self: flex-start;
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

  &__form {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-top: 1px solid $color-border;
  }

  &__label {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    white-space: nowrap;
    clip: rect(0 0 0 0);
    border: 0;
  }

  &__input {
    flex: 1 1 auto;
    min-width: 0;
    padding: 0.5rem 0.75rem;
    font: inherit;
    font-size: 0.875rem;
    color: $color-text;
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-md;

    &::placeholder {
      color: $color-text-muted;
    }

    @include focus-ring;
  }

  &__send {
    display: grid;
    place-items: center;
    flex: none;
    width: 2.25rem;
    height: 2.25rem;
    color: var(--ui-bg);
    background: $color-primary;
    border: 0;
    border-radius: $radius-md;
    cursor: pointer;
    transition: opacity 150ms ease;

    &:hover:not(:disabled) {
      opacity: 0.9;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    @include focus-ring;
  }

  &__toggle {
    position: relative;
    display: grid;
    place-items: center;
    width: 3rem;
    height: 3rem;
    color: var(--ui-bg);
    background: $color-primary;
    border: 0;
    border-radius: 999px;
    cursor: pointer;
    box-shadow: 0 8px 20px color-mix(in oklab, $color-text 22%, transparent);
    transition: opacity 150ms ease;

    &:hover {
      opacity: 0.92;
    }

    @include focus-ring;
  }

  &__badge {
    position: absolute;
    top: -0.25rem;
    right: -0.25rem;
    display: grid;
    place-items: center;
    min-width: 1.25rem;
    height: 1.25rem;
    padding: 0 0.3125rem;
    font-size: 0.6875rem;
    font-weight: 700;
    color: var(--ui-bg);
    background: $color-error;
    border: 2px solid $color-surface-elevated;
    border-radius: 999px;
  }
}
</style>
