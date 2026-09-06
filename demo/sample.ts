export const sample = String.raw`# Markdown, ready to render

StreamMD handles **bold**, *emphasis*, ~~strikethrough~~, [links](https://example.com) and incomplete Markdown as content arrives.

## Code

~~~typescript
const square = (x: number) => x * x
~~~

## Tables and math

| Metric | Formula | Result |
| :--- | :---: | ---: |
| Average | $\frac{a+b}{2}$ | 12 |
| Probability | $P(A\mid B)$ | 0.75 |

Inline math: \(E=mc^2\). Chemistry: \ce{2H2 + O2 -> 2H2O}.

$$
\int_0^1 x^2\,dx = \frac{1}{3}
$$

## Diagrams

~~~mermaid
flowchart LR
  A[Markdown] --> B[Completion]
  B --> C[Tokens]
  C --> D[Vue]
~~~

## Nested blocks

> Blockquotes can contain lists.
>
> - First item
> - Second item

3. Ordered start at three
   - Nested list
4. Next item

- [x] Built-in completion
- [ ] Your next feature

<callout title="Your custom tag">
This component belongs to the demo. It renders **nested Markdown** and $x^2$.

<callout title="Nested tag">
Extensions use the same parser and theme.
</callout>
</callout>
`
