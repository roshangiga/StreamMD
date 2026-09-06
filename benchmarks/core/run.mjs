import { createMarkdownEngine, defineTag } from '../../dist/core.js'
import { makeFixture, profiles } from '../fixtures/index.mjs'
import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import os from 'node:os'
const engine = createMarkdownEngine({ extensions: [defineTag('callout')] })
const rows = []
for (const profile of profiles) for (const kib of [10, 100, 500]) {
  const fixture = makeFixture(profile, kib)
  for (const operation of ['tokenize', 'renderHtml']) {
    engine[operation](fixture.source)
    const samples = []
    for (let trial = 0; trial < 3; trial++) {
      const start = performance.now(); engine[operation](fixture.source); samples.push(performance.now() - start)
    }
    const sorted = [...samples].sort((a, b) => a - b)
    rows.push({ profile, kib, operation, bytes: fixture.bytes, sha256: createHash('sha256').update(fixture.source).digest('hex'), samplesMs: samples, medianMs: sorted[1], minMs: sorted[0], maxMs: sorted[2] })
  }
  console.log(`${profile} ${kib} KiB complete`)
}
await mkdir('benchmarks/results', { recursive: true })
await writeFile('benchmarks/results/core.json', JSON.stringify({ date: new Date().toISOString(), node: process.version, platform: process.platform, arch: process.arch, cpu: os.cpus()[0]?.model, note: 'Completion included. Core HTML timings do not include Vue, syntax highlighting, Mermaid SVG, image decoding or layout.', rows }, null, 2) + '\n')
