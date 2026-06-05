import { describe, it, expect } from 'vitest';

describe('sanitizeHighlightHtml', () => {
  it('sanitizes HTML safely', async () => {
    const { sanitizeHighlightHtml } = await import('@/lib/sanitize');
    const result = sanitizeHighlightHtml('<b>bold</b>');
    expect(result).toContain('bold');
  });

  it('handles script tags', async () => {
    const { sanitizeHighlightHtml } = await import('@/lib/sanitize');
    const result = sanitizeHighlightHtml('<script>alert("xss")</script>');
    expect(result).not.toContain('<script>');
  });

  it('handles empty input', async () => {
    const { sanitizeHighlightHtml } = await import('@/lib/sanitize');
    expect(sanitizeHighlightHtml('')).toBe('');
  });
});

describe('sanitizeJsonLd', () => {
  it('produces valid JSON string', async () => {
    const { sanitizeJsonLd } = await import('@/lib/sanitize');
    const result = sanitizeJsonLd({ name: 'test', description: 'desc' });
    expect(typeof result).toBe('string');
    const parsed = JSON.parse(result);
    expect(parsed.name).toBe('test');
  });
});
