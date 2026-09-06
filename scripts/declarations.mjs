import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

// NodeNext needs explicit extensions even inside declaration re-exports.
// A .vue.js specifier resolves to the emitted .vue.d.ts declaration.
async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) { await visit(path); continue }
    if (!entry.name.endsWith('.d.ts')) continue
    const source = await readFile(path, 'utf8')
    const fixed = source.replace(/((?:from\s+|import\(\s*)['"])(\.[^'"]+)(['"])/g, (all, before, specifier, quote) => {
      if (/\.(?:js|mjs|cjs|json|css)$/.test(specifier)) return all
      return before + specifier + '.js' + quote
    })
    await writeFile(path, fixed)
  }
}
await visit('dist')
