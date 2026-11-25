<script setup lang="ts">
import { ref } from 'vue'
import type { Video } from '@/types'
import { useCatalog } from '@/composables/useCatalog'
import { apiSend, messageFor } from '@/utils/api'

const props = defineProps<{ video: Video }>()
const emit = defineEmits<{ removed: [id: string] }>()
const { subjects, patchVideo } = useCatalog()
const editing = ref(false)
const busy = ref(false)
const error = ref('')
const notice = ref('')
const title = ref('')
const description = ref('')
const subjectSlug = ref('')
const tags = ref('')

function edit() {
  const video = props.video
  title.value = video.title
  description.value = video.description
  subjectSlug.value = video.subjectSlug
  tags.value = video.tags.join(', ')
  editing.value = true
  error.value = notice.value = ''
}

async function save() {
  if (busy.value) return
  busy.value = true
  error.value = ''
  try {
    const { video } = await apiSend<{ video: Video }>(`/api/videos/${encodeURIComponent(props.video.id)}`, 'PUT', {
      title: title.value, description: description.value, subjectSlug: subjectSlug.value,
      tags: tags.value.split(',').map(tag => tag.trim()).filter(Boolean)
    })
    patchVideo(video.id, video)
    editing.value = false
    notice.value = 'Video details saved.'
  } catch (failure) {
    error.value = messageFor(failure)
  } finally {
    busy.value = false
  }
}

async function remove() {
  if (busy.value || !window.confirm(`Permanently delete "${props.video.title}" and its comments? This cannot be undone.`)) return
  busy.value = true
  error.value = notice.value = ''
  const id = props.video.id
  try {
    await apiSend(`/api/videos/${encodeURIComponent(id)}`, 'DELETE')
    emit('removed', id)
  } catch (failure) {
    error.value = messageFor(failure)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <section class="video-management mt-4" aria-label="Manage video">
    <div v-if="!editing" class="flex flex-wrap gap-2">
      <UButton variant="outline" :disabled="busy" @click="edit">Edit video</UButton>
      <UButton color="error" variant="outline" :loading="busy" @click="remove">Delete video</UButton>
    </div>
    <form v-else class="grid gap-3 rounded-lg border border-default p-4" @submit.prevent="save">
      <h2 class="font-semibold">Edit video details</h2>
      <label>Title<input v-model="title" required minlength="3" maxlength="140" /></label>
      <label>Description<textarea v-model="description" rows="4" required minlength="10" maxlength="5000" /></label>
      <label>Subject<select v-model="subjectSlug" required>
        <option v-for="subject in subjects" :key="subject.slug" :value="subject.slug">{{ subject.name }}</option>
      </select></label>
      <label>Tags (comma-separated, up to 8)<input v-model="tags" /></label>
      <div class="flex gap-2">
        <UButton type="submit" :loading="busy">Save changes</UButton>
        <UButton variant="ghost" :disabled="busy" @click="editing = false; error = ''">Cancel</UButton>
      </div>
    </form>
    <p v-if="error" class="text-error" role="alert">{{ error }}</p>
    <p role="status">{{ notice }}</p>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/scss/tokens' as *;
@use '@/assets/scss/mixins' as *;
.video-management :is(input, textarea, select) {
  display: block;
  width: 100%;
  padding: .5rem;
  border: 1px solid $color-border;
  border-radius: $radius-md;
  background: $color-surface;
  @include focus-ring;
}
</style>
