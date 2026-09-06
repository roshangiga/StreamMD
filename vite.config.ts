import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: { entry: { core: 'src/core.ts', vue: 'src/index.ts' }, formats: ['es'], cssFileName: 'style' },
    rollupOptions: { external: id => ['vue', 'marked', 'katex', 'mermaid', 'remend', 'highlight.js'].some(name => id === name || id.startsWith(name + '/') && !id.endsWith('.css')) }
  },
  test: { environment: 'jsdom', include: ['tests/**/*.test.ts'] }
})
