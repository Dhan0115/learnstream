<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useId, watch } from 'vue'
import AppIcon from '@/components/AppIcon.vue'
import PageHeading from '@/components/PageHeading.vue'
import { useChat } from '@/composables/useChat'
import { formatRelativeDate } from '@/utils/format'

// `.inbox` (design_spec.md §4.9) — the staff side of the chat. The widget is the
// student's; staff answer from here. The live connection is already open (the
// widget is in the shell), so this page only reads the shared state.
const {
  conversations,
  messages,
  activeId,
  activeConversation,
  loadingThread,
  sending,
  threadError,
  listError,
  loadConversations,
  openConversation,
  send
} = useChat()

const inputId = useId()
const draft = ref('')
const listRef = ref<HTMLElement | null>(null)

const waiting = computed(() => conversations.value.filter(row => row.unread > 0).length)

const subtitle = computed(() => {
  const total = conversations.value.length
  if (!total) return 'Questions from your students arrive here.'
  const noun = total === 1 ? 'conversation' : 'conversations'
  if (!waiting.value) return `${total} ${noun}, all answered.`
  const unanswered = waiting.value === 1 ? '1 waiting' : `${waiting.value} waiting`
  return `${total} ${noun} · ${unanswered}`
})

const threadHeading = computed(() => activeConversation.value?.studentName ?? '')

onMounted(() => {
  void loadConversations()
})

async function submit() {
  const text = draft.value.trim()
  if (!text || sending.value) return
  // A failed send keeps the draft so the reply is not lost.
  if ((await send(text)) === null) draft.value = ''
}

// The thread always shows its newest line.
watch(
  () => messages.value.length,
  () => {
    void nextTick(() => {
      const list = listRef.value
      if (list) list.scrollTop = list.scrollHeight
    })
  }
)
</script>

<template>
  <div class="inbox">
    <div class="inbox__container">
      <PageHeading title="Inbox" :subtitle="subtitle" />

      <p v-if="listError" class="inbox__error" role="alert">{{ listError }}</p>

      <div class="inbox__grid">
        <nav aria-label="Conversations">
          <p v-if="!conversations.length" class="inbox__empty">
            No conversations yet — a student's first message starts one.
          </p>

          <ul v-else class="inbox__list">
            <li v-for="row in conversations" :key="row.id">
              <button
                type="button"
                class="inbox__conversation"
                :class="{
                  'inbox__conversation--active': row.id === activeId,
                  'inbox__conversation--unread': row.unread > 0
                }"
                :aria-current="row.id === activeId"
                @click="openConversation(row.id)"
              >
                <span class="inbox__who">{{ row.studentName }}</span>
                <span class="inbox__when">{{ formatRelativeDate(row.lastMessageAt) }}</span>
                <span class="inbox__preview">{{ row.lastMessage }}</span>
                <span v-if="row.unread" class="inbox__unread">
                  {{ row.unread === 1 ? '1 new message' : `${row.unread} new messages` }}
                </span>
              </button>
            </li>
          </ul>
        </nav>

        <section class="inbox__thread" aria-label="Conversation">
          <p v-if="!activeConversation" class="inbox__empty">Pick a conversation to reply.</p>

          <template v-else>
            <h2 class="inbox__thread-head">{{ threadHeading }}</h2>

            <p v-if="threadError" class="inbox__error" role="alert">{{ threadError }}</p>

            <div
              ref="listRef"
              class="inbox__messages"
              role="log"
              aria-label="Messages"
              :aria-busy="loadingThread"
            >
              <div
                v-for="message in messages"
                :key="message.id"
                class="inbox__message"
                :class="{ 'inbox__message--own': message.fromStaff }"
              >
                <p class="inbox__meta">
                  {{ message.authorName }} · {{ formatRelativeDate(message.createdAt) }}
                </p>
                <p class="inbox__text">{{ message.body }}</p>
              </div>
            </div>

            <form class="inbox__form" @submit.prevent="submit">
              <label class="inbox__label" :for="inputId">Reply</label>
              <input
                :id="inputId"
                v-model="draft"
                class="inbox__input"
                type="text"
                name="reply"
                autocomplete="off"
                placeholder="Write a reply…"
              />
              <button
                type="submit"
                class="inbox__send"
                aria-label="Send reply"
                :disabled="!draft.trim() || sending"
              >
                <AppIcon name="send" :size="18" />
              </button>
            </form>
          </template>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/scss/tokens' as *;
@use '@/assets/scss/mixins' as *;

.inbox {
  &__container {
    width: 100%;
    max-width: 80rem;
    margin: 0 auto;
    padding: 2.5rem 1rem 0;

    @include up(sm) {
      padding-inline: 1.5rem;
    }

    @include up(lg) {
      padding-inline: 2rem;
    }

    @include up(md) {
      padding-top: 3.5rem;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 1rem;
    padding-bottom: 3rem;

    @include up(lg) {
      grid-template-columns: minmax(0, 20rem) minmax(0, 1fr);
      gap: 1.5rem;
    }
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
    list-style: none;
  }

  &__conversation {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 0.125rem 0.75rem;
    width: 100%;
    padding: 0.75rem 0.875rem;
    font: inherit;
    text-align: left;
    color: $color-text;
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-lg;
    cursor: pointer;
    transition: background-color 150ms ease, border-color 150ms ease;

    &:hover {
      background: $color-surface-muted;
    }

    @include focus-ring;

    &--active {
      border-color: $color-primary;
      box-shadow: 0 0 0 1px $color-primary;
    }

    &--unread {
      background: $color-surface-muted;
    }
  }

  &__who {
    min-width: 0;
    font-size: 0.9375rem;
    font-weight: 600;
    color: $color-text-highlighted;
    @include truncate(1);
  }

  &__when {
    font-size: 0.75rem;
    color: $color-text-muted;
    white-space: nowrap;
  }

  &__preview {
    grid-column: 1 / -1;
    min-width: 0;
    font-size: 0.8125rem;
    color: $color-text-muted;
    @include truncate(1);
  }

  &__unread {
    grid-column: 1 / -1;
    justify-self: start;
    margin-top: 0.25rem;
    padding: 0.0625rem 0.4375rem;
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    color: var(--ui-bg);
    background: $color-error;
    border-radius: 999px;
  }

  &__thread {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 24rem;
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-xl;
    overflow: hidden;
  }

  &__thread-head {
    padding: 0.875rem 1rem;
    font-size: 1rem;
    font-weight: 700;
    color: $color-text-highlighted;
    border-bottom: 1px solid $color-border;
  }

  &__messages {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 0.875rem;
    max-height: 32rem;
    padding: 1rem;
    overflow-y: auto;
  }

  &__message {
    display: flex;
    flex-direction: column;
    gap: 0.1875rem;
    max-width: 80%;

    &--own {
      align-self: flex-end;
      align-items: flex-end;
    }
  }

  &__message--own &__text {
    color: var(--ui-bg);
    background: $color-primary;
    border-color: transparent;
  }

  &__meta {
    font-size: 0.75rem;
    color: $color-text-muted;
  }

  &__text {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    line-height: 1.55;
    color: $color-text;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
    background: $color-surface-muted;
    border: 1px solid $color-border;
    border-radius: $radius-lg;
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

  &__empty {
    padding: 2rem 1rem;
    font-size: 0.9375rem;
    line-height: 1.6;
    text-align: center;
    color: $color-text-muted;
  }

  &__error {
    padding: 0.75rem 1rem;
    margin-bottom: 1rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: $color-error;
    background: $color-surface-muted;
    border: 1px solid $color-error;
    border-radius: $radius-md;
  }
}
</style>
