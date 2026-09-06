<script setup lang="ts">
import { computed, type Component } from 'vue'
import { defaultEngine, type MarkdownEngine } from './parser'
import TokenTree from './components/TokenTree.vue'

const props = withDefaults(defineProps<{
  content: string
  theme?: 'light' | 'dark'
  mermaid?: boolean
  engine?: MarkdownEngine
  components?: Record<string, Component>
}>(), { theme: 'light', mermaid: true })
const engine = computed(() => props.engine || defaultEngine)
const tokens = computed(() => engine.value.tokenize(props.content))
</script>

<template>
  <div class="vmr" :data-theme="theme">
    <TokenTree :tokens="tokens" :theme="theme" :mermaid="mermaid" :engine="engine" :components="components" />
  </div>
</template>
