import { readFile, writeFile } from 'node:fs/promises'
let report = '# Recorded benchmark results\n\nGenerated from raw JSON. These measurements belong to this machine and configuration, not a universal speed claim.\n\n'
try {
  const core = JSON.parse(await readFile('benchmarks/results/core.json', 'utf8'))
  report += `## Core CPU\n\n${core.date}; ${core.node}; ${core.platform}/${core.arch}; ${core.cpu}.\n\nCompletion is included. HTML timings exclude Vue, highlighting, Mermaid SVG and layout.\n\n| Profile | Target KiB | Tokenize median ms | HTML median ms |\n| --- | ---: | ---: | ---: |\n`
  for (const row of core.rows.filter(row => row.operation === 'tokenize')) {
    const html = core.rows.find(other => other.profile === row.profile && other.kib === row.kib && other.operation === 'renderHtml')
    report += `| ${row.profile} | ${row.kib} | ${row.medianMs.toFixed(2)} | ${html.medianMs.toFixed(2)} |\n`
  }
  report += '\n[Raw core data](results/core.json)\n'
} catch (error) { if (error.code !== 'ENOENT') throw error }
try {
  const browser = JSON.parse(await readFile('benchmarks/results/browser.json', 'utf8'))
  report += '\n## Browser\n\nWarmups excluded from medians. Total time includes DOM updates and diagram/image readiness. Single-trial runs have no statistical spread.\n\n| Profile | Target KiB | Mode | Trials | Total median ms | Checks |\n| --- | ---: | --- | ---: | ---: | --- |\n'
  for (const result of browser) {
    const row = result.rows.find(row => !row.warmup)
    report += `| ${row.profile} | ${row.kib} | ${row.mode} | ${result.rows.length - 1} | ${result.medianTotalMs.toFixed(2)} | ${result.passed ? 'PASS' : 'FAIL'} |\n`
  }
  report += '\n[Raw browser data](results/browser.json)\n'
} catch (error) { if (error.code !== 'ENOENT') throw error }
await writeFile('benchmarks/RESULTS.md', report)
console.log('Wrote benchmarks/RESULTS.md')
