# Getting started

Build with Node 22.12+ using `npm ci && npm run build`. Run `npm pack` to create a
tarball, then install it in your project with `npm install /path/to/streammd-0.1.1.tgz`.
The package is not on npm yet; do not confuse it with the unrelated `stream-md`.

## Vue

```vue
<script setup>
import { ref } from 'vue'
import { MarkdownRenderer } from 'streammd/vue'
import 'streammd/style.css'
const content = ref('# Hello\n\n**A new paragraph')
</script>
<template><MarkdownRenderer :content="content" theme="light" /></template>
```

Assign fresh source to `content` as it arrives. Completion is built in. Never feed
rendered HTML or synthetic completion output back into the input.

## JavaScript

```js
import { createMarkdownEngine } from 'streammd'
const engine = createMarkdownEngine()
const tokens = engine.tokenize('# Hello')
const html = engine.renderHtml('Hello **world**')
```

The core does not import Vue or require a DOM. Its HTML output includes KaTeX but
does not create interactive controls, highlight code or render Mermaid SVG. Those
are supplied by the Vue integration. Import the stylesheet when displaying HTML.

## Nuxt

Import `MarkdownRenderer` from `streammd/vue` in a component and add
`streammd/style.css` to Nuxt's `css` configuration. No Nuxt module is required.
Server rendering produces Markdown and code; Mermaid runs only after a browser
user requests a diagram. Use an explicit theme to keep server/client markup equal.

## Local documentation

`npm run docs` serves this playground. `npm run docs:build` creates `demo-dist/`
with relative asset paths suitable for a GitHub Pages project site.
