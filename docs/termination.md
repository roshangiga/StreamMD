# Unterminated Block Parsing

A response doesn't arrive as finished Markdown. A chunk might end inside bold
text, an inline code span or a link. StreamMD handles those unfinished pieces
so readers see formatted content before the closing characters arrive.

Bold, italic, strikethrough and inline code can render while they're still open.
An unfinished link shows its label without exposing a partial URL. It becomes
clickable once complete. Incomplete images stay hidden instead of displaying
broken placeholders.

StreamMD completes the syntax for rendering, then updates the view as more text
arrives. Your original source stays untouched. Formatting markers inside code
blocks remain literal, and custom tag attributes keep their original values.

```js
import { createMarkdownEngine } from 'streammd'

const engine = createMarkdownEngine()
engine.renderHtml('**Still writing')
// <p><strong>Still writing</strong></p>

engine.renderHtml('[Read the guide](https://example.com/gu')
// <p>Read the guide</p>
```

This is built into StreamMD. There is nothing extra to install or enable.
