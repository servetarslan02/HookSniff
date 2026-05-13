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
      // Auth
      { source: '/api/auth/:path*', destination: 'https://hooksniff-api-1046140057667.europe-west1.run.app/v1/auth/:path*' },
      // Endpoints
      { source: '/api/endpoints/:path*', destination: 'https://hooksniff-api-1046140057667.europe-west1.run.app/v1/endpoints/:path*' },
      // Webhooks / Deliveries
      { source: '/api/webhooks/:path*', destination: 'https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks/:path*' },
      // Stats
      { source: '/api/stats/:path*', destination: 'https://hooksniff-api-1046140057667.europe-west1.run.app/v1/stats/:path*' },
      // Billing
      { source: '/api/billing/:path*', destination: 'https://hooksniff-api-1046140057667.europe-west1.run.app/v1/billing/:path*' },
      // Team
      { source: '/api/team/:path*', destination: 'https://hooksniff-api-1046140057667.europe-west1.run.app/v1/team/:path*' },
      // API Keys
      { source: '/api/api-keys/:path*', destination: 'https://hooksniff-api-1046140057667.europe-west1.run.app/v1/api-keys/:path*' },
      // Settings
      { source: '/api/settings/:path*', destination: 'https://hooksniff-api-1046140057667.europe-west1.run.app/v1/settings/:path*' },
      // Notifications
      { source: '/api/notifications/:path*', destination: 'https://hooksniff-api-1046140057667.europe-west1.run.app/v1/notifications/:path*' },
      // Inbound
      { source: '/api/inbound/:path*', destination: 'https://hooksniff-api-1046140057667.europe-west1.run.app/v1/inbound/:path*' },
      // Schemas
      { source: '/api/schemas/:path*', destination: 'https://hooksniff-api-1046140057667.europe-west1.run.app/v1/schemas/:path*' },
      // Admin
      { source: '/api/admin/:path*', destination: 'https://hooksniff-api-1046140057667.europe-west1.run.app/v1/admin/:path*' },
      // Alerts
      { source: '/api/alerts/:path*', destination: 'https://hooksniff-api-1046140057667.europe-west1.run.app/v1/alerts/:path*' },
      // Custom Domains
      { source: '/api/custom-domains/:path*', destination: 'https://hooksniff-api-1046140057667.europe-west1.run.app/v1/custom-domains/:path*' },
      // SSO
      { source: '/api/sso/:path*', destination: 'https://hooksniff-api-1046140057667.europe-west1.run.app/v1/sso/:path*' },
      // Teams
      { source: '/api/teams/:path*', destination: 'https://hooksniff-api-1046140057667.europe-west1.run.app/v1/teams/:path*' },
      // Deliveries (individual)
      { source: '/api/deliveries/:path*', destination: 'https://hooksniff-api-1046140057667.europe-west1.run.app/v1/deliveries/:path*' },
      // Service Tokens
      { source: '/api/service-tokens/:path*', destination: 'https://hooksniff-api-1046140057667.europe-west1.run.app/v1/service-tokens/:path*' },
      // GDPR
      { source: '/api/gdpr/:path*', destination: 'https://hooksniff-api-1046140057667.europe-west1.run.app/v1/gdpr/:path*' },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
// Build cache invalidation — Wed May 14 01:03 AM CST 2026

