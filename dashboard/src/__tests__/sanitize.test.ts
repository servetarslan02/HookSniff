// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';

// Mock DOMPurify to test server-side fallback path
vi.mock('dompurify', () => ({
  default: {
    sanitize: (html: string) => html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''),
  },
}));

import { sanitizeHighlightHtml, sanitizeJsonLd } from '@/lib/sanitize';

describe('sanitizeHighlightHtml', () => {
  it('allows safe tags (span, pre, code)', () => {
    const input = '<span class="hljs-keyword">const</span> x = 1;';
    const result = sanitizeHighlightHtml(input);
    expect(result).toContain('<span');
    expect(result).toContain('const');
  });

  it('preserves class and className attributes', () => {
    const input = '<code className="language-js" class="hljs">test</code>';
    const result = sanitizeHighlightHtml(input);
    // Server sanitizer lowercases tag/attr names but preserves them
    expect(result).toContain('class');
    expect(result).toContain('test');
  });

  it('removes script tags', () => {
    const input = '<p>Hello</p><script>alert("xss")</script><span>safe</span>';
    const result = sanitizeHighlightHtml(input);
    expect(result).not.toContain('script');
    expect(result).not.toContain('alert');
  });

  it('removes event handler attributes', () => {
    const input = '<span onclick="alert(1)" class="test">text</span>';
    const result = sanitizeHighlightHtml(input);
    // Event handlers should be stripped
    expect(result).not.toContain('onclick');
  });

  it('removes javascript: URLs', () => {
    const input = '<a href="javascript:alert(1)">click</a>';
    const result = sanitizeHighlightHtml(input);
    expect(result).not.toContain('javascript:');
  });

  it('handles empty string', () => {
    expect(sanitizeHighlightHtml('')).toBe('');
  });

  it('handles plain text without HTML', () => {
    expect(sanitizeHighlightHtml('hello world')).toBe('hello world');
  });

  it('removes iframe, object, embed tags', () => {
    const input = '<iframe src="evil.com"></iframe><span>safe</span>';
    const result = sanitizeHighlightHtml(input);
    expect(result).not.toContain('iframe');
    expect(result).toContain('safe');
  });

  it('removes SVG tags', () => {
    const input = '<svg onload="alert(1)"><circle/></svg><span>ok</span>';
    const result = sanitizeHighlightHtml(input);
    expect(result).not.toContain('svg');
  });

  it('removes data: URLs', () => {
    const input = '<img src="data:text/html,<script>alert(1)</script>">';
    const result = sanitizeHighlightHtml(input);
    expect(result).not.toContain('data:');
  });
});

describe('sanitizeJsonLd', () => {
  it('serializes valid JSON-LD', () => {
    const data = { '@context': 'https://schema.org', '@type': 'Organization', name: 'HookSniff' };
    const result = sanitizeJsonLd(data);
    expect(result).toContain('HookSniff');
    expect(JSON.parse(result)).toEqual(data);
  });

  it('handles null', () => {
    expect(sanitizeJsonLd(null)).toBe('null');
  });

  it('handles arrays', () => {
    const result = sanitizeJsonLd([1, 2, 3]);
    expect(JSON.parse(result)).toEqual([1, 2, 3]);
  });

  it('handles nested objects', () => {
    const data = { a: { b: { c: 'deep' } } };
    expect(JSON.parse(sanitizeJsonLd(data))).toEqual(data);
  });
});
