/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
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
        { key: 'X-XSS-Protection', value: '1; mode=block' },
      ],
    }];
  },
  async rewrites() {
    return [
      {
        source: '/api/health',
        destination: 'https://hooksniff-api-sdjufmaqka-ew.a.run.app/health',
      },
      {
        source: '/api/:path*',
        destination: 'https://hooksniff-api-sdjufmaqka-ew.a.run.app/v1/:path*',
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
