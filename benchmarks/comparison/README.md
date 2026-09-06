# StreamMD versus Streamdown

Run from the repository root:

```sh
npm ci
npm run build
cd benchmarks/comparison
npm ci
npm start
```

Open `http://127.0.0.1:3113`. Select 10, 100 or 500 KiB, then run the comparison.
The workload is always mixed Markdown: paragraphs, headings, nested lists,
tasks, code, tables, KaTeX, Mermaid and a local image.

## Method

Both libraries receive the same source string, recorded with its SHA-256 and
actual byte count. Math uses shared dollar delimiters. Custom callout wrappers
are removed before either library receives the text. Their Markdown bodies
remain. Diagrams and the image appear at the end, where automatic scrolling
keeps them visible. Streamdown defers off-screen diagrams.

Each library gets one warmup and three measured trials. Run order alternates.
Each trial mounts a fresh component and delivers 100 cumulative updates.
The 10 and 100 KiB runs use MessageChannel with no inserted timer delays.
The 500 KiB run waits 100 ms after each update for both libraries, allowing
asynchronous rendering to progress. These waits are included in total time;
the 500 KiB result uses a different delivery schedule from the smaller sizes.
The page follows the output to the bottom. Results are saved locally after each
trial. The delayed 500 KiB run also saves progress every ten updates; this small
checkpoint overhead is included equally for both libraries.
Library downloads and the initial mount are outside the timed interval.

Total time includes source delivery, DOM work, automatic scrolling, requested
diagram rendering and image completion. There is no fixed settling wait. The README
shows the median total time in seconds. DOM commit and long-task measurements
are retained in the raw JSON. DOM commit time is not paint time.

Completion is enabled for both. StreamMD uses its Vue renderer and highlight.js.
Streamdown uses React, Shiki and its official math/Mermaid plugins. Each keeps
its own rendering optimizations and CSS. React updates use `flushSync`; Vue
updates await `nextTick`, so each delivery waits for its DOM commit.

Checks require matching heading, table, math, image and diagram counts, loaded
images, syntax-highlighted blocks, the final marker and no KaTeX errors. Failed
checks must not be reported as a successful speed result. The two libraries
can use different HTML tags for equivalent content.

Keep the tab visible and avoid other heavy work while measuring. The separate
lockfile pins the comparison dependencies without adding React or Streamdown
to the StreamMD package. This is a browser rendering comparison, not a test of
network transport, server latency or model generation speed.

[Raw results](../results/comparison.json)

Each size also has its own file: [10 KiB](../results/comparison-10-kib.json),
[100 KiB](../results/comparison-100-kib.json) and
[500 KiB](../results/comparison-500-kib.json). An unfinished run is explicitly
marked `complete: false` and must not be used as a completed comparison.
Run `npm run benchmark:comparison-report` from the repository root after all
three sizes pass to regenerate the README table and SVG graph.
