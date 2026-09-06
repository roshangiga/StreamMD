# Security

Markdown is untrusted data. The default engine escapes raw HTML, rejects unsafe
link/image schemes, uses KaTeX `trust: false`, and renders Mermaid with strict
security. Mermaid frontmatter/configuration directives are rejected. Code is
displayed, never executed. Vue templates are compiled from package/application
source, never from Markdown.

Custom tokenizers, HTML renderers and Vue components are trusted application code.
They can change these guarantees. Do not return raw user strings as HTML, spread
untrusted attributes onto active elements, or evaluate tag attributes. Render
nested content through `TokenView` and the same engine.

Limits reduce accidental misuse, not all denial-of-service risks. A source can
contain up to 2,000,000 UTF-16 code units; a Mermaid diagram up to 100,000 characters.
Large inputs still cost CPU and memory. Applications should set their own request
limits and Content Security Policy. Images may make requests to URLs in Markdown;
use host-level network/CSP controls where needed.

Report a reproducible security issue through
[GitHub's private vulnerability reporting](https://github.com/roshangiga/StreamMD/security/advisories/new).
Avoid posting live credentials or private documents.
