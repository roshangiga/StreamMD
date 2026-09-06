import { readFile, writeFile } from 'node:fs/promises'
import { scaleLinear } from 'd3-scale'
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
const method = 'Mixed content, 100 updates, including math, highlighting, diagrams, images and automatic scrolling. No added delay at 10/100 KiB; 500 KiB adds 100 ms per update for both libraries, counted in the total.'
const links = '[10 KiB](benchmarks/results/comparison-10-kib.json) · [100 KiB](benchmarks/results/comparison-100-kib.json) · [500 KiB](benchmarks/results/comparison-500-kib.json)'
const summary = `## Benchmarks\n\n${table}\n${method}\n\n![StreamMD versus Streamdown benchmark results](benchmarks/results/streammd-vs-streamdown.svg)\n\n[Method and reproduction](benchmarks/comparison/README.md). Raw results: ${links}.\n`
let readme = (await readFile('README.md','utf8')).replace(/\r\n/g,'\n')
readme = readme.replace(/<!-- comparison:(?:start|end) -->\n?/g,'')
readme = readme.replace(/\n## Benchmarks\n[\s\S]*?(?=\n## |$)/,'\n')
readme = readme.replace('\n## Install\n',`\n${summary}\n## Install\n`)
readme = readme.replace(/\n{3,}(?=## )/g,'\n\n')
if (!readme.includes(summary)) throw new Error('Could not locate the README benchmark insertion point.')
await writeFile('README.md',readme)
await writeFile('benchmarks/COMPARISON.md',`# StreamMD versus Streamdown\n\n${table}\n${method}\n\nAll measured and warmup rendering checks passed.\n\n![Comparison](results/streammd-vs-streamdown.svg)\n\nBrowser: ${selected[0].userAgent}\n\nReported logical processors: ${selected[0].hardwareConcurrency}.\n\nStreamMD 0.1.0 and Streamdown ${selected[0].versions.streamdown}; Vue ${selected[0].versions.vue}; React ${selected[0].versions.react}.\n\nMeasured ${selected.map(result=>result.timestamp).join(', ')}.\n\n[Method](comparison/README.md) · [Raw results](results/comparison.json)\n`)
// Independent, zero-based scales make every document size readable.
const left = 100, width = 550, top = 90
let chart = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="533" viewBox="0 0 800 533" role="img" aria-labelledby="title desc"><title id="title">StreamMD versus Streamdown</title><desc id="desc">${measurements.map(row=>`${row.kib} KiB: StreamMD ${row.values[0].toFixed(2)}, Streamdown ${row.values[1].toFixed(2)} seconds.`).join(' ')}</desc><rect width="800" height="533" fill="white"/><g font-family="system-ui, sans-serif" font-size="13" fill="#24292f"><text x="24" y="28" font-size="18" font-weight="600">StreamMD vs Streamdown</text><text x="24" y="50">Lower is better · mixed content</text>`
for(const [index,row] of measurements.entries()) {
  const y=top+index*145
  const scale=scaleLinear().domain([0,Math.max(...row.values)]).range([0,width]).nice(5)
  const format=scale.tickFormat(5)
  chart+=`<text x="24" y="${y-12}" font-size="15" font-weight="600">${row.kib} KiB</text>`
  for(const tick of scale.ticks(5)) {
    const x=left+scale(tick)
    chart+=`<line x1="${x}" x2="${x}" y1="${y-2}" y2="${y+70}" stroke="#e2e5e9"/><text x="${x}" y="${y+92}" text-anchor="middle" fill="#57606a">${format(tick)} s</text>`
  }
  for(const [renderer,value] of row.values.entries()) {
    const bar=scale(value), barY=y+renderer*34
    chart+=`<rect x="${left}" y="${barY}" width="${bar}" height="24" fill="${renderer===0?'#2563eb':'#64748b'}"/><text x="${left+bar+8}" y="${barY+17}" font-weight="600">${value.toFixed(2)} s</text>`
  }
}
chart+='<rect x="450" y="18" width="12" height="12" fill="#2563eb"/><text x="468" y="29">StreamMD</text><rect x="575" y="18" width="12" height="12" fill="#64748b"/><text x="593" y="29">Streamdown</text></g></svg>'
await writeFile('benchmarks/results/streammd-vs-streamdown.svg',chart+'\n')
await writeFile('benchmarks/results/comparison.json',JSON.stringify(selected,null,2)+'\n')
console.log(table)
