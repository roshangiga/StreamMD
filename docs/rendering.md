# Rendering and themes

## GitHub Flavored Markdown

StreamMD supports headings, paragraphs, links, images, blockquotes and fenced
or indented code. GitHub Flavored Markdown adds tables, task lists, automatic
links and strikethrough. Lists can nest and ordered lists preserve their starting
number. Math and Mermaid are additional rendering features described below.

## Tables

Table cells support Markdown formatting, links and math. Column alignment follows
the separator row. Use the copy icon to copy Markdown and the expand icon to
open the table in a larger view. A successful copy shows a tick for two seconds.
Tables grow vertically with their contents and scroll
horizontally when they exceed the available width.

## Markdown completion

See [Unterminated Block Parsing](termination.md) for examples.

Every source update passes through completion before tokenization. Unfinished
formatting can render immediately; partial link destinations remain hidden until
complete. Original input is never mutated. Code fences and tag attributes are
protected. This behavior also applies to static input; literal unmatched Markdown
must be escaped or put in code. There is no disable flag.

Completion uses the Remend package internally with StreamMD's boundary handling.
It is included automatically. Its licence and authorship remain in the notices.

## Math

Supported delimiters: `$...$`, `$$...$$`, `\(...\)`, `\[...\]` and
`\begin{equation}...\end{equation}`. Chemistry uses `\ce{...}` and units use
`\pu{...}` through KaTeX mhchem. Math works inside table cells and list items.

Single dollars mean math. Open `$...` and `$$...` expressions receive temporary
closing delimiters during rendering. The same applies to `\(...\)`, `\[...\]`
and `\begin{equation}...\end{equation}`, whose bodies are protected from Markdown
completion. Escape currency dollars as `\$5` or use inline code to keep them literal.
Invalid math can remain literal or show KaTeX's error text; completion does not
repair missing TeX braces or commands.

KaTeX uses untrusted mode, per-render macros, a maximum 1,000 macro expansions and
maximum size 20. Built-in aliases include `\R`, `\N`, `\Z`, `\Q` and `\C`.

## Code and Mermaid

Code highlighting uses highlight.js. The standard language set includes JS/TS,
Python, shell, JSON, HTML/XML/Vue, CSS, SQL, YAML, Markdown, Java, Go, Rust, C/C++,
C#, PHP, Ruby, Swift, Kotlin, Scala, Dockerfile and GraphQL.

Mermaid fences begin in code view. Select **Diagram** to render and **Expand**
for a larger view. Invalid diagrams show a failure message. Theme changes rerender
the diagram. Embedded Mermaid directives/frontmatter are rejected; the diagram
cannot weaken the strict rendering policy. Mermaid jobs are serialized because
the upstream renderer owns global configuration.

## CSS

All prose/control styles are scoped beneath `.vmr`. KaTeX styles target KaTeX
classes. Import CSS once; no Tailwind or application-wide reset is required.

Override these variables on a wrapper with sufficient specificity:

```css
.my-article.vmr {
  --smd-text: #24292f;
  --smd-code-bg: #f3f3f3;
  --smd-inline-bg: #eceef1;
  --smd-border: #d4d7dc;
  --smd-link: #245da8;
  --smd-bg: #ffffff;
}
```

`theme="dark"` selects dark variables and Mermaid colours. Code blocks retain
one background and compact padding. Tables have natural vertical height and
horizontal overflow where needed. Controls have focus outlines; native dialogs
handle Escape, focus containment and restoration.

## Limits

Documents are limited to 2,000,000 UTF-16 code units; diagrams to 100,000 characters.
Updates process accumulated source. StreamMD does not claim constant-time parsing,
smooth rendering for arbitrarily large documents, or full CommonMark conformance
under automatic completion. Images must use safe public/relative URLs and obey
the host application's CSP. Clipboard access requires a secure context.
