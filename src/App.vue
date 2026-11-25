<script setup lang="ts">
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import ChatWidget from '@/components/ChatWidget.vue'
import { initTheme } from '@/composables/useTheme'

// Apply the stored/system theme before the first paint of the app tree.
initTheme()
</script>

<template>
  <UApp>
    <a class="skip-link" href="#main-content">Skip to main content</a>

    <AppHeader />

    <main id="main-content" class="app-main">
      <RouterView />
    </main>

    <template v-if="$route.name !== 'login' && $route.name !== 'signup'">
      <AppFooter />
      <ChatWidget />
    </template>
  </UApp>
</template>

<style scoped lang="scss">
@use '@/assets/scss/tokens' as *;
@use '@/assets/scss/mixins' as *;

.skip-link {
  position: absolute;
  left: 1rem;
  top: -3rem;
  z-index: 50;
  padding: 0.5rem 0.875rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ui-bg);
  text-decoration: none;
  background: $color-primary;
  border-radius: $radius-md;
  transition: top 150ms ease;

  &:focus-visible {
    top: 1rem;
  }
}

:global(#app) {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
}

.app-main {
  flex: 1 0 auto;
  min-height: 0;
}

.app-main:has(> .browse--subject) + .app-footer {
  margin-top: 1rem;
}

.app-main:has(> .auth) {
  display: grid;
}
</style>
