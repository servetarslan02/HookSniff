/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig = {
  // output: 'standalone' — REMOVED: Vercel handles its own serverless bundling.
  // outputFileTracingRoot — REMOVED: was causing pages to be missing on Vercel serverless.
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        // CSP is set by middleware (src/middleware.ts) with per-request nonce.
        // Do NOT duplicate Content-Security-Policy here — it would override the nonce.
      ],
    }];
  },
  // Redirects removed — they conflict with next-intl locale routing.
  // Sidebar links already point to consolidated pages (core, monitoring, devtools, etc.)
  // Old pages (endpoints, deliveries, logs, health, etc.) are still accessible via direct URL.
  async rewrites() {
    return [
      {
        source: '/api/health',
        destination: 'https://hooksniff-edge-proxy.servetarslan02.workers.dev/health',
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
// Build cache invalidation — Wed May 14 01:03 AM CST 2026

// deploy trigger Thu May 14 03:05:08 AM CST 2026
