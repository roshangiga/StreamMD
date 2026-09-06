export const KATEX_MACROS: Record<string, string> = {
  '\\imaginaryI': '\\mathrm{i}',
  '\\imaginaryJ': '\\mathrm{j}',
  '\\exponentialE': '\\mathrm{e}',
  '\\differentialD': '\\mathrm{d}',
  '\\capitalDifferentialD': '\\mathrm{D}',
  '\\N': '\\mathbb{N}',
  '\\Z': '\\mathbb{Z}',
  '\\Q': '\\mathbb{Q}',
  '\\R': '\\mathbb{R}',
  '\\C': '\\mathbb{C}',
  '\\P': '\\mathbb{P}',
  '\\H': '\\mathbb{H}'
}

const MATHLIVE_PLACEHOLDER_RE = /\\placeholder(?:\[[^\]]*\])?(?:\{[^}]*\})?/g

export function normalizeKatexInput(value: string): string {
  return value.replace(MATHLIVE_PLACEHOLDER_RE, '\\square')
}
