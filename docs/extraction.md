# Architecture and extraction

StreamMD ships as one ESM package with two entry points. `streammd` contains
the JavaScript engine; `streammd/vue` adds Vue components. Other framework
integrations can use the core without importing Vue. The stylesheet is an
explicit `streammd/style.css` import.

| Module | Responsibility |
| --- | --- |
| `src/parser.ts` | Isolated Marked instance, safe built-in rendering and extension registration |
| `src/completion.ts` | Automatic Markdown completion and code/tag boundary protection |
| `src/tags.ts` | Consumer-defined block tags, attributes and nested tokens |
| `src/utils/math-extension.ts` | Math delimiters and KaTeX output |
| `src/MarkdownRenderer.vue` | Reactive source-to-token rendering |
| `src/components/TokenTree.vue` | Recursive standard tokens and custom block components |
| Other `src/components/` files | Code, tables, dialogs and lazy Mermaid rendering |
| `src/style.css` | Scoped typography, spacing, tables, code and theme variables |

The engine processes accumulated Markdown whenever content changes. Completion
is always part of that path, including static rendering. There is no separate
completion plugin or switch. Remend is an internal dependency with its original
licence; StreamMD supplies the surrounding boundary handling.

An engine owns its extensions. Consumers can register synchronous tokenizers,
renderers and token visitors, or use `defineTag` with a Vue component. Nested
components receive the same engine and component registry. Custom extension
code is trusted application code. See [Extensions](extensions.md).

The original portal supplied the recursive rendering structure, highlighting
registrations, math aliases, Mermaid theme helpers and visual styles. This
extraction removes application imports, transport, tool/trace UI, authentication,
file services and teaching tags. Generic extension examples live only in the
demo and benchmarks. No backend is needed to build or use the library.

The old math-extension implementation was excluded because it had Open WebUI
ancestry. StreamMD uses a new delimiter scanner with focused tests. Dependency
and asset attribution is recorded in [third-party notices](../THIRD_PARTY_NOTICES.md).

The release uses `src/` modules in a single package rather than a workspace of
separate core/Vue packages. This keeps installation to one command while keeping
the public entry points separate. Core-only consumers do not install Vue.
