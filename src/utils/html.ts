// Shared HTML utilities

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#39;'
}

/**
 * Escapes HTML special characters to prevent XSS.
 * Handles &, <, >, ", and ' for safe use in HTML content and attributes.
 */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, char => HTML_ESCAPE_MAP[char] || char)
}
