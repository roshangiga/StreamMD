# Unterminated Block Parsing

An AI response can stop mid-chunk at `**Ready to`, inside a code span, or halfway through a link destination. StreamMD completes unfinished syntax for the current render so readers can see formatted content while the response continues.

Completion is built into both the JavaScript engine and the Vue renderer. There is nothing extra to install or enable, and no option to disable it.

## How it works

Each update starts with the Markdown received so far. StreamMD prepares a temporary rendering copy, then parses it into tokens. Open formatting receives closing markers where supported. Partial link destinations are hidden, and incomplete images are withheld.

The next update starts again from your source. Synthetic closing characters never become part of the stored response, so later text can continue the same bold span or link. Code blocks and tag attributes retain their literal contents.

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
| Fenced code | An opening fence followed by code, without a closing fence | Renders the available code and keeps its contents literal. Backtick and tilde fences are supported. |
| Custom tag body | `<callout>\n**Ready` | A registered tag can render its unfinished body, including open formatting. |

Single tildes remain literal. Both `20~25` and `~Draft~` display as written; strikethrough uses two tildes on each side.

### Formatting across updates

An opening marker can take effect before its closing marker arrives. For example:

| Source received so far | Visible result |
| --- | --- |
| `**Ready` | **Ready** |
| `**Ready to publish` | **Ready to publish** |
| `**Ready to publish** today.` | **Ready to publish** today. |

Completion follows the available syntax. A later chunk can still change how Markdown is interpreted, such as when a table separator arrives beneath a header row.

### Links and images

StreamMD displays unfinished links as text. A partial destination never appears as a visible URL beside the label, and the label becomes clickable once the Markdown link is complete and its URL passes validation.

| Source received so far | Visible result |
| --- | --- |
| `[Read the guide` | Read the guide |
| `[Read the guide](https://example.com/gu` | Read the guide |
| `[Read the guide](https://example.com/guide)` | A clickable link labelled "Read the guide". |

This behavior applies to Markdown links with labels. A bare URL in prose follows the normal automatic-link rules of [GitHub Flavored Markdown](rendering.md#github-flavored-markdown).

An unfinished image stays hidden until its syntax closes. Once complete, it uses the normal image renderer and URL checks. Loading the image still depends on the destination being available.

### Math

An open display expression can render before its closing delimiter arrives:

```text
$$
E = mc^2
```

StreamMD supplies the closing `$$` for that render. The expression must still be valid KaTeX; completion does not repair unfinished TeX commands or missing braces inside a formula.

Inline math also completes automatically. `Value: $x^2` renders the formula before the final `$` arrives. Use a single line for `$...$` expressions. Escape currency dollars as `\$5`, or place them in code, so they remain literal during streaming.

Other supported forms, including `\(...\)`, `\[...\]` and `\begin{equation}...\end{equation}`, need their closing delimiters. See [Math](rendering.md#math) for chemistry and units.

### Code blocks and Mermaid

An open code fence can display the code received so far. Formatting markers inside it stay literal:

````text
```js
const label = "**Keep these asterisks";
````

The same protection applies to tilde fences and indented code blocks. Asterisks in code do not become synthetic bold markers.

In Vue, a `mermaid` fence starts in code view with a **Diagram** button. Completion preserves the diagram source; Mermaid needs valid diagram syntax to render it. An unfinished definition may show an error if opened before it is ready. See [Code and Mermaid](rendering.md#code-and-mermaid) for the viewer controls.

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

Keep `source` as the received Markdown. Store that value for saved history and append new chunks to it. Do not pass rendered HTML or token output back as the next input. Replacing the source or resetting it to an empty string also works without creating a new engine.

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

Your application owns the connection and chunk delivery. The renderer handles each updated `content` value. The [JavaScript core](getting-started.md#javascript) produces HTML and tokens; Vue supplies interactive code blocks and diagram viewers.

## Custom tags and nested content

Register a tag with `defineTag` to render its body before its closing tag arrives:

```js
import { createMarkdownEngine, defineTag } from 'streammd'

const engine = createMarkdownEngine({
  extensions: [defineTag('callout')]
})

const [token] = engine.tokenize('<callout title="Note">\n**Ready')
token.complete // false
token.attributes.title // 'Note'

engine.renderHtml('<callout title="Note">\n**Ready')
// '<p><strong>Ready</strong></p>\n'
```

Formatting closes inside its containing body. Quoted attributes, including JSON-shaped strings, retain their values. A complete opening tag is required; an unfinished attribute is not a complete tag registration match.

Tags can nest, and `token.complete` tells your component whether the closing tag has arrived. Use [custom tags and components](extensions.md) to map these tokens to Vue views or add your own tokenizer. The built-in HTML fallback renders the tag body without a wrapper.

## Literal text and incomplete documents

Completion also applies to static documents and saved history. Escape an unmatched marker when it should remain visible, or place it inside code. For example, `\*literal` displays `*literal`, while `user_name` and `hello*world` retain their word-internal characters.

Lists and tables follow the normal Markdown parser as their structure arrives. Completion does not invent missing table cells or finish a diagram's grammar. It formats supported unfinished syntax from the current source; new chunks may still change the layout.
