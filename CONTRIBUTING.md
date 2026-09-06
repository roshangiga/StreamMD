# Contributing

Use Node 22.12+ and npm. Start with `npm ci`, then `npm run build` and `npm run docs`.

Before proposing a change, run `npm test`, `npm run typecheck` and
`npm run release:check`. Rendering changes need a browser check in light and dark
themes. Parser/completion changes need partial-input and literal-code tests.
Benchmark changes must preserve fixture/version metadata and raw results.

Keep the JavaScript root entry independent of Vue and the DOM. Keep application
services and network streaming out of the runtime. New custom syntax should use
the documented extension API unless it is standard Markdown.

Include a reproducible fixture for a bug. Do not submit private chats, backend
addresses or credentials. Contributions to original package code use the MIT
licence; copied third-party code must preserve its applicable notices.
