import type { Token, Tokens } from 'marked'
import type { StreamMDExtension } from './parser'

export interface TagToken extends Tokens.Generic {
  type: string
  tag: string
  attributes: Record<string, string>
  tokens: Token[]
  text: string
  complete: boolean
}

// Attribute values remain data, never Vue templates or evaluated expressions.
export function defineTag(name: string): StreamMDExtension {
  if (!/^[a-z][a-z0-9-]*$/.test(name)) throw new Error('Tag names must use lowercase letters, digits and hyphens.')
  const header = new RegExp(`^<${name}(?=[\\s/>])(?:"[^"]*"|'[^']*'|[^'"<>])*>`)
  const delimiters = new RegExp('(^ {0,3}(?:`{3,}|~{3,})[^\\n]*(?:\\n|$))|(`+)|' + `<(\\/?)(?:${name})(?=[\\s/>])(?:"[^"]*"|'[^']*'|[^'"<>])*>`, 'gm')
  return { name, tags: [name], marked: { extensions: [{
    name, level: 'block',
    start(source) { const match = new RegExp(`(?:^|\\n)(?=<${name}(?=[\\s/>]))`).exec(source); return match ? match.index + match[0].length : undefined },
    tokenizer(source) {
      const opening = header.exec(source)?.[0]
      if (!opening) return
      const attrs: Record<string, string> = Object.create(null)
      const body = opening.slice(name.length + 1, -1).replace(/\/$/, '')
      for (const match of body.matchAll(/([^\s=/'"<>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s'"=<>]+)))?/g)) {
        const key = match[1]
        if (['__proto__', 'constructor', 'prototype'].includes(key)) continue
        attrs[key] = match[2] ?? match[3] ?? match[4] ?? ''
      }
      let depth = /\/>$/.test(opening) ? 0 : 1
      let bodyEnd = opening.length
      let rawEnd = opening.length
      let complete = depth === 0
      delimiters.lastIndex = opening.length
      if (depth) {
        let match: RegExpExecArray | null
        while ((match = delimiters.exec(source))) {
          if (match[1]) {
            const fence = /^ {0,3}(`+|~+)/.exec(match[1])![1]
            const close = new RegExp(`^ {0,3}${fence[0]}{${fence.length},}[ \\t]*(?:\\n|$)`, 'gm')
            close.lastIndex = delimiters.lastIndex
            if (!close.exec(source)) break
            delimiters.lastIndex = close.lastIndex
            continue
          }
          if (match[2]) {
            const end = source.indexOf(match[2], delimiters.lastIndex)
            if (end >= 0) delimiters.lastIndex = end + match[2].length
            continue
          }
          if (match.index && source[match.index - 1] === '\\') continue
          if (match[3]) depth--
          else if (!/\/>$/.test(match[0])) depth++
          if (!depth) { bodyEnd = match.index; rawEnd = delimiters.lastIndex; complete = true; break }
        }
        if (!complete) bodyEnd = rawEnd = source.length
      }
      const text = source.slice(opening.length, bodyEnd)
      return { type: name, tag: name, raw: source.slice(0, rawEnd), text, attributes: attrs, tokens: this.lexer.blockTokens(text), complete }
    },
    renderer(token) { return this.parser.parse((token as TagToken).tokens) },
    childTokens: ['tokens']
  }] } }
}
