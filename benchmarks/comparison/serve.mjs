import { build, preview } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import { writeFile } from 'node:fs/promises'
const root = fileURLToPath(new URL('.', import.meta.url))
const checkpoints = {
  name: 'benchmark-checkpoints',
  configurePreviewServer(server) {
    server.middlewares.use('/__benchmark/checkpoint', async (req,res) => {
      if(req.method!=='POST'||req.headers.origin!=='http://127.0.0.1:3113') {res.statusCode=403;res.end();return}
      try {
        let body=''
        for await(const chunk of req) {body+=chunk; if(body.length>250000) throw new Error('Checkpoint too large')}
        const result=JSON.parse(body)
        if(![10,100,500].includes(result.kib)||!Array.isArray(result.rows)) throw new Error('Invalid checkpoint')
        await writeFile(new URL(`../results/comparison-${result.kib}-kib.json`,import.meta.url),JSON.stringify(result,null,2)+'\n')
        res.statusCode=204;res.end()
      } catch {res.statusCode=400;res.end('Invalid checkpoint')}
    })
  }
}
const config = { configFile: false, root, plugins: [tailwindcss(),checkpoints], resolve: { dedupe: ['vue', 'katex', 'mermaid'] }, publicDir: '../browser/public', build: { outDir: '../../comparison-dist', emptyOutDir: true }, preview: { host: '127.0.0.1', port: 3113, strictPort: true } }
await build(config)
const server = await preview(config)
server.printUrls()
