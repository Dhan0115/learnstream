<script setup lang="ts">
import { computed, onMounted, ref, useId } from 'vue'
import { RouterLink } from 'vue-router'
import { useLibrary } from '@/composables/useLibrary'
import { useSession } from '@/composables/useSession'
import { formatRelativeDate } from '@/utils/format'

const props = defineProps<{ videoId: string }>()

const { user } = useSession()
const { commentsFor, loadComments, addComment } = useLibrary()

const inputId = useId()
const draft = ref('')
const errorMessage = ref('')
const busy = ref(false)

const comments = computed(() => commentsFor(props.videoId))
const isEmpty = computed(() => comments.value.length === 0)

onMounted(() => {
  // The conversation is loaded here rather than by the page, so the count beside
  // the lesson and the list below it always come from the same fetch.
  void loadComments(props.videoId)
})

async function submit() {
  if (!user.value || !draft.value.trim() || busy.value) return

  busy.value = true
  errorMessage.value = (await addComment(props.videoId, draft.value)) ?? ''
  busy.value = false

  if (!errorMessage.value) draft.value = ''
}
</script>

<template>
  <section class="comment-section" :class="{ 'comment-section--empty': isEmpty }" aria-labelledby="comments-heading">
    <h2 id="comments-heading" class="comment-section__heading">
      Questions & comments
      <span class="comment-section__total">{{ comments.length }}</span>
    </h2>

    <form v-if="user" class="comment-section__form" @submit.prevent="submit">
      <label class="comment-section__label" :for="inputId">Ask a question about this lesson</label>
      <textarea
        :id="inputId"
        v-model="draft"
        class="comment-section__input"
        name="comment"
        rows="3"
        placeholder="What would you like to understand better?"
      />
      <div class="comment-section__form-actions">
        <p class="comment-section__hint">Your question is posted publicly on this lesson.</p>
        <button class="comment-section__submit" type="submit" :disabled="!draft.trim() || busy">
          Post question
        </button>
      </div>
      <p v-if="errorMessage" class="comment-section__error" role="alert">{{ errorMessage }}</p>
    </form>

    <p v-else class="comment-section__signin">
      <RouterLink class="comment-section__signin-link" to="/login">Sign in</RouterLink>
      to ask a question about this lesson.
    </p>

    <p v-if="isEmpty" class="comment-section__placeholder">
      No questions yet — be the first to ask.
    </p>

    <ul v-else class="comment-section__list">
      <li v-for="comment in comments" :key="comment.id" class="comment-section__item">
        <span class="comment-section__avatar" aria-hidden="true">
          {{ comment.authorName.slice(0, 1).toUpperCase() }}
        </span>
        <div class="comment-section__body">
          <p class="comment-section__meta">
            <span class="comment-section__author">{{ comment.authorName }}</span>
            <span class="comment-section__sep" aria-hidden="true">·</span>
            <span>{{ formatRelativeDate(comment.createdAt) }}</span>
          </p>
          <p class="comment-section__text">{{ comment.body }}</p>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/scss/tokens' as *;
@use '@/assets/scss/mixins' as *;

.comment-section {
  &__heading {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    font-size: 1.125rem;
    font-weight: 700;
    color: $color-text-highlighted;
  }

  &__total {
    padding: 0.0625rem 0.4375rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: $color-text-muted;
    background: $color-surface-muted;
    border-radius: 999px;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  &__label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: $color-text-muted;
  }

  &__input {
    width: 100%;
    padding: 0.625rem 0.75rem;
    font: inherit;
    font-size: 0.9375rem;
    line-height: 1.55;
    color: $color-text;
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    resize: vertical;

    &::placeholder {
      color: $color-text-muted;
    }

    @include focus-ring;
  }

  &__form-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  &__hint {
    font-size: 0.75rem;
    color: $color-text-muted;
  }

  &__error {
    font-size: 0.8125rem;
    font-weight: 600;
    color: $color-error;
  }

  &__submit {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 600;
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

  &__signin {
    margin-bottom: 1.5rem;
    padding: 0.875rem 1rem;
    font-size: 0.875rem;
    color: $color-text-muted;
    background: $color-surface-muted;
    border: 1px solid $color-border;
    border-radius: $radius-md;
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

  &__placeholder {
    padding: 1.25rem;
    font-size: 0.9375rem;
    text-align: center;
    color: $color-text-muted;
    background: $color-surface-muted;
    border: 1px dashed $color-border;
    border-radius: $radius-lg;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    list-style: none;
  }

  &__item {
    display: flex;
    gap: 0.75rem;
  }

  &__avatar {
    display: grid;
    place-items: center;
    flex: none;
    width: 2.25rem;
    height: 2.25rem;
    font-size: 0.875rem;
    font-weight: 700;
    color: $color-text;
    background: $color-surface-muted;
    border: 1px solid $color-border;
    border-radius: 999px;
  }

  &__body {
    min-width: 0;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.8125rem;
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
    margin-top: 0.1875rem;
    font-size: 0.9375rem;
    line-height: 1.6;
    color: $color-text;
  }
}
</style>
