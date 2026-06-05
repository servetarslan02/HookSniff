/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require('next-intl/plugin');
const { withSentryConfig } = require('@sentry/nextjs');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
const nextConfig = {
  reactStrictMode: true,
  // output: 'standalone' removed — incompatible with Vercel API routes
  cacheComponents: true,
  reactCompiler: true,
  turbopack: {
    root: __dirname,
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'recharts',
      'date-fns',
      'lodash-es',
      '@tanstack/react-query',
      '@tanstack/react-query-devtools',
      'clsx',
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
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
        { key: 'Content-Security-Policy', value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com https://browser.sentry-cdn.com",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: https: blob:",
          "font-src 'self' data:",
          "connect-src 'self' https://hooksniff-api-e6ztf3x2ma-ew.a.run.app wss://hooksniff-api-e6ztf3x2ma-ew.a.run.app https://*.sentry.io https://vitals.vercel-insights.com https://cloudflareinsights.com wss:",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join('; ') },
      ],
    }];
  },
  // Rewrites removed — Next.js API routes proxy to backend directly
  // This avoids Vercel edge DNS_HOSTNAME_RESOLVED_PRIVATE issues
};

// Bundle analyzer â€” ANALYZE=true npm run build
const withBundleAnalyzer = process.env.ANALYZE === 'true'
  ? require('@next/bundle-analyzer')({ enabled: true })
  : (config) => config;

const baseConfig = withBundleAnalyzer(withNextIntl(nextConfig));

// Only enable Sentry sourcemap upload when org + project + auth token are configured
if (process.env.SENTRY_ORG && process.env.SENTRY_PROJECT && process.env.SENTRY_AUTH_TOKEN) {
  module.exports = withSentryConfig(baseConfig, {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    silent: !process.env.CI,
    widenClientFileUpload: true,
    hideSourceMaps: true,
    disableLogger: true,
    automaticVercelMonitors: true,
    telemetry: false,
    // Don't fail the build if Sentry upload fails
    errorHandler: (err) => {
      console.warn('âš ï¸ Sentry upload error (non-fatal):', err.message);
    },
  });
} else {
  module.exports = baseConfig;
}
