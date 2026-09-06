<script setup lang="ts">
import { computed, ref } from 'vue'
import { highlightCode } from '../utils/highlight'
import MermaidBlock from './MermaidBlock.vue'
import ExpandDialog from './ExpandDialog.vue'
import { useCopy } from '../utils/useCopy'
import ControlIcon from './ControlIcon.vue'
const props = withDefaults(defineProps<{ code: string; lang?: string; theme?: 'light' | 'dark'; mermaid?: boolean }>(), { theme: 'light', mermaid: true })
const language = computed(() => props.lang?.split(/\s/)[0] || 'text')
const highlighted = computed(() => highlightCode(props.code, language.value))
const diagram = ref(false)
const expanded = ref(false)
const { copy, copied, error } = useCopy()
</script>
<template>
  <section class="vmr vmr-codeblock" :data-theme="theme">
    <header class="vmr-codeblock-header">
      <span class="vmr-codeblock-lang">{{ language }}</span>
      <div class="vmr-actions">
        <button type="button" class="vmr-icon-button" aria-label="Copy code" :title="copied ? 'Copied' : 'Copy code'" @click="copy(code)"><ControlIcon :name="copied ? 'check' : 'copy'" /><span class="vmr-sr-only" aria-live="polite">{{ copied ? 'Copied' : '' }}</span></button>
        <button v-if="language === 'mermaid' && mermaid" type="button" :aria-pressed="diagram" @click="diagram = !diagram">{{ diagram ? 'Code' : 'Diagram' }}</button>
        <button type="button" class="vmr-icon-button" aria-label="Expand code block" title="Expand code block" @click="expanded = true"><ControlIcon name="expand" /></button>
      </div>
    </header>
    <MermaidBlock v-if="diagram && language === 'mermaid' && mermaid" :code="code" :theme="theme" />
    <div v-else class="vmr-codeblock-scroll"><pre class="vmr-codeblock-pre"><code v-html="highlighted" /></pre></div>
    <p v-if="error" role="status">{{ error }}</p>
    <ExpandDialog :open="expanded" :title="`${language} preview`" :theme="theme" @close="expanded = false">
      <MermaidBlock v-if="diagram && language === 'mermaid' && mermaid" :code="code" :theme="theme" />
      <pre v-else class="vmr-codeblock-pre"><code v-html="highlighted" /></pre>
    </ExpandDialog>
  </section>
</template>
