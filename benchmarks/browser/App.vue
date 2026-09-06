<script setup lang="ts">
import { ref, nextTick, defineComponent, h, markRaw } from 'vue'
import { MarkdownRenderer, TokenView } from 'streammd/vue'
import { createMarkdownEngine, defineTag } from 'streammd'
import { profiles, makeFixture } from '../fixtures/index.mjs'
import pkg from '../../package.json'
const content = ref('')
const profile = ref('mixed')
const kib = ref(10)
const mode = ref('updates')
const trials = ref(3)
const interval = ref(16)
const chunks = ref(100)
const status = ref('Ready')
const busy = ref(false)
const host = ref<HTMLElement>()
const results = ref<any[]>([])
const engine = markRaw(createMarkdownEngine({ extensions: [defineTag('callout')] }))
const Callout = defineComponent({ props: ['token', 'engine', 'components', 'theme'], setup: props => () => h('aside', { 'data-callout': props.token.attributes.title }, [h('strong', props.token.attributes.title), h(TokenView, { tokens: props.token.tokens, engine: props.engine, components: props.components, theme: props.theme })]) })
const components = { callout: markRaw(Callout) }
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
const followOutput = () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })

async function trial(fixture: ReturnType<typeof makeFixture>, warmup: boolean) {
  content.value = ''
  await nextTick(); await delay(100)
  const durations: number[] = []
  const latencies: number[] = []
  let observer: PerformanceObserver | undefined
  if (PerformanceObserver.supportedEntryTypes.includes('longtask')) {
    observer = new PerformanceObserver(list => durations.push(...list.getEntries().map(entry => entry.duration)))
    observer.observe({ entryTypes: ['longtask'] })
  }
  const start = performance.now()
  let paragraph: Element | null = null
  let replacements = 0
  const updates = mode.value === 'static' ? 1 : chunks.value
  for (let chunk = 1; chunk <= updates; chunk++) {
    const delivered = performance.now()
    content.value = fixture.source.slice(0, Math.ceil(fixture.source.length * chunk / updates))
    await nextTick()
    latencies.push(performance.now() - delivered)
    followOutput()
    const current = host.value!.querySelector('p')
    if (paragraph && current !== paragraph) replacements++
    paragraph = current
    if (updates > 1) await delay(interval.value)
  }
  const domReadyMs = performance.now() - start
  // Explicitly render diagrams, including lazy import cost, after source delivery.
  for (const button of host.value!.querySelectorAll<HTMLButtonElement>('button')) {
    if (button.textContent === 'Diagram') button.click()
  }
  await nextTick()
  const expectedDiagrams = host.value!.querySelectorAll('.vmr-mermaid').length
  const deadline = performance.now() + 60000
  while (performance.now() < deadline) {
    const pending = host.value!.querySelector('[aria-busy="true"]')
    const images = [...host.value!.querySelectorAll('img')]
    if (!pending && images.every(image => image.complete)) break
    await delay(25)
  }
  await delay(100)
  followOutput()
  observer?.disconnect()
  const counts = Object.fromEntries([...new Set([...fixture.required, ...Object.keys(fixture.expectedCounts)])].map((selector: string) => [selector, host.value!.querySelectorAll(selector).length]))
  const errors = host.value!.querySelectorAll('[role="alert"], .katex-error').length
  const imageFailures = [...host.value!.querySelectorAll('img')].filter(image => !image.complete || image.naturalWidth === 0).length
  const diagrams = host.value!.querySelectorAll('.vmr-mermaid svg').length
  const complete = host.value!.textContent!.includes('DOCUMENT_COMPLETE')
  const passed = complete && Object.values(counts).every(count => Number(count) > 0) && Object.entries(fixture.expectedCounts).every(([selector, count]) => counts[selector] === count) && !errors && !imageFailures && diagrams === expectedDiagrams
  latencies.sort((a, b) => a - b)
  return { warmup, profile: fixture.profile, kib: fixture.kib, bytes: fixture.bytes, copies: fixture.copies, mode: mode.value, updates, requestedIntervalMs: interval.value, domReadyMs, totalReadyMs: performance.now() - start, medianDomCommitMs: latencies[Math.floor(latencies.length / 2)], p95DomCommitMs: latencies[Math.min(latencies.length - 1, Math.floor(latencies.length * .95))], longTasks: durations.length, longestTaskMs: Math.max(0, ...durations), totalLongTaskMs: durations.reduce((a, b) => a + b, 0), paragraphReplacements: replacements, expectedDiagrams, diagrams, counts, expectedCounts: fixture.expectedCounts, errors, imageFailures, complete, passed }
}
async function run() {
  if (busy.value) return
  busy.value = true
  try {
    if (!Number.isInteger(trials.value) || trials.value < 1 || trials.value > 10 || !Number.isInteger(chunks.value) || chunks.value < 1 || chunks.value > 1000 || !Number.isFinite(interval.value) || interval.value < 0 || interval.value > 1000) throw new Error('Use 1–10 trials, 1–1000 updates and a 0–1000 ms interval.')
    const fixture = makeFixture(profile.value, Number(kib.value))
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(fixture.source))
    const sha256 = [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('')
    const rows = []
    for (let i = 0; i <= trials.value; i++) {
      status.value = i === 0 ? 'Warmup running' : `Trial ${i}/${trials.value}`
      rows.push(await trial(fixture, i === 0))
    }
    const measured = rows.filter(row => !row.warmup).map(row => row.totalReadyMs).sort((a, b) => a - b)
    results.value.push({ version: pkg.version, timestamp: new Date().toISOString(), userAgent: navigator.userAgent, hardwareConcurrency: navigator.hardwareConcurrency, fixtureSha256: sha256, medianTotalMs: measured[Math.floor(measured.length / 2)], minTotalMs: measured[0], maxTotalMs: measured.at(-1), passed: rows.every(row => row.passed), rows })
    status.value = rows.every(row => row.passed) ? 'Complete — checks passed' : 'Complete — checks FAILED'
    await nextTick(); followOutput()
  } catch (error) { status.value = `Failed: ${String(error)}` }
  finally { busy.value = false }
}
function download() {
  const url = URL.createObjectURL(new Blob([JSON.stringify(results.value, null, 2)], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url; link.download = 'streammd-benchmark.json'
  document.body.append(link); link.click(); link.remove()
  // Give the browser time to begin reading the blob before releasing it.
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}
</script>
<template>
  <main>
    <h1>StreamMD benchmarks</h1>
    <p>Production build. Completion is always included. Timings cover DOM commits and asset readiness, not paint or network streaming.</p>
    <fieldset :disabled="busy">
      <label>Workload <select v-model="profile"><option v-for="name in profiles" :key="name">{{ name }}</option></select></label>
      <label>Size <select v-model.number="kib"><option v-for="size in [10, 100, 500]" :key="size" :value="size">{{ size }} KiB</option></select></label>
      <label>Mode <select v-model="mode"><option value="updates">Append-only updates</option><option value="static">Static render</option></select></label>
      <label>Trials <input v-model.number="trials" type="number" min="1" max="10"></label>
      <label>Updates <input v-model.number="chunks" type="number" min="1" max="1000"></label>
      <label>Interval (ms) <input v-model.number="interval" type="number" min="0" max="1000"></label>
      <button @click="run">Run benchmark</button>
    </fieldset>
    <p role="status">{{ status }}</p>
    <button :disabled="!results.length || busy" @click="download">Download results</button>
    <details open><summary>Raw results</summary><pre data-benchmark-results>{{ JSON.stringify(results, null, 2) }}</pre></details>
    <div ref="host" class="fixture"><MarkdownRenderer :content="content" :engine="engine" :components="components" theme="light" /></div>
  </main>
</template>
<style>
body { margin: 0; font: 15px/1.6 system-ui; color: #222; background: #fff; }
main { max-width: 900px; margin: 2rem auto; padding: 1rem; }
fieldset { display: flex; flex-wrap: wrap; gap: 1rem; border: 1px solid #bbb; }
label { display: flex; flex-direction: column; }
input { width: 6rem; }
button, select, input { font: inherit; padding: .35rem; }
pre { white-space: pre-wrap; max-height: 22rem; overflow: auto; font-size: 12px; }
.fixture { border-top: 1px solid #bbb; margin-top: 2rem; }
aside[data-callout] { border-left: 3px solid #5486b8; padding: .75rem; margin: 1rem 0; }
</style>
