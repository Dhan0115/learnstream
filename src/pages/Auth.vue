<script setup lang="ts">
import { computed, reactive, ref, useId, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import { useSession } from '@/composables/useSession'

// `.auth` page block (design_spec.md §4.7). One component serves both `/login`
// and `/signup`, the way `.browse` serves browse, subject and search. The
// account is created on the server and kept in an HTTP-only session cookie.
const route = useRoute()
const router = useRouter()
const { signup, login } = useSession()

const isSignup = computed(() => route.name === 'signup')
const passwordVisible = ref(false)
watch(isSignup, () => { passwordVisible.value = false })

const nameId = useId()
const emailId = useId()
const passwordId = useId()

const form = reactive({ name: '', email: '', password: '' })
const error = ref('')
const busy = ref(false)

/** Where the visitor was headed when the session sent them here. */
const redirect = computed(() => (typeof route.query.redirect === 'string' ? route.query.redirect : ''))

async function submit() {
  if (busy.value) return

  error.value = ''
  busy.value = true

  const result = isSignup.value
    ? await signup({ name: form.name, email: form.email, password: form.password })
    : await login({ email: form.email, password: form.password })

  busy.value = false

  if (!result.ok) {
    error.value = result.error
    return
  }

  await router.replace(redirect.value || '/dashboard')
}
</script>

<template>
  <div class="auth">
    <div class="auth__card">
      <h1 class="auth__title">{{ isSignup ? 'Create your account' : 'Welcome back' }}</h1>
      <p class="auth__subtitle">
        {{ isSignup
          ? 'Create a learner account to watch lessons and save your favorites.'
          : 'Sign in to watch lessons and open your dashboard.' }}
      </p>

      <p v-if="error" class="auth__error" role="alert">
        <AppIcon name="alert" :size="16" />
        <span>{{ error }}</span>
      </p>

      <form class="auth__form" novalidate @submit.prevent="submit">
        <div v-if="isSignup" class="auth__field">
          <label class="auth__label" :for="nameId">Display name</label>
          <input
            :id="nameId"
            v-model="form.name"
            class="auth__input"
            type="text"
            autocomplete="name"
            placeholder="Alex Rivera"
          >
        </div>

        <div class="auth__field">
          <label class="auth__label" :for="emailId">Email</label>
          <input
            :id="emailId"
            v-model="form.email"
            class="auth__input"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
          >
        </div>

        <div class="auth__field">
          <label class="auth__label" :for="passwordId">Password</label>
          <div class="auth__password">
            <input
              :id="passwordId"
              v-model="form.password"
              class="auth__input auth__input--password"
              :type="passwordVisible ? 'text' : 'password'"
              :autocomplete="isSignup ? 'new-password' : 'current-password'"
              spellcheck="false"
              autocapitalize="none"
              placeholder="At least 8 characters"
            >
            <button
              class="auth__visibility"
              type="button"
              :aria-controls="passwordId"
              :aria-label="passwordVisible ? 'Hide password' : 'Show password'"
              @click="passwordVisible = !passwordVisible"
            >
              <AppIcon :name="passwordVisible ? 'eye-off' : 'eye'" :size="18" />
            </button>
          </div>
          <p v-if="isSignup" class="auth__hint">
            At least 8 characters. Your password is stored as a salted hash, never in plain text.
          </p>
        </div>

        <UButton
          class="auth__submit"
          type="submit"
          size="lg"
          :loading="busy"
          :disabled="busy"
          :label="isSignup ? 'Create account' : 'Sign in'"
        />

        <p class="auth__switch">
          <template v-if="isSignup">
            Already have an account?
            <RouterLink class="auth__switch-link" to="/login">Sign in</RouterLink>
          </template>
          <template v-else>
            New to LearnStream?
            <RouterLink class="auth__switch-link" to="/signup">Create an account</RouterLink>
          </template>
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/scss/tokens' as *;
@use '@/assets/scss/mixins' as *;

.auth {
  display: grid;
  place-items: center;
  padding: clamp(1rem, 4vh, 2.5rem) 1rem;
  background-image: radial-gradient(circle, color-mix(in srgb, var(--ui-primary) 14%, transparent) 1px, transparent 1.25px);
  background-size: 24px 24px;

  &__card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    max-width: 26rem;
    padding: 1.75rem;
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-xl;
  }

  &__title {
    font-size: 1.5rem;
    font-weight: 800;
    line-height: 1.2;
    color: $color-text-highlighted;
  }

  &__subtitle {
    margin-top: -0.5rem;
    font-size: 0.9375rem;
    line-height: 1.6;
    color: $color-text-muted;
  }

  &__error {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.625rem 0.75rem;
    font-size: 0.8125rem;
    font-weight: 600;
    line-height: 1.5;
    color: $color-error;
    background: $color-surface-muted;
    border: 1px solid $color-error;
    border-radius: $radius-md;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 1.125rem;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    min-width: 0;
  }

  &__label {
    font-size: 0.8125rem;
    font-weight: 600;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    color: $color-text-muted;
  }

  &__input {
    width: 100%;
    padding: 0.625rem 0.75rem;
    font: inherit;
    font-size: 0.9375rem;
    color: $color-text;
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-md;

    &::placeholder {
      color: $color-text-muted;
    }

    &:hover {
      border-color: $color-primary;
    }

    @include focus-ring;
  }

  &__password {
    position: relative;
  }

  &__input--password {
    padding-inline-end: 3rem;
  }

  &__visibility {
    position: absolute;
    inset-block: 1px;
    inset-inline-end: 1px;
    display: grid;
    place-items: center;
    width: 2.75rem;
    color: $color-text-muted;
    border-radius: $radius-md;
    cursor: pointer;

    &:hover {
      color: $color-primary;
    }

    @include focus-ring;
  }

  &__hint {
    font-size: 0.75rem;
    line-height: 1.5;
    color: $color-text-muted;
  }

  &__roles {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0;
    border: 0;
  }

  &__legend {
    padding: 0;
    margin-bottom: 0.5rem;
  }

  &__role {
    display: flex;
    align-items: flex-start;
    gap: 0.625rem;
    padding: 0.625rem 0.75rem;
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    cursor: pointer;
    transition: border-color 150ms ease;

    &:hover {
      border-color: $color-primary;
    }

    &--active {
      border-color: $color-primary;
      background: $color-surface-muted;
    }
  }

  &__radio {
    flex: none;
    width: 1rem;
    height: 1rem;
    margin: 0.1875rem 0 0;
    accent-color: $color-primary;

    @include focus-ring;
  }

  &__role-text {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
  }

  &__role-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: $color-text-highlighted;
  }

  &__role-hint {
    font-size: 0.75rem;
    line-height: 1.5;
    color: $color-text-muted;
  }

  &__submit {
    width: 100%;
    justify-content: center;
  }

  &__switch {
    font-size: 0.875rem;
    text-align: center;
    color: $color-text-muted;
  }

  &__switch-link {
    font-weight: 600;
    color: $color-primary;
    text-decoration: none;
    border-radius: $radius-sm;

    &:hover {
      text-decoration: underline;
    }

    @include focus-ring;
  }
}
</style>
