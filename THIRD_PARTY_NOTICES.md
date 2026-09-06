# Third-party notices

StreamMD's original code is MIT-licensed. This does not replace dependency licences.
Full notices for the direct runtime dependencies are included in `licenses/`.

| Dependency | Version | Licence | Use |
| --- | --- | --- | --- |
| Marked | 17.0.1 | MIT | Markdown tokenization and HTML |
| KaTeX | 0.16.25 | MIT | Math, CSS and bundled fonts |
| highlight.js | 11.11.1 | BSD-3-Clause | Syntax highlighting |
| Mermaid | 11.16.1 | MIT | Browser diagram rendering |
| Remend | 1.3.1 | Apache-2.0 | Built-in Markdown completion |
| Vue | 3.5+ peer | MIT | Optional Vue integration |

Dependency code remains in its packages, except KaTeX's stylesheet/fonts copied
unchanged into `dist/`. The font project notice is included separately. Transitive
dependencies retain the notices distributed by their own packages. The lockfile
records the exact dependency graph for development and benchmark reproduction.

Remend is used internally without modifying its package. StreamMD adds boundary
handling around it for code and custom tags. Completion is part of the product;
it is not an original reimplementation of Remend.

## Source extraction

The recursive Vue rendering structure, typography/table/code styles, highlighting
language registrations, math aliases, Mermaid theme helpers and completion boundary
handling were adapted from the authors' existing portal renderer. Portal services,
teaching tags, tool UI, transport and authentication were not included.

The earlier portal math extension shared code with Open WebUI. That file is not
distributed here. `src/utils/math-extension.ts` is a new delimiter scanner written
for StreamMD and tested against the supported syntax. No Open WebUI package,
brand asset or copied math-extension implementation is shipped.

This project is independent of the unrelated `jvoltci/stream-md` project. It does
not use that project's source code or benchmark claims.
