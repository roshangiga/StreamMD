<script setup lang="ts">
import { ref, computed, markRaw } from 'vue'
import { MarkdownRenderer } from 'streammd/vue'
import { createMarkdownEngine, defineTag } from 'streammd'
import Callout from './Callout.vue'
import { sample } from './sample'
import gettingStarted from '../docs/getting-started.md?raw'
import api from '../docs/api.md?raw'
import extensions from '../docs/extensions.md?raw'
import rendering from '../docs/rendering.md?raw'
import termination from '../docs/termination.md?raw'
import benchmarks from '../benchmarks/README.md?raw'
const theme = ref<'light' | 'dark'>('light')
const page = ref('Playground')
const source = ref(sample)
const pages: Record<string, string> = { 'Getting started': gettingStarted, API: api, Extensions: extensions, Rendering: rendering, 'Unterminated blocks': termination, Benchmarks: benchmarks }
const engine = markRaw(createMarkdownEngine({ extensions: [defineTag('callout')] }))
const components = { callout: markRaw(Callout) }
const doc = computed(() => pages[page.value] || '')
</script>
<template>
  <div class="site" :class="theme">
    <header><a href="#" @click.prevent="page = 'Playground'" class="brand">StreamMD</a><span>Markdown for JavaScript</span><button @click="theme = theme === 'light' ? 'dark' : 'light'">{{ theme === 'light' ? 'Dark mode' : 'Light mode' }}</button></header>
    <nav aria-label="Documentation"><button v-for="name in ['Playground', ...Object.keys(pages)]" :key="name" :aria-current="page === name ? 'page' : undefined" @click="page = name">{{ name }}</button></nav>
    <main>
      <template v-if="page === 'Playground'">
        <h1>Markdown, with the details handled.</h1>
        <p>Built-in completion. Code, math, tables and diagrams. Your own custom components.</p>
        <div class="workspace">
          <section><label for="source">Markdown source</label><textarea id="source" v-model="source" spellcheck="false" /><button @click="source = sample">Reset example</button><button @click="source = '**An unfinished sentence'">Try incomplete Markdown</button></section>
          <section aria-label="Rendered Markdown"><MarkdownRenderer :content="source" :engine="engine" :components="components" :theme="theme" /></section>
        </div>
      </template>
      <MarkdownRenderer v-else :content="doc" :theme="theme" />
    </main>
    <footer>StreamMD · MIT licence · JavaScript core and Vue 3 integration</footer>
  </div>
</template>
<style>
* { box-sizing: border-box; }
body { margin: 0; font: 15px/1.6 system-ui, sans-serif; }
.site { min-height: 100vh; background: #fff; color: #30343b; }
.site.dark { background: #151719; color: #d9dcdf; }
.site > header { display: flex; align-items: center; gap: 1.5rem; padding: 1rem 4vw; border-bottom: 1px solid #8885; }
.site > header button { margin-left: auto; }
.brand { font-weight: 750; font-size: 1.3rem; color: inherit; text-decoration: none; }
nav { padding: .75rem 4vw; display: flex; flex-wrap: wrap; gap: .5rem; }
button { font: inherit; padding: .35rem .65rem; color: inherit; background: transparent; border: 1px solid #8886; border-radius: .3rem; cursor: pointer; }
button[aria-current] { border-color: currentColor; font-weight: 600; }
main { max-width: 1250px; padding: 1rem 4vw 3rem; margin: auto; }
h1 { font-size: 2rem; line-height: 1.2; }
.workspace { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 2rem; margin-top: 2rem; }
.workspace > section { min-width: 0; }
label { display: block; margin-bottom: .5rem; font-weight: 600; }
textarea { width: 100%; height: 65vh; resize: vertical; padding: 1rem; font: 13px/1.6 monospace; border: 1px solid #8886; border-radius: .3rem; background: transparent; color: inherit; }
footer { padding: 1rem 4vw; border-top: 1px solid #8885; font-size: .8rem; }
@media(max-width: 760px) { .workspace { grid-template-columns: 1fr; } .site > header span { display: none; } }
</style>
