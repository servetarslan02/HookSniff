/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig = {
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
      ],
    }];
  },
  async rewrites() {
    return [
      {
        source: '/api/health',
        destination: 'https://hooksniff-api-1046140057667.europe-west1.run.app/health',
      },
      {
        source: '/api/:path*',
        destination: 'https://hooksniff-api-1046140057667.europe-west1.run.app/v1/:path*',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/:locale/dashboard',
        destination: '/:locale/applications',
        permanent: false,
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
