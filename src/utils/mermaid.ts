import { getMermaidThemeConfig, applyMermaidSvgTheme } from './mermaid-theme'
let sequence = 0
let queue: Promise<unknown> = Promise.resolve()

// Mermaid owns global configuration. Serialize theme selection and rendering so
// two instances with different themes cannot overwrite each other's settings.
export function renderDiagram(code: string, dark: boolean): Promise<string> {
  const task = queue.catch(() => {}).then(async () => {
    if (/%%\s*\{|^\s*---/.test(code)) throw new Error('Embedded Mermaid configuration is disabled.')
    if (code.length > 100_000) throw new RangeError('Diagram exceeds 100,000 characters.')
    const { default: mermaid } = await import('mermaid')
    mermaid.initialize({ ...getMermaidThemeConfig(dark), securityLevel: 'strict', startOnLoad: false, suppressErrorRendering: true })
    const result = await mermaid.render(`vmr-diagram-${++sequence}`, code)
    return applyMermaidSvgTheme(result.svg, dark)
  })
  queue = task
  return task
}
