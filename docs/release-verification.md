# Local release verification — 0.1.0

Verified on Windows on 6 September 2026 (local time). This records local proof;
see [GitHub Actions](https://github.com/roshangiga/StreamMD/actions) for remote CI.
The package has not been published to npm.

## Package and fresh installation

A source-only copy was created outside the development repository. On Node
22.23.2, `npm ci` and `npm run release:check` completed successfully. The same
source also passed build, tests and type checking under Node 24.19.0.

The release script checks:

- Library build, TypeScript declarations and docs production build.
- All 46 tests across core behavior, Vue rendering and benchmark fixtures.
- Tarball contents: compiled exports, types, CSS, fonts and licences.
- Installation of the tarball in a temporary consumer outside the repository.
- Core-only installation without Vue and a Node import/render smoke test.
- Vue SSR using the installed package.
- Installed declaration resolution under strict TypeScript NodeNext, including
  rejected invalid argument and prop types.
- A production Vite application using only the installed package exports.

The consumer production build was then opened in the browser. Its heading,
KaTeX expression and requested Mermaid SVG rendered successfully. Evidence:
[package check](evidence/package-check.json) and
[installed browser check](evidence/installed-browser.json).

## Browser behavior

The docs/playground was checked with the built public exports:

- Headings, nested lists, tasks, links, tables, code and custom nested callouts.
- Inline/display math, chemistry and math in table cells, without KaTeX errors.
- Code highlighting and a uniform code background with compact padding.
- Clipboard success feedback and table expansion.
- Mermaid source/diagram switching, expanded rendering, readable dark theme
  and a visible error for invalid source.
- Dialog Escape behavior and focus restoration to the triggering table button.
- Incomplete Markdown formatting with completion applied automatically.

See the [dark Mermaid screenshot](evidence/mermaid-dark.png).

## Benchmarks

The final core suite covers all nine profiles at 10/100/500 KiB targets,
measuring tokenization and HTML rendering separately: 54 measurements, each
with warmup and three trials. The browser suite exercises all nine profiles,
including KaTeX, requested Mermaid SVGs and decoded local images. Configurations,
actual byte counts, fixture hashes, timings and correctness checks are retained
in [raw results and generated tables](../benchmarks/RESULTS.md).

All 12 recorded browser configurations passed, with one warmup and three
measured trials each: nine 10 KiB update workloads, mixed 100/500 KiB updates,
and mixed 10 KiB static rendering. The math workload produced 294 KaTeX
expressions without errors. The mixed 500 KiB update median was 44.547 seconds;
the tab was temporarily unresponsive during that stress run.

Raw JSON was saved from the benchmark's visible results panel. The browser
connection dropped during the separate download-button check, so native file
download completion is not verified. The button now retains its Blob URL long
enough for the browser to begin the download. The results panel also exposes
the complete JSON for manual copying.

These measurements do not establish superiority over another library. Large
mixed documents can produce substantial main-thread delays. Browser DOM commit
time is not paint time, and requested update intervals are included in total
duration. Read the [methodology](../benchmarks/README.md) before comparing runs.

## Streamdown comparison

The separate [Streamdown comparison](../benchmarks/COMPARISON.md) passed all
warmup and measured rendering checks at 10, 100 and 500 KiB. The 500 KiB run
uses a 100 ms delay after each update for both libraries; 10/100 KiB have no
inserted delay. Its median totals are 38.03 s for StreamMD and 274.86 s for
Streamdown. The three measured Streamdown totals were 382.93, 274.62 and
274.86 s; all individual runs are retained in the per-size result files.

## Publication boundary

CI is configured for Node 22/24 on Windows/Linux, but its remote matrix is not
yet verified. Pages deployment is manual. The npm package name is not reserved.
The production docs build reports large dependency chunks for math and diagrams;
Mermaid loads on demand. These are not failures of the local release checks.

Repository and private security-report URLs point to
[roshangiga/StreamMD](https://github.com/roshangiga/StreamMD).
Follow the [release guide](releasing.md) for registry publication or hosted docs.
