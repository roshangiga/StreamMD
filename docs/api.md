# API

## MarkdownRenderer

Import from `streammd/vue` and import `streammd/style.css` once in your application.

| Prop | Type | Default |
| --- | --- | --- |
| content | string | Required |
| theme | light or dark | light |
| mermaid | boolean | true; enables the diagram button |
| engine | MarkdownEngine | Shared standard engine |
| components | Record of token name to Vue component | Empty |

Completion is always active. There is no repair plugin or disable flag. `mermaid`
only controls whether Mermaid code blocks offer diagram rendering.

## Core

`createMarkdownEngine({ extensions? })` returns an isolated engine:

- `tokenize(source): Token[]` applies completion and returns Marked tokens.
- `renderInline(tokens): string` renders already-tokenized inline content.
- `renderHtml(source): string` applies completion and produces HTML.

`defineTag(name)` creates a registered custom block tag extension.
`renderMath(source, displayMode = true)` returns KaTeX HTML/MathML.

The root exports `MarkdownEngine`, `StreamMDExtension`, `TagToken`, `MathToken`,
`Token` and `Tokens` types. Extensions are trusted code and instance-local.

## Standalone Vue blocks

- `CodeBlock`: `code`, optional `lang`, `theme` and `mermaid`.
- `MermaidBlock`: `code`, optional `theme`; renders on mount.
- `TokenView`: `tokens`, optional `engine`, `components`, `theme` and `mermaid`.

`TokenView` is the recursive renderer for custom components. Pass through the
same engine and component map so nested extensions keep working.

Custom Vue components receive `token`, `engine`, `components` and `theme` props.
Use Vue's normal data binding; never compile Markdown as a Vue template.
