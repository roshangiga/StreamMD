import { makeFixture } from '../fixtures/index.mjs'

// Use syntax shared by both renderers. These edits happen once, before timing,
// and both libraries receive exactly the same resulting string and hash.
export function sharedFixture(profile, kib) {
  const fixture = makeFixture(profile, kib)
  let source = fixture.source
    .replace(/<\/?callout\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/g, '')
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => `$${math}$`)
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => `$$\n${math}\n$$`)
    .replace(/\\(?:ce|pu)\{[^}]*\}/g, math => `$${math}$`)
  // Put asynchronous assets at the visible end for BOTH libraries. Streamdown
  // deliberately defers off-screen diagrams; auto-follow must not skip that work.
  const diagrams = source.match(/^```mermaid\n[\s\S]*?^```\n/gm) || []
  source = source.replace(/^```mermaid\n[\s\S]*?^```\n/gm, '')
  const images = source.match(/^!\[[^\]]*\]\(\/fixture\.svg\)\n/gm) || []
  source = source.replace(/^!\[[^\]]*\]\(\/fixture\.svg\)\n/gm, '')
  source = source.replace('DOCUMENT_COMPLETE', diagrams.join('\n') + '\n' + images.join('\n') + '\nDOCUMENT_COMPLETE')
  const c = fixture.copies
  const counts = {
    prose: { h1:c, 'strong, [data-streamdown="strong"]':c, em:c, del:c, 'a, [data-streamdown="link"]':c },
    structure: { blockquote:c, h6:c, hr:c, 'input[type="checkbox"]':c*2 },
    code: { pre:c*4 }, tables: { table:c, 'td .katex':c*2 },
    math: { '.katex':c*7 }, mermaid: { 'svg[aria-roledescription]':c*2 },
    images: { img:c }, mixed: { h1:c, h6:c, table:c, '.katex':c*9+1, 'svg[aria-roledescription]':2, img:1 }
  }[profile]
  return { source, counts, copies:c, profile, kib, bytes: new TextEncoder().encode(source).length }
}
