import { describe, it, expect, vi } from 'vitest';

// Mock next-intl/middleware
vi.mock('next-intl/middleware', () => ({
  default: vi.fn(() => vi.fn()),
}));

// Mock the routing module
vi.mock('../i18n/routing', () => ({
  routing: {
    locales: ['en', 'tr'],
    defaultLocale: 'en',
  },
}));

describe('middleware', () => {
  it('exports a default middleware function', async () => {
    const middleware = (await import('../middleware')).default;
    expect(middleware).toBeDefined();
    expect(typeof middleware).toBe('function');
  });

  it('exports config with correct matcher', async () => {
    const { config } = await import('../middleware');
    expect(config).toBeDefined();
    expect(config.matcher).toBeDefined();
    expect(Array.isArray(config.matcher)).toBe(true);
    expect(config.matcher.length).toBe(1);
  });

  it('matcher excludes api routes', async () => {
    const { config } = await import('../middleware');
    const matcher = config.matcher[0];
    // The matcher pattern should exclude api, _next, _vercel
    expect(matcher).toContain('api');
    expect(matcher).toContain('_next');
  });

  it('matcher matches regular pages', async () => {
    const { config } = await import('../middleware');
    const matcher = config.matcher[0];
    // Create a regex from the matcher pattern
    // The pattern is: /((?!api|_next|_vercel|.*\..*).*)
    // This should match /dashboard but not /api/something
    const regex = new RegExp(matcher);
    expect(regex.test('/dashboard')).toBe(true);
    expect(regex.test('/en/dashboard')).toBe(true);
  });

  it('matcher does not match static files', async () => {
    const { config } = await import('../middleware');
    const matcher = config.matcher[0];
    const regex = new RegExp(matcher);
    expect(regex.test('/favicon.ico')).toBe(false);
    expect(regex.test('/_next/static/chunk.js')).toBe(false);
  });
});
