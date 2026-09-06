# Changelog

## 0.1.1

- Complete unfinished inline `$...` math automatically in JavaScript and Vue.
- Protect single tildes between word characters during Markdown completion.
- Preserve literal code, escaped currency and custom-tag attributes during math completion.
- Expand the unterminated block parsing guide with a supported syntax table, streaming examples and custom-tag usage.

Inline math now starts before its closing dollar arrives. Escape currency as `\$5` or place it in code to keep it literal.

## 0.1.0

Initial release with Markdown completion, JavaScript and Vue exports, GitHub Flavored Markdown, KaTeX, code highlighting, Mermaid viewers and custom components.
