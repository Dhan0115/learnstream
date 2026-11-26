<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppIcon from './AppIcon.vue'
import { useSession } from '@/composables/useSession'
import { useTheme } from '@/composables/useTheme'

const route = useRoute()
const router = useRouter()
const { user, isStaff, logout } = useSession()
const { isDark, toggleTheme } = useTheme()

const scrolled = ref(false)
const menuOpen = ref(false)

const NAV_LINKS = computed(() => [
  { label: 'Browse', to: '/browse' },
  { label: 'Subjects', to: '/#subjects' },
  { label: 'Saved', to: '/saved' },
  ...(isStaff.value
    ? [
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Inbox', to: '/inbox' }
      ]
    : [])
])

function isActive(to: string): boolean {
  const [path, hash] = to.split('#')
  if (hash) return route.path === (path || '/') && route.hash === `#${hash}`
  if (!path || path === '/') return false
  return route.path === path
}




/** Leaving an account-only page the moment the session ends. */
async function signOut() {
  menuOpen.value = false
  await logout()
  if (route.meta.requiresAuth) router.push('/')
}

function handleScroll() {
  scrolled.value = window.scrollY > 8
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

watch(() => route.fullPath, () => {
  menuOpen.value = false
})
</script>

<template>
  <header
    class="app-header"
    :class="{ 'app-header--scrolled': scrolled, 'app-header--menu-open': menuOpen }"
  >
    <div class="app-header__inner">
      <RouterLink class="app-header__logo" to="/" aria-label="LearnStream home">
        <img src="@/assets/learnstream-nav.png" width="44" height="44" alt="" />
      </RouterLink>

      <nav class="app-header__nav" aria-label="Primary">
        <RouterLink
          v-for="link in NAV_LINKS"
          :key="link.to"
          class="app-header__nav-link"
          :class="{ 'app-header__nav-link--active': isActive(link.to) }"
          :to="link.to"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <div class="app-header__account">
        <template v-if="user">
          <div class="app-header__identity">
            <span class="app-header__avatar" aria-hidden="true">{{ user.initials }}</span>
            <span class="app-header__name">{{ user.name }}</span>
          </div>

          <button type="button" class="app-header__signout" @click="signOut">Sign out</button>
        </template>

        <template v-else>
          <RouterLink class="app-header__signin" to="/login">Sign in</RouterLink>
          <RouterLink class="app-header__signup" to="/signup">Sign up</RouterLink>
        </template>

        <button
          type="button"
          class="app-header__icon-button"
          :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
          :aria-pressed="isDark"
          @click="toggleTheme"
        >
          <AppIcon :name="isDark ? 'sun' : 'moon'" :size="18" />
        </button>

        <button
          type="button"
          class="app-header__menu-toggle"
          :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
          :aria-expanded="menuOpen"
          aria-controls="app-header-panel"
          @click="menuOpen = !menuOpen"
        >
          <AppIcon :name="menuOpen ? 'close' : 'menu'" :size="20" />
        </button>
      </div>
    </div>

    <div v-show="menuOpen" id="app-header-panel" class="app-header__panel">
      <nav class="app-header__panel-nav" aria-label="Mobile">
        <RouterLink
          v-for="link in NAV_LINKS"
          :key="link.to"
          class="app-header__panel-link"
          :to="link.to"
        >
          {{ link.label }}
        </RouterLink>
        <RouterLink
          v-if="!user"
          class="app-header__panel-link app-header__panel-link--primary"
          to="/signup"
        >
          Create an account
        </RouterLink>
        <RouterLink v-if="!user" class="app-header__panel-link" to="/login">Sign in</RouterLink>
        <button v-else type="button" class="app-header__panel-link" @click="signOut">Sign out</button>
      </nav>
    </div>
  </header>
</template>

<style scoped lang="scss">
@use '@/assets/scss/tokens' as *;
@use '@/assets/scss/mixins' as *;

.app-header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: $color-surface;
  border-bottom: 1px solid transparent;
  transition: background-color 150ms ease, border-color 150ms ease;

  &--scrolled {
    background: $color-surface-elevated;
    border-bottom-color: $color-border;
  }

  &__inner {
    display: flex;
    align-items: center;
    gap: 1rem;
    width: 100%;
    max-width: 80rem;
    margin: 0 auto;
    padding: 0.75rem 1rem;

    @include up(sm) {
      padding-inline: 1.5rem;
    }

    @include up(lg) {
      padding-inline: 2rem;
    }
  }

  &__logo {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    flex: none;
    text-decoration: none;
    border-radius: $radius-sm;

    @include focus-ring;
  }

  &__nav {
    display: none;
    align-items: center;
    gap: 0.25rem;

    @include up(lg) {
      display: flex;
    }
  }

  &__nav-link {
    padding: 0.5rem 0.75rem;
    font-size: 0.9375rem;
    font-weight: 500;
    color: $color-text-muted;
    text-decoration: none;
    border-radius: $radius-md;
    transition: color 150ms ease, background-color 150ms ease;

    &:hover {
      color: $color-text-highlighted;
      background: $color-surface-muted;
    }

    @include focus-ring;

    &--active {
      color: $color-primary;
      background: $color-surface-muted;
    }
  }

  &__account {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-left: auto;
  }

  &__identity {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__avatar {
    display: grid;
    place-items: center;
    width: 2rem;
    height: 2rem;
    font-size: 0.6875rem;
    font-weight: 700;
    color: $color-text;
    background: $color-surface-muted;
    border: 1px solid $color-border;
    border-radius: 999px;
  }

  &__name {
    display: none;
    font-size: 0.875rem;
    font-weight: 500;
    color: $color-text;

    @include up(xl) {
      display: inline;
    }
  }

  &__signin {
    display: none;
    padding: 0.4375rem 0.75rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: $color-text;
    text-decoration: none;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    transition: color 150ms ease, border-color 150ms ease;

    &:hover {
      color: $color-primary;
      border-color: $color-primary;
    }

    @include focus-ring;

    @include up(sm) {
      display: inline-flex;
    }
  }

  &__signup {
    display: none;
    align-items: center;
    padding: 0.4375rem 0.75rem;
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

    @include up(sm) {
      display: inline-flex;
    }
  }

  &__signout {
    display: none;
    padding: 0.4375rem 0.75rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: $color-text-muted;
    background: transparent;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    cursor: pointer;
    transition: color 150ms ease, border-color 150ms ease;

    &:hover {
      color: $color-text-highlighted;
      border-color: $color-text-muted;
    }

    @include focus-ring;

    @include up(sm) {
      display: inline-flex;
    }
  }

  &__icon-button {
    display: grid;
    place-items: center;
    width: 2.25rem;
    height: 2.25rem;
    color: $color-text-muted;
    background: $color-surface-muted;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    cursor: pointer;
    transition: color 150ms ease;

    &:hover {
      color: $color-text-highlighted;
    }

    @include focus-ring;
  }

  &__menu-toggle {
    display: grid;
    place-items: center;
    width: 2.25rem;
    height: 2.25rem;
    color: $color-text;
    background: transparent;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    cursor: pointer;

    @include focus-ring;

    @include up(lg) {
      display: none;
    }
  }

  &__panel {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0.5rem 1rem 1.25rem;
    background: $color-surface-elevated;
    border-bottom: 1px solid $color-border;

    @include up(lg) {
      display: none;
    }
  }

  &__panel-nav {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  &__panel-link {
    padding: 0.625rem 0.75rem;
    font-size: 0.9375rem;
    font-weight: 500;
    text-align: left;
    color: $color-text;
    text-decoration: none;
    background: transparent;
    border: 0;
    border-radius: $radius-md;
    cursor: pointer;

    &:hover {
      background: $color-surface-muted;
    }

    @include focus-ring;

    &--primary {
      font-weight: 600;
      color: $color-primary;
      background: $color-surface-muted;
    }
  }
}
</style>
