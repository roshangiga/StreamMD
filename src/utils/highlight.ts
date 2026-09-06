// Shared syntax highlighting utilities using highlight.js
import hljs from 'highlight.js/lib/core'
import { escapeHtml as escapeHtmlUtil } from './html'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'
import css from 'highlight.js/lib/languages/css'
import xml from 'highlight.js/lib/languages/xml'
import sql from 'highlight.js/lib/languages/sql'
import yaml from 'highlight.js/lib/languages/yaml'
import markdown from 'highlight.js/lib/languages/markdown'
import java from 'highlight.js/lib/languages/java'
import go from 'highlight.js/lib/languages/go'
import rust from 'highlight.js/lib/languages/rust'
import cpp from 'highlight.js/lib/languages/cpp'
import csharp from 'highlight.js/lib/languages/csharp'
import php from 'highlight.js/lib/languages/php'
import ruby from 'highlight.js/lib/languages/ruby'
import swift from 'highlight.js/lib/languages/swift'
import kotlin from 'highlight.js/lib/languages/kotlin'
import scala from 'highlight.js/lib/languages/scala'
import dockerfile from 'highlight.js/lib/languages/dockerfile'
import graphql from 'highlight.js/lib/languages/graphql'

export const SUPPORTED_HIGHLIGHT_LANGUAGES = [
  'javascript', 'js', 'jsx',
  'typescript', 'ts', 'tsx',
  'python', 'py',
  'java', 'json',
  'html', 'xml', 'svg', 'vue',
  'css', 'bash', 'sh', 'shell',
  'sql', 'yaml', 'yml',
  'markdown', 'md',
  'go', 'rust',
  'c', 'cpp',
  'csharp', 'cs',
  'php', 'ruby', 'rb',
  'swift', 'kotlin', 'kt', 'scala',
  'dockerfile', 'docker', 'graphql'
] as const

// Track if languages have been registered (singleton pattern)
let languagesRegistered = false

/**
 * Ensures highlight.js languages are registered (only once)
 */
export function ensureHighlightLanguages(): void {
  if (languagesRegistered) return

  hljs.registerLanguage('javascript', javascript)
  hljs.registerLanguage('js', javascript)
  hljs.registerLanguage('typescript', typescript)
  hljs.registerLanguage('ts', typescript)
  hljs.registerLanguage('python', python)
  hljs.registerLanguage('py', python)
  hljs.registerLanguage('bash', bash)
  hljs.registerLanguage('sh', bash)
  hljs.registerLanguage('shell', bash)
  hljs.registerLanguage('json', json)
  hljs.registerLanguage('css', css)
  hljs.registerLanguage('html', xml)
  hljs.registerLanguage('xml', xml)
  hljs.registerLanguage('svg', xml)
  hljs.registerLanguage('sql', sql)
  hljs.registerLanguage('yaml', yaml)
  hljs.registerLanguage('yml', yaml)
  hljs.registerLanguage('markdown', markdown)
  hljs.registerLanguage('md', markdown)
  hljs.registerLanguage('java', java)
  hljs.registerLanguage('go', go)
  hljs.registerLanguage('rust', rust)
  hljs.registerLanguage('cpp', cpp)
  hljs.registerLanguage('c', cpp)
  hljs.registerLanguage('csharp', csharp)
  hljs.registerLanguage('cs', csharp)
  hljs.registerLanguage('php', php)
  hljs.registerLanguage('ruby', ruby)
  hljs.registerLanguage('rb', ruby)
  hljs.registerLanguage('swift', swift)
  hljs.registerLanguage('kotlin', kotlin)
  hljs.registerLanguage('kt', kotlin)
  hljs.registerLanguage('scala', scala)
  hljs.registerLanguage('dockerfile', dockerfile)
  hljs.registerLanguage('docker', dockerfile)
  hljs.registerLanguage('graphql', graphql)
  hljs.registerLanguage('jsx', javascript)
  hljs.registerLanguage('tsx', typescript)
  hljs.registerLanguage('vue', xml)

  languagesRegistered = true
}

/**
 * Highlights code using highlight.js with language detection fallback
 */
export function highlightCode(code: string, lang: string): string {
  ensureHighlightLanguages()

  if (lang && hljs.getLanguage(lang)) {
    try {
      return hljs.highlight(code, { language: lang }).value
    } catch {
      // Fall through to auto-detect
    }
  }

  // Auto-detect if no language specified or language not found
  try {
    return hljs.highlightAuto(code).value
  } catch {
    // Fall through to escaped HTML
  }

  return escapeHtmlUtil(code)
}

// Re-export hljs for components that need direct access (e.g., checking if language exists)
export { hljs }
