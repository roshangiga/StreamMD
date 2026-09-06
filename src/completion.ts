import remend from 'remend'

const options = { linkMode: 'text-only' as const, singleTilde: false }
const tagNames = '[a-zA-Z][a-zA-Z0-9-]*'
// Locate tag boundaries while skipping code. This does not tokenize Markdown;
// Remend repairs prose and the existing Marked extensions still own all parsing.
const boundaryPattern = new RegExp(
  '(^ {0,3}(?:`{3,}|~{3,})[^\\n]*(?:\\n|$))|(`+)|'
  + `(<\\/?(?:${tagNames})(?=[\\s/>])(?:"[^"]*"|'[^']*'|[^'"<>])*>)`
  + '|(^(?: {4}|\\t)[^\\n]*(?:\\n|$))',
  'gim'
)

function repairBody(source: string): string {
  const body = source.trimEnd()
  // Insert synthetic formatting before a wrapper's trailing newline. Marked does
  // not accept emphasis closed after trailing whitespace as inline emphasis.
  return remend(body, options) + source.slice(body.length)
}

/** Render-only completion. Never persist this result or feed it into the next chunk. */
export function completeMarkdown(source: string, _registeredTags: readonly string[]): string {
  if (!source) return source
  // Most answers need only the package call; no custom-boundary scan at all.
  if (!source.includes('<') && !source.includes('```') && !source.includes('~~~')
    && !/(?:^|\n)(?: {4}|\t)/.test(source)) return repairBody(source)

  const boundaries = new RegExp(boundaryPattern.source, boundaryPattern.flags)
  const parts: string[] = []
  let start = 0
  let match: RegExpExecArray | null
  while ((match = boundaries.exec(source))) {
    if (match[4]) {
      // Indented code cannot interrupt a paragraph. Protect a run beginning at
      // the start of a body or after a blank line, including its blank lines.
      const previousLine = source.lastIndexOf('\n', match.index - 2) + 1
      if (match.index > 0 && source.slice(previousLine, match.index).trim()) continue
      let codeEnd = boundaries.lastIndex
      while (codeEnd < source.length) {
        const line = /^(?:(?: {4}|\t)[^\n]*|[ \t]*)(?:\n|$)/.exec(source.slice(codeEnd))
        if (!line?.[0]) break
        codeEnd += line[0].length
      }
      parts.push(repairBody(source.slice(start, match.index)), source.slice(match.index, codeEnd))
      start = boundaries.lastIndex = codeEnd
      continue
    }
    if (match[1]) {
      const fence = /^ {0,3}(`+|~+)/.exec(match[1])![1]!
      const closing = new RegExp(`^ {0,3}${fence[0]}{${fence.length},}[ \\t]*(?:\\r?\\n|$)`, 'gm')
      closing.lastIndex = boundaries.lastIndex
      const end = closing.exec(source)
      const codeEnd = end ? closing.lastIndex : source.length
      // Remend 1.3.1 does not consistently protect tilde-fenced code. Both complete
      // and unfinished fenced blocks belong to Marked and must stay literal.
      parts.push(repairBody(source.slice(start, match.index)), source.slice(match.index, codeEnd))
      start = boundaries.lastIndex = codeEnd
      continue
    }
    if (match[2]) {
      if (match.index > 0 && source[match.index - 1] === '\\') continue
      const ticks = match[2]
      const closing = new RegExp('(?<!`)' + ticks + '(?!`)', 'g')
      closing.lastIndex = boundaries.lastIndex
      const end = closing.exec(source)
      if (end) boundaries.lastIndex = closing.lastIndex
      continue
    }
    if (match.index > 0 && source[match.index - 1] === '\\') continue
    // Repair each body independently so synthetic closers stay inside its wrapper.
    // Attributes (including JSON tool arguments) remain byte-for-byte intact.
    parts.push(repairBody(source.slice(start, match.index)), match[0])
    start = boundaries.lastIndex
  }
  parts.push(repairBody(source.slice(start)))
  return parts.join('')
}
