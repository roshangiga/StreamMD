import { readFile, appendFile, cp, mkdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
const require = createRequire(import.meta.url)
const katex = dirname(require.resolve('katex/package.json'))
await appendFile('dist/style.css', '\n' + await readFile(join(katex, 'dist/katex.min.css'), 'utf8'))
await mkdir('dist/fonts', { recursive: true })
await cp(join(katex, 'dist/fonts'), 'dist/fonts', { recursive: true })
