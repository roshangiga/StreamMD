import katex from 'katex'
import 'katex/contrib/mhchem'
import type { MarkedExtension } from 'marked'
import { KATEX_MACROS, normalizeKatexInput } from './katex-macros'
import { escapeHtml } from './html'

// Delimiter scanner written for StreamMD. Marked owns surrounding Markdown/code.
const pairs = [
  ['$$', '$$', true], ['\\[', '\\]', true],
  ['\\begin{equation}', '\\end{equation}', true],
  ['\\(', '\\)', false], ['$', '$', false],
  ['\\ce{', '}', false], ['\\pu{', '}', false]
] as const

function read(source: string, block: boolean) {
  for (const [open, close, displayMode] of pairs) {
    if (!source.startsWith(open) || block && !displayMode) continue
    if (open === '$' && source.startsWith('$$')) continue
    let depth = 1
    for (let end = open.length; end < source.length; end++) {
      if (close === '}') {
        if (source[end] === '{') depth++
        if (source[end] === '}') depth--
        if (depth !== 0) continue
      } else if (!source.startsWith(close, end)) {
        if (source[end] === '\\') end++
        if (open === '$' && source[end] === '\n') break
        continue
      }
      const raw = source.slice(0, end + close.length)
      if (block && !/^[ \t]*(?:\r?\n|$)/.test(source.slice(raw.length))) return
      const text = close === '}' ? raw : source.slice(open.length, end)
      if (!text.trim()) return
      return { type: block ? 'blockKatex' : 'inlineKatex', raw, text, displayMode }
    }
    return
  }
}

export function renderMath(source: string, displayMode = true): string {
  try {
    return katex.renderToString(normalizeKatexInput(source), {
      displayMode, throwOnError: false, strict: false, trust: false,
      maxExpand: 1000, maxSize: 20, macros: { ...KATEX_MACROS }, output: 'htmlAndMathml'
    })
  } catch { return `<code>${escapeHtml(source)}</code>` }
}

export function mathExtension(): MarkedExtension {
  return { extensions: [
    {
      name: 'inlineKatex', level: 'inline',
      start: source => { const i = source.search(/\$|\\(?:\(|\[|begin\{equation\}|ce\{|pu\{)/); return i < 0 ? undefined : i },
      tokenizer: source => read(source, false),
      renderer: token => renderMath(String(token.text), Boolean(token.displayMode))
    },
    {
      name: 'blockKatex', level: 'block',
      start: source => { const match = /(?:^|\n)(?=\$\$|\\\[|\\begin\{equation\})/.exec(source); return match ? match.index + match[0].length : undefined },
      tokenizer: source => read(source, true),
      renderer: token => renderMath(String(token.text), true)
    }
  ] }
}
