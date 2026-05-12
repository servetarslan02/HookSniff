/**
 * Sanitize HTML strings for safe use with dangerouslySetInnerHTML.
 * Uses a simple allowlist-based approach for server-side rendering.
 * For full sanitization, install and use DOMPurify on the client side.
 */

// Allowed HTML tags for syntax highlighting output
const ALLOWED_TAGS = ['span', 'pre', 'code', 'br', 'em', 'strong', 'b', 'i'];

/**
 * Strip any tags not in the allowlist.
 * This is a lightweight server-safe sanitizer for known-safe content patterns
 * (syntax highlighting, JSON-LD, etc.)
 */
export function sanitizeHighlightHtml(html: string): string {
  // Remove any script/event handler attributes
  let sanitized = html.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\son\w+\s*=\s*[^\s>]*/gi, '');

  // Remove any tags not in the allowlist
  sanitized = sanitized.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/gi, (match, tag) => {
    if (ALLOWED_TAGS.includes(tag.toLowerCase())) {
      // Strip non-allowed attributes
      return match.replace(/\s+(?!class(?:Name)?=)[a-zA-Z-]+=(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '');
    }
    return '';
  });

  return sanitized;
}

/**
 * Sanitize JSON-LD structured data.
 * Since we control the input, just ensure it's valid JSON.
 */
export function sanitizeJsonLd(data: unknown): string {
  return JSON.stringify(data);
}
