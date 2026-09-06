<script setup lang="ts">
import { MarkdownRenderer } from 'streammd/vue'
import { sample } from './sample'

const mixed = sample.split('\n## Diagrams')[0]
</script>

<template>
  <main class="theme-preview">
    <section v-for="theme in ['light', 'dark'] as const" :key="theme" :class="theme" :aria-label="`${theme} theme`">
      <div class="theme-label">{{ theme }} mode</div>
      <MarkdownRenderer :content="mixed" :theme="theme" />
    </section>
  </main>
</template>

<style>
* { box-sizing: border-box; }
html, body { margin: 0; }
body { font-family: system-ui, sans-serif; font-size: 15px; }
.theme-preview { display: grid; grid-template-columns: 1fr 1fr; }
.theme-preview > section { min-width: 0; padding: 28px 36px 24px; }
.light { background: #fff; color: #24292f; }
.dark { background: #151719; color: #d9dcdf; }
.theme-label { margin-bottom: 16px; font-size: 11px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; opacity: .65; }
</style>
