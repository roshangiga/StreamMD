# Unterminated Block Parsing

An AI response can stop mid-chunk at `**Ready to`, inside a code span, or halfway through a link destination. StreamMD completes unfinished syntax for the current render so readers can see formatted content while the response continues.

Completion is built into both the JavaScript engine and the Vue renderer. There is nothing extra to install or enable, and no option to disable it.

## Supported syntax

These examples describe StreamMD's built-in behavior. In the table, `\n` means a newline.

| Syntax | Incomplete input | Behavior during streaming |
| --- | --- | --- |
| Bold | `**Ready` or `__Ready` | Renders **Ready** with a temporary closing marker. |
| Italic | `*Ready` or `_Ready` | Renders *Ready* with a temporary closing marker. |
| Bold and italic | `***Ready` | Renders ***Ready***. |
| Inline code | `` `const total = 4 `` | Renders `const total = 4` as code. |
| Strikethrough | `~~Draft` | Renders ~~Draft~~. |
| Link label | `[Read the guide` | Shows the available label as plain text. |
| Link destination | `[Read the guide](https://example.com/gu` | Shows only the label until the link closes. |
| Image | `![Preview](https://example.com/im` | Hides the incomplete image. |
| Display math | `$$\nx^2` | Supplies the closing `$$` so KaTeX can render the expression. |
| Inline math | `$x^2` | Supplies the closing `$` so KaTeX can render the expression on the same line. |
| TeX math delimiters | `\[x^2`, `\(x^2` or `\begin{equation}x^2` | Supplies the matching closing delimiter and protects the formula from Markdown parsing. |
| Fenced code | An opening fence followed by code, without a closing fence | Renders the available code and keeps its contents literal. Backtick and tilde fences are supported. |
| Custom tag body | `<callout>\n**Ready` | A registered tag can render its unfinished body, including open formatting. |

Single tildes remain literal. Both `20~25` and `~Draft~` display as written; strikethrough uses two tildes on each side.

## Rendering notes

Completion uses a temporary copy of the accumulated Markdown. Your source stays unchanged, and each update can continue the same open span. Code blocks and quoted tag attributes retain their literal contents.

- Completed links become clickable after URL validation. Bare URLs follow [GitHub Flavored Markdown](rendering.md#github-flavored-markdown) rules.
- Keep inline `$...$` math on one line. Escape currency as `\$5` or put it in code. Completion supplies outer delimiters, but a formula cut inside a command or fraction still needs the remaining TeX before KaTeX can render it. See [Math](rendering.md#math).
- Mermaid starts in code view. The **Diagram** button needs valid diagram syntax, which completion does not supply. See [Code and Mermaid](rendering.md#code-and-mermaid).
- Completion also applies to saved documents. Escape unmatched markers that should remain visible. Lists and tables can change layout as their structure arrives.

## Use it in JavaScript

Pass the accumulated source to `renderHtml` or `tokenize`. Both apply completion automatically.

```js
import { createMarkdownEngine } from 'streammd'

const engine = createMarkdownEngine()
let source = ''

source += '**Ready'
engine.renderHtml(source)
// '<p><strong>Ready</strong></p>\n'

source += ' to publish** today.'
engine.renderHtml(source)
// '<p><strong>Ready to publish</strong> today.</p>\n'
```

Append chunks to the original `source` and store that value for history. Never feed rendered HTML or tokens back as input. Replace or clear the source to start another document.

## Use it in Vue

Update the `content` prop with the Markdown received so far. No streaming flag is required.

```vue
<script setup>
import { ref } from 'vue'
import { MarkdownRenderer } from 'streammd/vue'
import 'streammd/style.css'

const content = ref('')

// Call this with each Markdown chunk from your transport.
function receiveChunk(chunk) {
  content.value += chunk
}
</script>

<template>
  <MarkdownRenderer :content="content" />
</template>
```

Your application supplies the chunks; Vue renders each updated `content` value.

## Custom tags and nested content

Register tags with `defineTag` and map them to your own Vue components. An unfinished body exposes `token.complete === false`; nested Markdown still renders. The opening tag must be complete, and quoted attributes retain their values.

See [custom tags and components](extensions.md) for registration and nested rendering examples.

## Verification

The [browser audit](evidence/termination-audit.json) covers 20 syntax cases in StreamMD and the portal integration. Regression tests check every character prefix of a GRPO objective, including preservation of its TeX and rendering before the final `\]` arrives.
