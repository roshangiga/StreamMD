import { describe, it, expect } from 'vitest'
import { marked } from 'marked'
import { createMarkdownEngine, defineTag, renderMath, type TagToken } from '../src/core'
const engine = createMarkdownEngine()

describe('built-in Markdown completion', () => {
  it('renders inline math before its closing dollar and continues from original source', () => {
    const source = 'Value: $x'
    for (const suffix of ['', '^2', '^2$ today.']) {
      const html = engine.renderHtml(source + suffix)
      expect(html).toContain('class="katex"')
      expect(html).not.toContain('katex-error')
    }
    expect(engine.renderHtml(source + '^2$ today.')).toContain('today.')
    expect(source).toBe('Value: $x')
  })
  it('completes inline math inside a tag without modifying attributes', () => {
    const custom = createMarkdownEngine({ extensions: [defineTag('callout')] })
    const source = '<callout title="Price $5 and 20~25">\nValue: $x^2\n</callout>'
    const token = custom.tokenize(source)[0] as TagToken
    expect(token.attributes.title).toBe('Price $5 and 20~25')
    expect(custom.renderHtml(source)).toContain('class="katex"')
  })
  it.each(['`$x 20~25`', '```text\n$x 20~25', '~~~text\n$x 20~25', '    $x 20~25'])('keeps math and tildes literal in code: %s', source => {
    const html = engine.renderHtml(source)
    expect(html).toContain('$x 20~25')
    expect(html).not.toContain('katex')
  })
  it('keeps escaped currency literal and double tilde strikethrough active', () => {
    const html = engine.renderHtml('Cost \\$5. Range 20~25. ~Draft~ and ~~Removed')
    expect(html).toContain('Cost $5. Range 20~25. ~Draft~')
    expect(html).toContain('<del>Removed</del>')
    expect(html).not.toContain('katex')
  })
  it('completes emphasis without changing the input', () => {
    const source = '**hello'
    expect(engine.renderHtml(source)).toContain('<strong>hello</strong>')
    expect(source).toBe('**hello')
  })
  it('does not expose a partial link destination', () => {
    const source = '[Docs](https://example.com/a-long-destination)'
    for (let i = 7; i < source.length; i++) {
      const html = engine.renderHtml(source.slice(0, i))
      expect(html).not.toContain('href=')
      expect(html).not.toContain('https://')
    }
    expect(engine.renderHtml(source)).toContain('href="https://example.com/a-long-destination"')
  })
  it.each(['```ts\nconst x = "**"\n```', '~~~ts\nconst x = "**"\n~~~', '    const x = "**"'])('preserves literal code: %s', source => {
    const token = engine.tokenize(source)[0]
    expect(token.type).toBe('code')
    expect((token as import('marked').Tokens.Code).text).toBe('const x = "**"')
  })
  it('accepts replacement and reset independently', () => {
    engine.tokenize('**before')
    expect(engine.renderHtml('after')).toBe('<p>after</p>\n')
    expect(engine.tokenize('')).toHaveLength(0)
  })
})

describe('math and GFM', () => {
  it.each(['$x^2$', '\\(x^2\\)', '$$\nx^2\n$$', '\\[x^2\\]', '\\begin{equation}x^2\\end{equation}', '\\ce{H2O}', '\\pu{10 m}'])('renders %s', source => {
    const html = engine.renderHtml(source)
    expect(html).toContain('class="katex')
    expect(html).not.toContain('katex-error')
  })
  it('renders table and list math', () => {
    const html = engine.renderHtml('| Formula |\n| --- |\n| $x^2$ |\n\n- $y^2$')
    expect(html).toContain('<table>')
    expect(html.match(/class="katex"/g)?.length).toBe(2)
  })
  it('renders nested lists, tasks, alignment and all heading levels', () => {
    const html = engine.renderHtml('###### Six\n\n3. Third\n   - Nested\n\n- [x] Done\n\n| Left | Right |\n| :--- | ---: |\n| a | b |')
    expect(html).toContain('<h6>Six</h6>')
    expect(html).toContain('start="3"')
    expect(html).toContain('checked=""')
    expect(html).toContain('align="right"')
  })
  it('does not parse code as math', () => expect(engine.renderHtml('`$x$`')).not.toContain('katex'))
  it('isolates macros between renders', () => {
    renderMath('\\gdef\\privateMacro{secret}')
    expect(renderMath('\\privateMacro')).not.toContain('>secret<')
  })
})

describe('custom extensions', () => {
  const custom = createMarkdownEngine({ extensions: [defineTag('callout')] })
  it('renders nested tags and preserves quoted attributes', () => {
    const source = '<callout title="a > b" json=\'{"x":"**"}\'>\n**Hello\n\n<callout>Nested</callout>\n</callout>'
    const token = custom.tokenize(source)[0] as TagToken
    expect(token.type).toBe('callout')
    expect(token.attributes.title).toBe('a > b')
    expect(token.attributes.json).toBe('{"x":"**"}')
    expect(custom.renderHtml(source)).toContain('<strong>Hello</strong>')
    expect(token.tokens.some(child => child.type === 'callout')).toBe(true)
  })
  it('ignores a closing tag inside code', () => {
    const token = custom.tokenize('<callout>\n```text\n</callout>\n```\n\nAfter\n</callout>')[0] as TagToken
    expect(token.complete).toBe(true)
    expect(token.text).toContain('After')
  })
  it('can render an unfinished body', () => {
    const token = custom.tokenize('<callout>\n**Still going')[0] as TagToken
    expect(token.complete).toBe(false)
    expect(custom.renderHtml('<callout>\n**Still going')).toContain('<strong>Still going</strong>')
  })
  it('does not register globally or in other engines', () => {
    expect(engine.tokenize('<callout>hello</callout>')[0].type).not.toBe('callout')
    expect(marked.lexer('<callout>hello</callout>')[0].type).not.toBe('callout')
  })
  it('rejects duplicate and dangerous tag registrations', () => {
    expect(() => createMarkdownEngine({ extensions: [defineTag('callout'), defineTag('callout')] })).toThrow()
    expect(() => createMarkdownEngine({ extensions: [defineTag('script')] })).toThrow()
  })
  it('runs token visitors for both tokens and HTML', () => {
    const decorated = createMarkdownEngine({ extensions: [{ name: 'decorate', marked: { walkTokens(token) { if (token.type === 'text') token.text = token.text.replace('before', 'after') } } }] })
    const token = decorated.tokenize('before')[0] as import('marked').Tokens.Paragraph
    expect(decorated.renderInline(token.tokens)).toContain('after')
    expect(decorated.renderHtml('before')).toContain('after')
    expect(engine.renderHtml('before')).toContain('before')
  })
})

describe('input policy', () => {
  it.each(['<script>alert(1)</script>', '<img src=x onerror=alert(1)>', '<iframe src="https://example.com"></iframe>'])('escapes HTML %s', source => {
    const html = engine.renderHtml(source)
    expect(html).not.toMatch(/<(script|img|iframe)[ >]/)
  })
  it.each(['javascript:alert', 'vbscript:alert', 'data:text/html,test', 'jav&#x61;script:alert', 'java&#10;script:alert'])('rejects %s', href => {
    const html = engine.renderHtml(`[x](${href})`)
    expect(html).not.toContain('href=')
  })
  it('disables trusted KaTeX HTML', () => expect(renderMath('\\href{javascript:alert(1)}{x}')).not.toContain('href="javascript:'))
})
