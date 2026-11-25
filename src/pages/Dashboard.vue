<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import EmptyState from '@/components/EmptyState.vue'
import StatTile from '@/components/StatTile.vue'
import VideoCard from '@/components/VideoCard.vue'
import { useCatalog } from '@/composables/useCatalog'
import { useLibrary } from '@/composables/useLibrary'
import { useSession } from '@/composables/useSession'
import type { Video } from '@/types'
import { messageFor } from '@/utils/api'
import { formatCount } from '@/utils/format'

// `.dashboard` page block (design_spec.md §4.5) — the uploader's own space:
// profile, headline stats, and tabs for own / draft lessons. Saved lessons live
// on their own page (`.saved`, §4.6) so a viewer always has a place for them.
type TabKey = 'mine' | 'drafts'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'mine', label: 'My Videos' },
  { key: 'drafts', label: 'Drafts' }
]

const route = useRoute()
const { fetchMine } = useCatalog()
const { savedIds } = useLibrary()
const { user, role, canUpload } = useSession()

function isTabKey(value: unknown): value is TabKey {
  return value === 'mine' || value === 'drafts'
}

const activeTab = ref<TabKey>(isTabKey(route.query.tab) ? route.query.tab : 'mine')

watch(
  () => route.query.tab,
  (value) => {
    if (isTabKey(value)) activeTab.value = value
  }
)

// The uploader's own catalog comes from the server, so the numbers here are the
// same ones a visitor sees on each lesson.
const myVideos = ref<Video[]>([])
const pending = ref(true)
const errorMessage = ref('')

onMounted(async () => {
  try {
    myVideos.value = await fetchMine()
  } catch (error) {
    errorMessage.value = messageFor(error)
  } finally {
    pending.value = false
  }
})

const totals = computed(() => ({
  views: myVideos.value.reduce((sum, video) => sum + video.views, 0),
  likes: myVideos.value.reduce((sum, video) => sum + video.likes, 0),
  dislikes: myVideos.value.reduce((sum, video) => sum + video.dislikes, 0)
}))

const roleLabel = computed(() => (role.value ? `${role.value[0].toUpperCase()}${role.value.slice(1)} account` : ''))

const tabCounts: Record<TabKey, number> = {
  get mine() {
    return myVideos.value.length
  },
  get drafts() {
    return 0
  }
}
</script>

<template>
  <div class="dashboard">
    <div class="dashboard__container">
      <div v-if="user" class="dashboard__profile">
        <span class="dashboard__avatar" aria-hidden="true">{{ user.initials }}</span>

        <div class="dashboard__identity">
          <h1 class="dashboard__name">{{ user.name }}</h1>
          <p class="dashboard__role">{{ roleLabel }}</p>
        </div>

        <RouterLink class="dashboard__saved-link" to="/saved">
          <AppIcon name="bookmark" :size="16" />
          <span>{{ savedIds.length }} saved</span>
        </RouterLink>

        <UButton
          v-if="canUpload"
          to="/upload"
          size="lg"
          label="Upload a Video"
        />
      </div>

      <ul class="dashboard__stats">
        <li>
          <StatTile icon="upload" :value="myVideos.length" label="Lessons published" />
        </li>
        <li>
          <StatTile icon="eye" :value="formatCount(totals.views)" label="Total views" />
        </li>
        <li>
          <StatTile icon="heart" :value="formatCount(totals.likes)" label="Total likes" />
        </li>
        <li>
          <StatTile icon="thumbs-down" :value="formatCount(totals.dislikes)" label="Total dislikes" />
        </li>
      </ul>

      <div class="dashboard__tabs" role="tablist" aria-label="Dashboard sections">
        <button
          v-for="tab in TABS"
          :key="tab.key"
          type="button"
          class="dashboard__tab"
          :class="{ 'dashboard__tab--active': activeTab === tab.key }"
          role="tab"
          :aria-selected="activeTab === tab.key"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
          <span class="dashboard__tab-count">{{ tabCounts[tab.key] }}</span>
        </button>
      </div>

      <div class="dashboard__panel">
        <p v-if="pending" class="dashboard__status" role="status">Loading your lessons…</p>

        <p v-else-if="errorMessage" class="dashboard__status dashboard__status--error" role="alert">
          {{ errorMessage }}
        </p>

        <template v-else-if="activeTab === 'mine'">
          <ul v-if="myVideos.length" class="dashboard__videos">
            <li v-for="video in myVideos" :key="video.id">
              <VideoCard :video="video" :status="video.status" />
            </li>
          </ul>

          <EmptyState
            v-else
            icon="upload"
            title="You have not published a lesson yet"
            text="Your published lessons appear here."
            :action-label="canUpload ? 'Upload a Video' : undefined"
            :action-to="canUpload ? '/upload' : undefined"
          />
        </template>

        <template v-else>
          <EmptyState
            icon="clock"
            title="No drafts"
            text="Your unpublished lessons appear here."
            :action-label="canUpload ? 'Upload a Video' : undefined"
            :action-to="canUpload ? '/upload' : undefined"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/scss/tokens' as *;
@use '@/assets/scss/mixins' as *;

.dashboard {
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

  &__profile {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem;
  }

  &__avatar {
    display: grid;
    place-items: center;
    flex: none;
    width: 3.5rem;
    height: 3.5rem;
    font-size: 1.375rem;
    font-weight: 700;
    color: $color-primary;
    background: $color-surface-muted;
    border: 1px solid $color-border;
    border-radius: 999px;
  }

  &__identity {
    min-width: 0;
    margin-right: auto;
  }

  &__name {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.2;
    color: $color-text-highlighted;
  }

  &__role {
    margin-top: 0.125rem;
    font-size: 0.875rem;
    color: $color-text-muted;
  }

  &__saved-link {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 0.875rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: $color-text;
    text-decoration: none;
    background: $color-surface-muted;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    transition: border-color 150ms ease, color 150ms ease;

    &:hover {
      color: $color-primary;
      border-color: $color-primary;
    }

    @include focus-ring;
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
    gap: 0.75rem;
    margin-top: 1.75rem;
    list-style: none;
  }

  &__tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    margin-top: 2.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid $color-border;
  }

  &__tab {
    display: inline-flex;
    align-items: center;
    gap: 0.4375rem;
    padding: 0.5rem 0.875rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: $color-text-muted;
    background: transparent;
    border: 1px solid transparent;
    border-radius: $radius-md;
    cursor: pointer;
    transition: color 150ms ease, background 150ms ease;

    &:hover {
      color: $color-text;
      background: $color-surface-muted;
    }

    @include focus-ring;

    &--active {
      color: $color-primary;
      background: $color-surface-muted;
      border-color: $color-border;
    }
  }

  &__tab-count {
    padding: 0.0625rem 0.375rem;
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
    color: $color-text-muted;
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: 999px;
  }

  &__panel {
    padding-top: 2rem;
  }

  &__status {
    font-size: 0.9375rem;
    color: $color-text-muted;

    &--error {
      padding: 0.75rem 1rem;
      font-weight: 600;
      color: $color-error;
      background: $color-surface-muted;
      border: 1px solid $color-error;
      border-radius: $radius-md;
    }
  }

  &__videos {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 1.5rem 1rem;
    list-style: none;

    @include up(sm) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @include up(lg) {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    @include up(xl) {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }
}
</style>
