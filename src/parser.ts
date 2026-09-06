import { Marked, Parser, type MarkedExtension, type Token } from 'marked'
import { mathExtension, renderMath } from './utils/math-extension'
import { escapeHtml } from './utils/html'
import { disableSingleTilde } from './utils/strikethrough-extension'
import { completeMarkdown } from './completion'

export type MathToken = Token & { text: string; displayMode: boolean }
export interface StreamMDExtension {
  name: string
  tags?: readonly string[]
  marked: Pick<MarkedExtension, 'extensions' | 'renderer' | 'tokenizer' | 'walkTokens'>
}
export interface MarkdownEngine {
  tokenize(source: string): Token[]
  renderInline(tokens: Token[]): string
  renderHtml(source: string): string
}
export type MarkdownParser = MarkdownEngine
const reserved = new Set(['paragraph', 'text', 'heading', 'code', 'list', 'blockquote', 'table', 'html', 'space', 'inlineKatex', 'blockKatex'])
const reservedTags = new Set(['script', 'style', 'iframe', 'object', 'embed', 'svg', 'math', 'a', 'img', 'input', 'form', 'pre', 'code', 'p', 'div', 'span', 'table'])

export function createMarkdownEngine(options: { extensions?: readonly StreamMDExtension[] } = {}): MarkdownEngine {
  const names = new Set<string>()
  const tags = new Set<string>()
  for (const extension of options.extensions || []) {
    if ((extension.marked as MarkedExtension).async || (extension.marked as MarkedExtension).hooks) throw new TypeError('StreamMD supports synchronous tokenizers, renderers and visitors, not async mode or parser hooks.')
    if (!/^[a-z][\w-]*$/i.test(extension.name) || names.has(extension.name) || reserved.has(extension.name)) throw new Error(`Invalid or duplicate extension name: ${extension.name}`)
    names.add(extension.name)
    for (const tag of extension.tags || []) {
      if (!/^[a-z][a-z0-9-]*$/.test(tag) || tags.has(tag) || reservedTags.has(tag)) throw new Error(`Invalid or duplicate tag: ${tag}`)
      tags.add(tag)
    }
  }
  const marked = new Marked({ gfm: true, breaks: true })
  marked.use(mathExtension(), disableSingleTilde as MarkedExtension)
  marked.use({ renderer: {
    html: token => escapeHtml(token.text),
    link(token) {
      const body = this.parser.parseInline(token.tokens)
      const href = safeUrl(token.href)
      return href ? `<a href="${escapeHtml(href)}"${token.title ? ` title="${escapeHtml(token.title)}"` : ''} rel="noopener noreferrer">${body}</a>` : body
    },
    image(token) {
      const src = safeUrl(token.href, true)
      return src ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(token.text)}" loading="lazy" decoding="async">` : escapeHtml(token.text)
    }
  } })
  for (const extension of options.extensions || []) marked.use(extension.marked)
  const prepare = (source: string) => {
    if (source.length > 2_000_000) throw new RangeError('StreamMD accepts at most 2,000,000 UTF-16 code units per document.')
    return completeMarkdown(source, [...tags])
  }
  const tokenize = (source: string): Token[] => {
      const tokens = marked.lexer(prepare(source))
      if (marked.defaults.walkTokens) {
        const results = marked.walkTokens(tokens, marked.defaults.walkTokens)
        if (results.some(result => result && typeof (result as Promise<unknown>).then === 'function')) throw new TypeError('StreamMD token visitors must be synchronous.')
      }
      return tokens
  }
  return {
    tokenize,
    renderInline: tokens => new Parser(marked.defaults).parseInline(tokens),
    renderHtml: source => new Parser(marked.defaults).parse(tokenize(source))
  }
}

export function safeUrl(value: string, image = false): string {
  const clean = value.trim()
  const scheme = clean.replace(/&#(x[\da-f]+|\d+);?/gi, (_, entity: string) => {
    const code = entity[0].toLowerCase() === 'x' ? parseInt(entity.slice(1), 16) : parseInt(entity, 10)
    return code <= 0x10ffff ? String.fromCodePoint(code) : ''
  }).replace(/&colon;/gi, ':').replace(/&(?:Tab|NewLine);/gi, '').replace(/[\u0000-\u0020\u007f]/g, '')
  if (/^(?:https?:|mailto:|tel:)/i.test(scheme)) return image && !/^https?:/i.test(scheme) ? '' : clean
  if (/^[a-z][a-z\d+.-]*:/i.test(scheme) || /^[/\\]{2}/.test(scheme) || scheme.includes('\\')) return ''
  return clean
}
export const defaultEngine = createMarkdownEngine()
export const tokenize = (source: string): Token[] => defaultEngine.tokenize(source)
export const renderInline = (tokens: Token[] = []): string => defaultEngine.renderInline(tokens)
export { renderMath }
