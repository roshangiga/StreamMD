import { createApp, h, shallowRef, nextTick } from 'vue'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { Streamdown } from 'streamdown'
import { createMathPlugin } from '@streamdown/math'
import { code } from '@streamdown/code'
import { mermaid } from '@streamdown/mermaid'
import { MarkdownRenderer } from '../../dist/vue.js'
import { sharedFixture } from './fixtures.mjs'
import pkg from './package.json'
import '../../dist/style.css'
import 'streamdown/styles.css'
import './style.css'

const host = document.querySelector('#fixture')
const status = document.querySelector('#status')
const results = []
const tasks = new MessageChannel()
const pendingTasks = []
tasks.port1.onmessage = () => pendingTasks.shift()?.()
const nextTask = () => new Promise(resolve => { pendingTasks.push(resolve); tasks.port2.postMessage(null) })
const followOutput = () => window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'})
const plugins = { math: createMathPlugin({ singleDollarTextMath: true }), code, mermaid }
const median = values => [...values].sort((a,b)=>a-b)[Math.floor(values.length/2)]

function mountRenderer(name) {
  if (name === 'StreamMD') {
    const source = shallowRef('')
    const app = createApp({ setup: () => () => h(MarkdownRenderer, { content: source.value, theme: 'light' }) })
    app.mount(host)
    return { update: async text => { source.value = text; await nextTick() }, unmount: () => app.unmount() }
  }
  const root = createRoot(host)
  return {
    update: async (text, final) => flushSync(() => root.render(React.createElement(Streamdown, { plugins, mode:'streaming', parseIncompleteMarkdown:true, animated:false, isAnimating:!final, remend:{linkMode:'text-only'}, lineNumbers:false }, text))),
    unmount: () => root.unmount()
  }
}

async function trial(name, fixture, warmup, intervalMs, progress) {
  const renderer = mountRenderer(name)
  await nextTask()
  const latencies = [], longTasks = []
  const observer = PerformanceObserver.supportedEntryTypes.includes('longtask') ? new PerformanceObserver(list => longTasks.push(...list.getEntries().map(entry=>entry.duration))) : null
  observer?.observe({entryTypes:['longtask']})
  try {
    const start = performance.now()
    for(let i=1;i<=100;i++) {
      const tick = performance.now()
      await renderer.update(fixture.source.slice(0,Math.ceil(fixture.source.length*i/100)),i===100)
      latencies.push(performance.now()-tick)
      followOutput()
      if (i % 10 === 0) progress(i)
      if (intervalMs > 0) await new Promise(resolve => setTimeout(resolve, intervalMs))
      else await nextTask()
    }
    const domReadyMs = performance.now()-start
    if(name==='StreamMD') for(const button of host.querySelectorAll('button')) if(button.textContent==='Diagram') button.click()
    const expectedHighlights = ['code','mixed'].includes(fixture.profile) ? fixture.copies*3 : 0
    const highlighted = () => [...host.querySelectorAll('pre')].filter(pre => pre.querySelector('span[class*="hljs-"], span[style*="--sdm-c:"]')).length
    const ready = () => Object.entries(fixture.counts).every(([selector,count])=>host.querySelectorAll(selector).length===count)
      && [...host.querySelectorAll('img')].every(img=>img.complete&&img.naturalWidth>0)
      && highlighted()>=expectedHighlights
    await new Promise(resolve => {
      let finished = false
      const finish = () => { if(finished) return; finished=true; clearTimeout(timeout); changes.disconnect(); host.removeEventListener('load',check,true); host.removeEventListener('error',check,true); resolve() }
      const check = () => { if(ready()) finish() }
      const changes = new MutationObserver(check)
      const timeout = setTimeout(finish,60000)
      changes.observe(host,{childList:true,subtree:true,attributes:true})
      host.addEventListener('load',check,true); host.addEventListener('error',check,true)
      check()
    })
    followOutput()
    const totalReadyMs = performance.now()-start
    const counts = Object.fromEntries(Object.keys(fixture.counts).map(selector=>[selector,host.querySelectorAll(selector).length]))
    const errors = host.querySelectorAll('.katex-error,[role="alert"]').length
    const passed = ready() && !errors && host.textContent.includes('DOCUMENT_COMPLETE')
    return { renderer:name, warmup, profile:fixture.profile, kib:fixture.kib, bytes:fixture.bytes, updates:100, intervalMs, scheduler:intervalMs > 0 ? `setTimeout, ${intervalMs} ms after each update` : 'MessageChannel, no inserted timer delays', domReadyMs, totalReadyMs, medianCommitMs:median(latencies), p95CommitMs:[...latencies].sort((a,b)=>a-b)[94], longTasks:longTasks.length, longestTaskMs:Math.max(0,...longTasks), counts, expectedCounts:fixture.counts, highlightedBlocks:highlighted(), expectedHighlights, errors, passed }
  } finally { observer?.disconnect(); renderer.unmount(); await nextTask() }
}

document.querySelector('#run').onclick = async () => {
  const controls=[...document.querySelectorAll('main > button,select')]
  controls.forEach(control=>control.disabled=true)
  try {
    const fixture=sharedFixture('mixed',Number(document.querySelector('#size').value))
    const intervalMs = fixture.kib === 500 ? 100 : 0
    const sha256=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(fixture.source)))].map(b=>b.toString(16).padStart(2,'0')).join('')
    const rows=[]
    const result={kib:fixture.kib,timestamp:new Date().toISOString(),userAgent:navigator.userAgent,hardwareConcurrency:navigator.hardwareConcurrency,versions:pkg.dependencies,fixtureSha256:sha256,complete:false,passed:false,rows}
    const checkpoint=async()=>{const response=await fetch('/__benchmark/checkpoint',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(result)});if(!response.ok)throw new Error('Checkpoint could not be saved')}
    results.push(result)
    for(let round=0;round<=3;round++) {
      for(const name of round%2 ? ['Streamdown','StreamMD'] : ['StreamMD','Streamdown']) {
        const stage=`${fixture.profile} ${fixture.kib} KiB (${intervalMs} ms delay): ${round ? `trial ${round}/3`:'warmup'} ${name}`
        status.textContent=stage
        result.progress={renderer:name,round,update:0}
        await checkpoint()
        rows.push(await trial(name,fixture,round===0,intervalMs,update=>{
          status.textContent=`${stage}, update ${update}/100`
          result.progress.update=update
          if(intervalMs>0) void checkpoint().catch(()=>{})
        }))
        document.querySelector('#results').textContent=JSON.stringify(results,null,2)
        await checkpoint()
      }
    }
    result.complete=true
    result.passed=rows.every(row=>row.passed)
    await checkpoint()
    document.querySelector('#results').textContent=JSON.stringify(results,null,2)
    status.textContent=rows.every(row=>row.passed)?'Complete: checks passed':'Complete: checks FAILED'
    followOutput()
  } catch(error) {status.textContent=`Failed: ${String(error)}`}
  finally {controls.forEach(control=>control.disabled=false)}
}
document.querySelector('#download').onclick = () => {
  const url=URL.createObjectURL(new Blob([JSON.stringify(results,null,2)],{type:'application/json'}))
  const link=document.createElement('a');link.href=url;link.download='streammd-vs-streamdown.json';document.body.append(link);link.click();link.remove()
  setTimeout(()=>URL.revokeObjectURL(url),10000)
}
