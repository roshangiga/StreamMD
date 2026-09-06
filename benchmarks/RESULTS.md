# Recorded benchmark results

Generated from raw JSON. These measurements belong to this machine and configuration, not a universal speed claim.

## Core CPU

2026-09-05T21:35:45.019Z; v24.19.0; win32/x64; 13th Gen Intel(R) Core(TM) i7-13620H.

Completion is included. HTML timings exclude Vue, highlighting, Mermaid SVG and layout.

| Profile | Target KiB | Tokenize median ms | HTML median ms |
| --- | ---: | ---: | ---: |
| prose | 10 | 3.58 | 2.60 |
| prose | 100 | 91.49 | 93.81 |
| prose | 500 | 2038.48 | 2037.76 |
| structure | 10 | 2.46 | 2.48 |
| structure | 100 | 22.11 | 23.94 |
| structure | 500 | 166.41 | 177.28 |
| code | 10 | 0.42 | 0.52 |
| code | 100 | 2.43 | 4.82 |
| code | 500 | 11.82 | 15.56 |
| tables | 10 | 7.96 | 12.32 |
| tables | 100 | 640.60 | 683.72 |
| tables | 500 | 15800.36 | 16343.81 |
| math | 10 | 2.35 | 25.36 |
| math | 100 | 105.31 | 356.54 |
| math | 500 | 2510.01 | 3877.60 |
| mermaid | 10 | 0.31 | 0.30 |
| mermaid | 100 | 2.77 | 2.78 |
| mermaid | 500 | 14.22 | 13.86 |
| images | 10 | 0.44 | 0.35 |
| images | 100 | 3.25 | 3.27 |
| images | 500 | 19.01 | 18.95 |
| extensions | 10 | 0.33 | 0.37 |
| extensions | 100 | 3.01 | 3.34 |
| extensions | 500 | 17.56 | 18.42 |
| mixed | 10 | 1.87 | 7.15 |
| mixed | 100 | 26.74 | 93.75 |
| mixed | 500 | 320.95 | 703.57 |

[Raw core data](results/core.json)

## Browser

Warmups excluded from medians. Total time includes DOM updates and diagram/image readiness. Single-trial runs have no statistical spread.

| Profile | Target KiB | Mode | Trials | Total median ms | Checks |
| --- | ---: | --- | ---: | ---: | --- |
| prose | 10 | updates | 3 | 1927.50 | PASS |
| structure | 10 | updates | 3 | 2050.70 | PASS |
| code | 10 | updates | 3 | 1946.00 | PASS |
| tables | 10 | updates | 3 | 2319.10 | PASS |
| math | 10 | updates | 3 | 2839.80 | PASS |
| mermaid | 10 | updates | 3 | 1898.00 | PASS |
| images | 10 | updates | 3 | 1863.80 | PASS |
| extensions | 10 | updates | 3 | 1883.80 | PASS |
| mixed | 10 | updates | 3 | 2378.90 | PASS |
| mixed | 100 | updates | 3 | 7096.10 | PASS |
| mixed | 500 | updates | 3 | 44547.00 | PASS |
| mixed | 10 | static | 3 | 234.50 | PASS |

[Raw browser data](results/browser.json)
