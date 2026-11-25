<script setup lang="ts">
import { computed } from 'vue'

// Dependency-free icon block (design_spec.md §8.8). Every glyph is an inline
// SVG so the app never fetches an icon from the network.
const props = withDefaults(defineProps<{ name: string; size?: number }>(), { size: 20 })

const GLYPHS: Record<string, string> = {
  search: '<circle cx="11" cy="11" r="7" /><path d="m20.5 20.5-4.3-4.3" />',
  menu: '<path d="M4 7h16M4 12h16M4 17h16" />',
  close: '<path d="M6 6l12 12M18 6 6 18" />',
  sun: '<circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" />',
  moon: '<path d="M20.5 14.2A8.6 8.6 0 0 1 9.8 3.5a8.6 8.6 0 1 0 10.7 10.7Z" />',
  play: '<path d="M7 4.8v14.4L19.4 12 7 4.8Z" />',
  pause: '<path d="M8.5 5v14M15.5 5v14" />',
  volume: '<path d="M4.5 9.5h3l4-3.5v12l-4-3.5h-3Z" /><path d="M15.5 9a4.4 4.4 0 0 1 0 6M18.2 6.4a8 8 0 0 1 0 11.2" />',
  'volume-off': '<path d="M4.5 9.5h3l4-3.5v12l-4-3.5h-3Z" /><path d="m15.5 9.8 5 4.4M20.5 9.8l-5 4.4" />',
  maximize: '<path d="M9 4.5H4.5V9M15 4.5h4.5V9M15 19.5h4.5V15M9 19.5H4.5V15" />',
  minimize: '<path d="M4.5 9H9V4.5M19.5 9H15V4.5M19.5 15H15v4.5M4.5 15H9v4.5" />',
  'chevron-right': '<path d="m9.5 5.5 6.5 6.5-6.5 6.5" />',
  'chevron-left': '<path d="m14.5 5.5-6.5 6.5 6.5 6.5" />',
  'chevron-down': '<path d="m5.5 9.5 6.5 6.5 6.5-6.5" />',
  clock: '<circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" />',
  eye: '<path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.8" />',
  'eye-off': '<path d="m3 3 18 18M10 6a10 10 0 0 1 2-.2c6 0 9.5 6.2 9.5 6.2a19 19 0 0 1-3 3.7M6.2 7.8A19 19 0 0 0 2.5 12s3.5 6.2 9.5 6.2a11 11 0 0 0 4.4-1M9.2 11.8a2.8 2.8 0 0 0 3 3" />',
  upload: '<path d="M12 15.5V4.5M8 8.3 12 4.3l4 4M4.5 15.5v2.6a1.9 1.9 0 0 0 1.9 1.9h11.2a1.9 1.9 0 0 0 1.9-1.9v-2.6" />',
  user: '<circle cx="12" cy="8.5" r="3.7" /><path d="M4.8 20c.9-3.4 3.8-5.4 7.2-5.4s6.3 2 7.2 5.4" />',
  check: '<path d="m4.5 12.5 5 5 10-11" />',
  alert: '<path d="M12 4.5 21 19.5H3L12 4.5Z" /><path d="M12 10v4M12 16.8v.2" />',
  bookmark: '<path d="M6.5 4.5h11v15l-5.5-3.6-5.5 3.6v-15Z" />',
  heart: '<path d="M12 20s-7.5-4.4-7.5-9.4A4.1 4.1 0 0 1 12 8.2a4.1 4.1 0 0 1 7.5 2.4c0 5-7.5 9.4-7.5 9.4Z" />',
  'thumbs-down': '<path d="M17 3.5h1.8A1.7 1.7 0 0 1 20.5 5.2v6.1a1.7 1.7 0 0 1-1.7 1.7H17M17 3.5H6.6a2 2 0 0 0-2 1.6l-1 5a2 2 0 0 0 2 2.4h4v3.6a3.4 3.4 0 0 0 3.4 3.4l2-6.2V3.5Z" />',
  share: '<circle cx="18" cy="5.5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="18.5" r="2.5" /><path d="m8.3 10.8 7.4-4M8.3 13.2l7.4 4" />',
  sparkles: '<path d="M12 3.5l1.7 4.6 4.6 1.7-4.6 1.7L12 16.1l-1.7-4.6-4.6-1.7 4.6-1.7L12 3.5Z" /><path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z" />',
  composite: '<rect x="3.5" y="3.5" width="17" height="17" rx="2.5" /><path d="m8.5 15 2.6-3.4 2.1 2.4 1.9-2.1 2.4 3.1" /><circle cx="9" cy="8.6" r="1.4" />',
  mic: '<rect x="9" y="3.5" width="6" height="10.5" rx="3" /><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" />',
  lock: '<rect x="4.5" y="10.5" width="15" height="9.5" rx="2" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14.5v2" />',
  'closed-captions': '<rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M10 10.2a2.4 2.4 0 1 0 0 3.6M17 10.2a2.4 2.4 0 1 0 0 3.6" />',
  chat: '<path d="M20.5 11.8a7 7 0 0 1-7 7H8.6L5 21v-3.6a7 7 0 0 1-1.5-4.4 7 7 0 0 1 7-7h3a7 7 0 0 1 7 6.8Z" />',
  send: '<path d="M20.5 3.5 3.5 10.4l7 2.1 2.1 7 7.9-16Z" /><path d="m10.5 12.5 4.2-4.2" />'
}

const glyph = computed(() => GLYPHS[props.name] ?? '')
</script>

<template>
  <svg
    class="icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
    v-html="glyph"
  />
</template>

<style scoped lang="scss">
.icon {
  display: block;
  flex: none;
  color: inherit;
}
</style>
