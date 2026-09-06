import { readFile, writeFile } from 'node:fs/promises'
const selected = await Promise.all([10,100,500].map(async kib => JSON.parse(await readFile(`benchmarks/results/comparison-${kib}-kib.json`, 'utf8'))))
if (selected.some(result => !result?.passed)) throw new Error('All three mixed sizes must have passing results before updating the README.')
if (selected.some((result,index)=>result.rows.length!==8||result.rows.some(row=>!row.passed||row.profile!=='mixed'||row.kib!==[10,100,500][index]))) throw new Error('Expected the complete mixed workload with passing warmups and measured trials.')
const median = values => [...values].sort((a,b)=>a-b)[Math.floor(values.length/2)]
let table = '| Size | StreamMD | Streamdown |\n| --- | ---: | ---: |\n'
const measurements = []
for (const result of selected) {
  const kib = result.rows[0].kib
  const intervalMs = kib === 500 ? 100 : 0
  const values = []
  const seconds = ['StreamMD','Streamdown'].map(name => {
    const rows = result.rows.filter(row=>row.renderer===name&&!row.warmup)
    if(rows.length!==3||rows.some(row=>!row.passed||row.intervalMs!==intervalMs)) throw new Error('Expected three passing measured trials with the documented delay for each renderer.')
    const value = median(rows.map(row=>row.totalReadyMs))/1000
    values.push(value)
    return value.toFixed(2)+' s'
  })
  table += `| ${kib} KiB | ${seconds.join(' | ')} |\n`
  measurements.push({kib,values})
  await writeFile(`benchmarks/results/comparison-${kib}-kib.json`, JSON.stringify(result,null,2)+'\n')
}
const method = 'Mixed content, 100 updates. Values are median total times from three trials after warmup, including math, highlighting, diagrams, images and automatic scrolling. The 10/100 KiB runs have no inserted delay; 500 KiB uses a 100 ms delay after each update for both libraries, included in the measured time.'
const links = '[10 KiB](benchmarks/results/comparison-10-kib.json) · [100 KiB](benchmarks/results/comparison-100-kib.json) · [500 KiB](benchmarks/results/comparison-500-kib.json)'
const summary = `<!-- comparison:start -->\n## Benchmarks\n\n${table}\n${method}\n\n![StreamMD versus Streamdown: median total seconds, lower is better](benchmarks/results/comparison.svg)\n\n[Method and reproduction](benchmarks/comparison/README.md). Raw results: ${links}.\n<!-- comparison:end -->\n`
let readme = (await readFile('README.md','utf8')).replace(/\r\n/g,'\n')
readme = readme.includes('<!-- comparison:start -->') ? readme.replace(/<!-- comparison:start -->[\s\S]*?<!-- comparison:end -->\n/,summary) : readme.replace('\n## What is included\n',`\n${summary}\n## What is included\n`)
if (!readme.includes(summary)) throw new Error('Could not locate the README benchmark insertion point.')
await writeFile('README.md',readme)
await writeFile('benchmarks/COMPARISON.md',`# StreamMD versus Streamdown\n\n${table}\n${method}\n\nAll measured and warmup rendering checks passed.\n\n![Comparison](results/comparison.svg)\n\nBrowser: ${selected[0].userAgent}\n\nReported logical processors: ${selected[0].hardwareConcurrency}.\n\nStreamMD 0.1.0 and Streamdown ${selected[0].versions.streamdown}; Vue ${selected[0].versions.vue}; React ${selected[0].versions.react}.\n\nMeasured ${selected.map(result=>result.timestamp).join(', ')}.\n\n[Method](comparison/README.md) · [Raw results](results/comparison.json)\n`)
// One shared, zero-based time axis keeps the bar lengths comparable.
const maximum = Math.max(...measurements.flatMap(row=>row.values)) * 1.15
const left = 100, width = 550, top = 86
let chart = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="390" viewBox="0 0 800 390" role="img" aria-labelledby="title desc"><title id="title">StreamMD versus Streamdown</title><desc id="desc">Median total seconds, lower is better. ${measurements.map(row=>`${row.kib} KiB: StreamMD ${row.values[0].toFixed(2)}, Streamdown ${row.values[1].toFixed(2)} seconds.`).join(' ')} 500 KiB includes a 100 ms delay per update for both libraries.</desc><rect width="800" height="390" fill="white"/><g font-family="system-ui, sans-serif" font-size="13" fill="#24292f"><text x="24" y="28" font-size="18" font-weight="600">StreamMD vs Streamdown</text><text x="24" y="50">Median total seconds · lower is better · mixed content</text>`
for(let tick=0;tick<=5;tick++) {
  const x=left+width*tick/5
  chart+=`<line x1="${x}" x2="${x}" y1="70" y2="320" stroke="#e2e5e9"/><text x="${x}" y="340" text-anchor="middle">${(maximum*tick/5).toFixed(1)} s</text>`
}
for(const [index,row] of measurements.entries()) {
  const y=top+index*80
  chart+=`<text x="24" y="${y+23}">${row.kib} KiB</text>`
  for(const [renderer,value] of row.values.entries()) {
    const bar=width*value/maximum, barY=y+renderer*28
    chart+=`<rect x="${left}" y="${barY}" width="${bar}" height="21" fill="${renderer===0?'#2563eb':'#64748b'}"/><text x="${left+bar+7}" y="${barY+15}">${value.toFixed(2)} s</text>`
  }
}
chart+='<rect x="450" y="18" width="12" height="12" fill="#2563eb"/><text x="468" y="29">StreamMD</text><rect x="575" y="18" width="12" height="12" fill="#64748b"/><text x="593" y="29">Streamdown</text><text x="24" y="377">500 KiB: 100 ms delay per update for both. 10/100 KiB: no inserted delay.</text></g></svg>'
await writeFile('benchmarks/results/comparison.svg',chart+'\n')
await writeFile('benchmarks/results/comparison.json',JSON.stringify(selected,null,2)+'\n')
console.log(table)
