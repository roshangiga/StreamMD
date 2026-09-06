# Custom tags and components

Register tags in your own engine. Nothing is registered globally.

```js
import { createMarkdownEngine, defineTag } from 'streammd'
import Callout from './Callout.vue'

const engine = createMarkdownEngine({ extensions: [defineTag('callout')] })
const components = { callout: Callout }
```

```vue
<MarkdownRenderer :content="content" :engine="engine" :components="components" />
```

Markdown source:

```text
<callout title="Note">
**Nested Markdown** and $x^2$.
</callout>
```

Your `Callout.vue` component:

```vue
<script setup>
import { TokenView } from 'streammd/vue'
defineProps(['token', 'engine', 'components', 'theme'])
</script>
<template>
  <aside>
    <strong>{{ token.attributes.title }}</strong>
    <TokenView :tokens="token.tokens" :engine="engine"
      :components="components" :theme="theme" />
  </aside>
</template>
```

A tag token contains `type`, `tag`, `raw`, `text`, `attributes`, nested `tokens`
and `complete`. Attribute values are strings, including JSON-shaped strings.
Tags support nested matching tags and unfinished bodies. Closing tags inside
fenced/inline code are literal. Put block tags on their own lines for predictable
Markdown structure. Unknown tags are escaped text.

`defineTag` supplies a core HTML fallback that renders the body without a wrapper.
Without a Vue component mapping, the Vue renderer also displays the nested body.

## Custom tokenizers

An extension is `{ name, tags?, marked }`, where `marked` accepts Marked's
`extensions`, `tokenizer`, `renderer` and synchronous `walkTokens` fields.
Async mode and parser hooks are rejected.
Use this for inline syntax or specialized block tokens. Synchronous `walkTokens`
visitors run in both the core HTML and Vue token paths. Async visitors are not
supported by this synchronous API. Vue component mappings apply to block tokens;
custom inline tokens use their registered HTML renderer. Token names must be unique
within an engine. Core Markdown token names and dangerous HTML tag names are
reserved. `tags` declares wrapper boundaries that completion must respect.

Custom tokenizers and HTML renderers are trusted application code. They can
change output policy. Keep source strings out of `v-html`, validate URLs and use
`TokenView` for nested content. Untrusted Markdown cannot register extensions.
