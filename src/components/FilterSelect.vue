<script setup lang="ts" generic="T extends string">
import AppIcon from './AppIcon.vue'
import { computed } from 'vue'

const props = defineProps<{ id: string; items: { label: string; value: T }[] }>()
const selected = defineModel<T>({ required: true })
const options = computed<{ label: string; value: string }[]>(() => props.items)
function choose(value: string) {
  const option = props.items.find(item => item.value === value)
  if (option) selected.value = option.value
}
</script>

<template>
  <USelect
    :id="id"
    :model-value="selected"
    :items="options"
    @update:model-value="choose"
    :content="{ position: 'popper', sideOffset: 6 }"
    :ui="{
      base: 'h-[2.75rem] w-full justify-start cursor-pointer rounded-md bg-default text-default ps-2.5 pe-9',
      trailing: 'pe-2.5 text-muted',
      content: 'rounded-md bg-default ring-1 ring-default shadow-md',
      viewport: 'p-1',
      item: 'min-h-8 px-2 text-sm text-default cursor-pointer',
      itemTrailing: 'ms-auto',
      itemTrailingIcon: 'hidden'
    }"
  >
    <template #trailing><AppIcon name="chevron-down" :size="16" /></template>
    <template #item-trailing="{ item }">
      <AppIcon v-if="item.value === selected" name="check" :size="16" />
    </template>
  </USelect>
</template>
