export const profiles = ['prose', 'structure', 'code', 'tables', 'math', 'mermaid', 'images', 'extensions', 'mixed']
const prose = '# Overview\n\nA paragraph with **bold**, *italic*, ~~removed text~~, an [example link](https://example.com/docs), and `inline code`.\n\n'
const structure = '## Nested content\n\n> A quotation with **emphasis**.\n>\n> - A quoted list\n\n3. Third item\n   - Nested item\n     - Deeper item\n4. Fourth item\n\n- [x] Completed task\n- [ ] Open task\n\n### Three\n\n#### Four\n\n##### Five\n\n###### Six\n\n---\n\n'
const code = '```typescript\nconst square = (x: number) => x * x\n```\n\n```python\ndef square(x):\n    return x ** 2\n```\n\n~~~json\n{"enabled": true, "count": 42}\n~~~\n\n    literal indented code\n\n'
const tables = '| Metric | Formula | Value |\n| :--- | :---: | ---: |\n| **Mean** | $\\frac{1}{n}\\sum_i x_i$ | 42 |\n| *Variance* | $\\sigma^2$ | 3.5 |\n| Link | [Reference](https://example.com) | 7 |\n\n'
const math = '## Mathematics\n\nInline $E=mc^2$ and \\(a^2+b^2=c^2\\).\n\n$$\n\\int_0^1 x^2\\,dx=\\frac{1}{3}\n$$\n\n\\[\\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}\\]\n\n- Probability $P(A\\mid B)=\\frac{P(A\\cap B)}{P(B)}$\n\nChemistry: \\ce{2H2 + O2 -> 2H2O}. Units: \\pu{10 m/s}.\n\n'
const mermaid = '```mermaid\nflowchart LR\n  A[Input] --> B{Valid?}\n  B -->|Yes| C[Render]\n  B -->|No| D[Report]\n```\n\n```mermaid\nsequenceDiagram\n  User->>Renderer: Markdown\n  Renderer-->>User: Content\n```\n\n'
const images = '![Offline benchmark image](/fixture.svg)\n\n'
const extensions = '<callout title="Outer > note">\n**Custom Markdown** with $x^2$.\n\n<callout title="Nested">\n- Nested extension content\n</callout>\n</callout>\n\n'
const units = { prose, structure, code, tables, math, mermaid, images, extensions, mixed: prose + structure + code + tables + math }
const required = {
  prose: ['h1', 'strong', 'em', 'del', 'a', 'code'],
  structure: ['blockquote', 'ol[start="3"]', 'ul ul', 'input[type="checkbox"]', 'h6', 'hr'],
  code: ['.vmr-codeblock', '.hljs-keyword'],
  tables: ['table', 'td .katex', 'th[style*="right"]'],
  math: ['.katex', '.katex-display', '.katex .mfrac'],
  mermaid: ['.vmr-mermaid svg'], images: ['img'], extensions: ['aside[data-callout]'],
  mixed: ['h1', 'h6', 'blockquote', 'input[type="checkbox"]', 'table', 'td .katex', '.katex-display', '.hljs-keyword', '.vmr-mermaid svg', 'img', 'aside[data-callout]']
}
export function makeFixture(profile = 'mixed', kib = 10) {
  if (!profiles.includes(profile) || ![10, 100, 500].includes(kib)) throw new Error('Unsupported fixture selection')
  const target = kib * 1024
  const unit = units[profile]
  const prefix = 'Stable first paragraph.\n\n' + (profile === 'mixed' ? mermaid + images + extensions : '')
  // Expensive diagram/image/custom profiles use 1/5/12 complete groups. Other
  // profiles scale repeated rich content to size. Never truncate Markdown blocks.
  const cap = ['mermaid', 'images', 'extensions'].includes(profile) ? ({ 10: 1, 100: 5, 500: 12 })[kib] : Infinity
  const copies = Math.max(1, Math.min(cap, Math.floor((target - prefix.length - 30) / unit.length)))
  let source = prefix + unit.repeat(copies)
  source += '\n\n' + 'Filler paragraph. '.repeat(Math.max(0, Math.floor((target - source.length - 30) / 18)))
  source += '\n\nDOCUMENT_COMPLETE\n'
  const expectedCounts = {
    prose: { h1: copies, strong: copies, em: copies, del: copies, a: copies },
    structure: { blockquote: copies, h6: copies, hr: copies, 'input[type="checkbox"]': 2 * copies },
    code: { '.vmr-codeblock': 4 * copies },
    tables: { table: copies, 'td .katex': 2 * copies },
    math: { '.katex': 7 * copies },
    mermaid: { '.vmr-mermaid svg': 2 * copies },
    images: { img: copies },
    extensions: { 'aside[data-callout]': 2 * copies, '.katex': copies },
    mixed: { h1: copies, h6: copies, table: copies, '.katex': 9 * copies + 1, '.vmr-codeblock': 4 * copies + 2, '.vmr-mermaid svg': 2, img: 1, 'aside[data-callout]': 2 }
  }[profile]
  return { source, profile, kib, copies, bytes: new TextEncoder().encode(source).length, required: required[profile], expectedCounts }
}
