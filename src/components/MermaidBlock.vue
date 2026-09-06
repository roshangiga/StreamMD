<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { renderDiagram } from '../utils/mermaid'
const props = withDefaults(defineProps<{ code: string; theme?: 'light' | 'dark' }>(), { theme: 'light' })
const svg = ref('')
const error = ref('')
const busy = ref(false)
let version = 0
async function render() {
  const current = ++version
  busy.value = true
  error.value = ''
  svg.value = ''
  try {
    const result = await renderDiagram(props.code, props.theme === 'dark')
    if (current === version) svg.value = result
  } catch {
    if (current === version) error.value = 'Unable to render this Mermaid diagram. Check the source syntax.'
  } finally { if (current === version) busy.value = false }
}
onMounted(render)
watch([() => props.code, () => props.theme], render)
onBeforeUnmount(() => { version++ })
</script>
<template>
  <div class="vmr vmr-mermaid" :data-theme="theme" :aria-busy="busy">
    <span v-if="busy" role="status">Rendering diagram…</span>
    <p v-else-if="error" role="alert">{{ error }}</p>
    <div v-else role="img" aria-label="Mermaid diagram" v-html="svg" />
  </div>
</template>
