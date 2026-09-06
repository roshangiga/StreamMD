# Benchmarks

Build the package with `npm run build`. Then run:

```sh
npm run benchmark
```

This builds a production browser app and serves it at `http://127.0.0.1:3110`.
Select a workload, size and mode. Keep the tab visible and avoid running builds
or other CPU-heavy work during measurements. Download the raw JSON afterward.

## Workloads

| Profile | Elements exercised |
| --- | --- |
| prose | Headings, links, bold, italic, strikethrough and inline code |
| structure | Heading levels, nested/ordered/task lists, blockquotes, rules |
| code | TypeScript, Python, JSON, tilde fences and indented code |
| tables | Alignment, formatted cells, links and KaTeX in cells |
| math | Inline/display KaTeX, integrals, matrices, probability, chemistry/units |
| mermaid | Flowchart and sequence SVG rendering |
| images | Local SVG fixture; no remote network dependency |
| extensions | Nested custom tags, attributes, Markdown and math |
| mixed | All the above in a single document |

Targets are 10/100/500 KiB. Fixtures contain complete Markdown blocks, so actual
bytes are recorded rather than claiming exact target length. Repeated rich content
scales with target size. Mermaid, image and extension profiles deliberately cap
their element groups at 1/5/12 and fill remaining space with prose; mixed mode
contains diagrams/images/extensions plus repeated rich Markdown. The JSON records
group count and hashes so these workloads cannot be confused.

The runner checks every profile's required selectors, KaTeX errors, diagram counts,
image decoding and final output. A failed correctness check remains a failed run
even if its timing is fast. Diagram rendering is explicitly requested and timed.

## Measurements

- One warmup, then three trials by default. JSON retains all trials.
- Static mode assigns the full document once.
- Update mode appends prefixes without temporary markers in the Markdown source.
- DOM commit latency measures assignment through Vue `nextTick`, not actual paint.
- DOM-ready time covers source delivery; total-ready time also includes requested
  Mermaid rendering and image completion. It includes scheduling and settling.
- Long tasks are browser tasks over 50 ms, where the browser supports the API.
- Median/min/max summarize total-ready times. These are observations, not universal
  performance guarantees. Report environment and configuration with any comparison.

Completion is always included. There is no reduced-feature or completion-off mode.
Different syntax highlighters, CSS, math settings, browser versions and fixtures
make direct comparisons invalid unless those differences are stated.

## Core CPU suite

```sh
npm run benchmark:core
```

Results go to `benchmarks/results/core.json`. Each profile/size measures tokenization
and HTML rendering separately, with warmup and three trials. These timings include
completion and math parsing; HTML rendering includes KaTeX. They do not include
Vue, syntax highlighting, Mermaid SVG generation, image decoding or browser layout.
Do not use them as a claim about end-to-end visual smoothness.

Earlier portal/Streamdown results used a different app and an older measurement
method. They are not evidence that this extracted product is faster.

## Recorded results

For the mixed-content comparison against Streamdown with no artificial update
delays, see [the comparison runner](comparison/README.md).

See [RESULTS.md](RESULTS.md) for the generated tables and links to raw data.
After replacing the result JSON with your own runs, use
`npm run benchmark:report` to regenerate the report. Preserve failed runs and
report browser configuration alongside timing comparisons.
