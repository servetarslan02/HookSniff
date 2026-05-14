import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const handleI18nRouting = createMiddleware(routing);

// Match locale prefix WITH the trailing slash to avoid double-slash bug
const LOCALE_REGEX = new RegExp(`^/(${routing.locales.join('|')})(/|$)`);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const withoutLocale = pathname.replace(LOCALE_REGEX, '/');

  // Auth check for admin routes
  if (withoutLocale.startsWith('/admin')) {
    const authCookie = request.cookies.get('hooksniff_token');
    const refreshCookie = request.cookies.get('hooksniff_refresh');
    if (!authCookie && !refreshCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Auth check for dashboard routes (non-public)
  const publicPaths = [
    '/login', '/register', '/auth', '/forgot-password', '/reset-password',
    '/verify-email', '/pricing', '/about', '/contact', '/blog', '/docs',
    '/faq', '/changelog', '/customers', '/alternatives', '/providers',
    '/use-cases', '/webhooks', '/what-is-a-webhook', '/security',
    '/privacy', '/terms', '/status', '/newsletter', '/build-vs-buy',
    '/get-started', '/startups', '/health', '/analytics', '/logs', '/alerts', '/endpoints', '/deliveries', '/search', '/playground', '/signature-verifier', '/api-importer', '/webhook-builder', '/transforms', '/inbound', '/schemas', '/templates', '/portal-customize', '/portal-manage', '/rate-limiting', '/audit-log', '/sso', '/retry-policy', '/routing', '/custom-domain', '/team', '/notifications', '/applications', '/api-keys', '/billing', '/settings', '/service-tokens',
    // Consolidated routes (public)
    '/core', '/monitoring', '/devtools', '/content-mgmt', '/portal-section',
    '/security-section', '/routing-config', '/team-mgmt', '/billing-overview',
    '/settings-section',
  ];
  const isPublic = withoutLocale === '/' || publicPaths.some((path) => withoutLocale.startsWith(path));
  if (!isPublic && !withoutLocale.startsWith('/admin')) {
    const authCookie = request.cookies.get('hooksniff_token');
    const refreshCookie = request.cookies.get('hooksniff_refresh');
    if (!authCookie && !refreshCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Let next-intl handle locale routing
  const response = handleI18nRouting(request);

  // Add CSP header
  response.headers.set(
    'Content-Security-Policy',
    `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://hooksniff-api-1046140057667.europe-west1.run.app https://*.run.app https://*.vercel.app; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`
  );

  return response;
}

export const config = {
  matcher: ['/((?!api/|_next/|_vercel/|.*\\..*).*)'],
};
