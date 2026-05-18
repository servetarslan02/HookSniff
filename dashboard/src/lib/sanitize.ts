/**
 * Sanitize HTML strings for safe use with dangerouslySetInnerHTML.
 *
 * Client-side: Uses DOMPurify for full sanitization.
 * Server-side (SSR): Uses allowlist-based fallback.
 */

// Allowed HTML tags for syntax highlighting output
const ALLOWED_TAGS = ['span', 'pre', 'code', 'br', 'em', 'strong', 'b', 'i'];
const ALLOWED_ATTRS = ['class', 'className', 'data-language', 'data-line'];

/**
 * Server-safe sanitizer (SSR fallback).
 * Allowlist-based — only permits known-safe tags and attributes.
 */
function serverSanitize(html: string): string {
  // Remove any script/event handler attributes
  let sanitized = html.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\son\w+\s*=\s*[^\s>]*/gi, '');

  // Remove javascript: URLs
  sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '');
  sanitized = sanitized.replace(/src\s*=\s*["']javascript:[^"']*["']/gi, '');

  // Remove any tags not in the allowlist
  sanitized = sanitized.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/gi, (match, tag) => {
    if (ALLOWED_TAGS.includes(tag.toLowerCase())) {
      // Strip non-allowed attributes
      return match.replace(/\s+(?!(?:class|className)(?:\s*=))[\w-]+=(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '');
    }
    return '';
  });

  return sanitized;
}

/**
 * Sanitize HTML — uses DOMPurify on client, fallback on server.
 */
export function sanitizeHighlightHtml(html: string): string {
  // Client-side: use DOMPurify
  if (typeof window !== 'undefined') {
    try {
      const DOMPurify = require('dompurify');
      return DOMPurify.sanitize(html, {
        ALLOWED_TAGS,
        ALLOWED_ATTR: ALLOWED_ATTRS,
        ALLOW_DATA_ATTR: false,
      });
    } catch {
      // Fallback if DOMPurify not available
    }
  }

  // Server-side fallback
  return serverSanitize(html);
}

/**
 * Sanitize JSON-LD structured data.
 * Since we control the input, just ensure it's valid JSON.
 */
export function sanitizeJsonLd(data: unknown): string {
  return JSON.stringify(data);
}
