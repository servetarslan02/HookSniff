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
  async redirects() {
    return [
      // ── Core ──
      { source: '/endpoints', destination: '/core', permanent: false },
      { source: '/deliveries', destination: '/core', permanent: false },
      { source: '/search', destination: '/core', permanent: false },
      // ── Monitoring ──
      { source: '/logs', destination: '/monitoring', permanent: false },
      { source: '/health', destination: '/monitoring', permanent: false },
      { source: '/alerts', destination: '/monitoring', permanent: false },
      { source: '/analytics', destination: '/monitoring', permanent: false },
      // ── DevTools ──
      { source: '/playground', destination: '/devtools', permanent: false },
      { source: '/signature-verifier', destination: '/devtools', permanent: false },
      { source: '/api-importer', destination: '/devtools', permanent: false },
      { source: '/webhook-builder', destination: '/devtools', permanent: false },
      // ── Content Mgmt ──
      { source: '/transforms', destination: '/content-mgmt', permanent: false },
      { source: '/inbound', destination: '/content-mgmt', permanent: false },
      { source: '/schemas', destination: '/content-mgmt', permanent: false },
      { source: '/templates', destination: '/content-mgmt', permanent: false },
      // ── Portal ──
      { source: '/portal-customize', destination: '/portal-section', permanent: false },
      { source: '/portal-manage', destination: '/portal-section', permanent: false },
      // ── Security ──
      { source: '/rate-limiting', destination: '/security-section', permanent: false },
      { source: '/audit-log', destination: '/security-section', permanent: false },
      { source: '/sso', destination: '/security-section', permanent: false },
      // ── Routing Config ──
      { source: '/retry-policy', destination: '/routing-config', permanent: false },
      { source: '/routing', destination: '/routing-config', permanent: false },
      { source: '/custom-domain', destination: '/routing-config', permanent: false },
      // ── Team ──
      { source: '/team', destination: '/team-mgmt', permanent: false },
      { source: '/notifications', destination: '/team-mgmt', permanent: false },
      { source: '/applications', destination: '/team-mgmt', permanent: false },
      // ── Billing ──
      { source: '/api-keys', destination: '/billing-overview', permanent: false },
      { source: '/billing', destination: '/billing-overview', permanent: false },
      // ── Settings ──
      { source: '/settings', destination: '/settings-section', permanent: false },
      { source: '/service-tokens', destination: '/settings-section', permanent: false },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/health',
        destination: 'https://hooksniff-api-1046140057667.europe-west1.run.app/health',
      },
      // No catch-all rewrite — NEXT_PUBLIC_API_URL points directly to Cloud Run
      // Local API routes (playground, newsletter, status) are served by Next.js
    ];
  },
};

module.exports = withNextIntl(nextConfig);
// Build cache invalidation — Wed May 14 01:03 AM CST 2026

