<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
const props = defineProps<{ open: boolean; title: string; theme: 'light' | 'dark' }>()
const emit = defineEmits<{ close: [] }>()
const dialog = ref<HTMLDialogElement>()
watch(() => props.open, async open => {
  await nextTick()
  if (open && !dialog.value?.open) dialog.value?.showModal()
  if (!open && dialog.value?.open) dialog.value.close()
}, { immediate: true })
</script>
<template>
  <dialog ref="dialog" class="vmr vmr-dialog" :data-theme="theme" :aria-label="title" @close="emit('close')" @click="event => { if (event.target === dialog) emit('close') }">
    <header><strong>{{ title }}</strong><button type="button" aria-label="Close preview" @click="emit('close')">Close</button></header>
    <div class="vmr-dialog-body"><slot v-if="open" /></div>
  </dialog>
</template>
