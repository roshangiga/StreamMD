import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { mkdtemp, writeFile, readFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
const require = createRequire(import.meta.url)
const npm = process.env.npm_execpath
if (!npm) throw new Error('Run through npm run release:check')
function run(args, cwd = process.cwd()) {
  const result = spawnSync(process.execPath, [npm, ...args], { cwd, stdio: 'inherit' })
  if (result.status !== 0) throw new Error(`npm ${args.join(' ')} failed`)
}
for (const script of ['build', 'test', 'typecheck', 'docs:build']) run(['run', script])
const pack = spawnSync(process.execPath, [npm, 'pack', '--ignore-scripts', '--json'], { encoding: 'utf8' })
if (pack.status !== 0) throw new Error(pack.stderr)
const item = JSON.parse(pack.stdout)[0]
for (const expected of ['dist/core.js', 'dist/vue.js', 'dist/style.css', 'dist/core.d.ts', 'LICENSE', 'THIRD_PARTY_NOTICES.md']) {
  if (!item.files.some(file => file.path === expected)) throw new Error(`Missing ${expected}`)
}
if (item.files.some(file => /(?:^|\/)(?:\.env|node_modules|demo|tests)(?:\/|$)/.test(file.path))) throw new Error('Unexpected files in package')
const consumer = await mkdtemp(join(tmpdir(), 'streammd-consumer-'))
await writeFile(join(consumer, 'package.json'), JSON.stringify({ name: 'streammd-consumer-check', private: true, type: 'module' }))
run(['install', '--no-audit', '--no-fund', join(process.cwd(), item.filename)], consumer)
await writeFile(join(consumer, 'core.mjs'), `import { createMarkdownEngine } from 'streammd';\nimport { createRequire } from 'node:module';\nconst require = createRequire(import.meta.url);\ntry { require.resolve('vue'); throw new Error('Core-only install unexpectedly includes Vue'); } catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; }\nif (!createMarkdownEngine().renderHtml('**works').includes('<strong>works</strong>')) throw new Error('Core failed');\n`)
let result = spawnSync(process.execPath, ['core.mjs'], { cwd: consumer, stdio: 'inherit' })
if (result.status) throw new Error('Core consumer failed')
const vueVersion = require('vue/package.json').version
const viteVersion = require('vite/package.json').version
run(['install', '--no-audit', '--no-fund', `vue@${vueVersion}`, `vite@${viteVersion}`], consumer)
await writeFile(join(consumer, 'index.html'), '<!doctype html><html><head><title>StreamMD consumer</title></head><body><div id="app"></div><script type="module" src="/main.js"></script></body></html>')
await writeFile(join(consumer, 'main.js'), `import { createApp, h } from 'vue';\nimport { MarkdownRenderer } from 'streammd/vue';\nimport 'streammd/style.css';\ncreateApp({ render: () => h(MarkdownRenderer, { content: '# Installed package\\n\\n$x^2$\\n\\n~~~mermaid\\ngraph LR; A-->B\\n~~~' }) }).mount('#app');\n`)
await writeFile(join(consumer, 'smoke.mjs'), `import { h } from 'vue';\nimport { renderToString } from '@vue/server-renderer';\nimport { MarkdownRenderer } from 'streammd/vue';\nconst html = await renderToString(h(MarkdownRenderer, { content: '**Installed** $x^2$' }));\nif (!html.includes('<strong>Installed</strong>') || !html.includes('katex')) throw new Error('SSR failed');\n`)
result = spawnSync(process.execPath, ['smoke.mjs'], { cwd: consumer, stdio: 'inherit' })
if (result.status) throw new Error('Vue consumer SSR failed')
await writeFile(join(consumer, 'types.mts'), `import { createMarkdownEngine } from 'streammd';\nimport { MarkdownRenderer } from 'streammd/vue';\nconst engine = createMarkdownEngine();\nconst tokens = engine.tokenize('hello');\nconst props: InstanceType<typeof MarkdownRenderer>['$props'] = { content: 'hello', theme: 'dark' };\n// @ts-expect-error Source must be a string\nengine.tokenize(123);\n// @ts-expect-error Invalid theme\nprops.theme = 'invalid';\n`)
result = spawnSync(process.execPath, [require.resolve('typescript/bin/tsc'), '--noEmit', '--strict', '--skipLibCheck', '--module', 'NodeNext', '--moduleResolution', 'NodeNext', '--target', 'ES2022', 'types.mts'], { cwd: consumer, stdio: 'inherit' })
if (result.status) throw new Error('Installed package declarations failed')
result = spawnSync(process.execPath, [join(consumer, 'node_modules/vite/bin/vite.js'), 'build'], { cwd: consumer, stdio: 'inherit' })
if (result.status) throw new Error('Vue consumer build failed')
await mkdir('docs/evidence', { recursive: true })
await writeFile('docs/evidence/package-check.json', JSON.stringify({ timestamp: new Date().toISOString(), node: process.version, tarball: item.filename, files: item.files.length, bytes: item.size, checks: ['tests', 'types', 'library build', 'docs build', 'pack manifest', 'core-only install without Vue', 'core Node import', 'Vue SSR from installed package', 'installed package TypeScript declarations', 'consumer production build'] }, null, 2) + '\n')
console.log(`Release checks passed. Consumer app: ${consumer}`)
