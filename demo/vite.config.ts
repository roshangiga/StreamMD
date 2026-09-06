import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)), plugins: [vue()],
  base: './', build: { outDir: '../demo-dist', emptyOutDir: true },
  server: { port: 3111, strictPort: true }
})
