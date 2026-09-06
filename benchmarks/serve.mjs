import { build, preview } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
const root = fileURLToPath(new URL('./browser', import.meta.url))
const config = { configFile: false, root, plugins: [vue()], build: { outDir: '../../benchmark-dist', emptyOutDir: true }, preview: { host: '127.0.0.1', port: 3110, strictPort: true } }
await build(config)
const server = await preview(config)
server.printUrls()
