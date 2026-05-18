import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const handleI18nRouting = createMiddleware(routing);

// Match locale prefix WITH the trailing slash to avoid double-slash bug
const LOCALE_REGEX = new RegExp(`^/(${routing.locales.join('|')})(/|$)`);

// Route consolidation map: old individual routes → new consolidated routes
const ROUTE_REDIRECTS: Record<string, string> = {
  // Core section
  '/endpoints': '/applications',
  '/api-keys': '/core',
  // Deliveries section
  '/logs': '/deliveries',
  '/search': '/deliveries',
  // Content/Webhooks section (content-mgmt now has inbound, operational, poller, tasks tabs)
  '/transforms': '/content-mgmt',
  '/schemas': '/content-mgmt',
  '/templates': '/content-mgmt',
  '/inbound': '/operational-webhooks',
  // DevTools section
  '/playground': '/devtools',
  '/signature-verifier': '/devtools',
  '/api-importer': '/devtools',
  '/webhook-builder': '/devtools',
  // Observability section
  '/health': '/observability',
  '/alerts': '/observability',
  '/analytics': '/observability',
  // Security section (now inside routing-config)
  '/security-section': '/routing-config',
  // Routing/Config section (now has security + environments tabs)
  '/retry-policy': '/routing-config',
  '/routing': '/routing-config',
  '/custom-domain': '/routing-config',
  '/environments': '/routing-config',
  '/rate-limiting': '/routing-config',
  '/audit-log': '/routing-config',
  '/sso': '/routing-config',
  // Integrations section (now has connectors + streaming tabs)
  '/connectors': '/integrations',
  '/streaming': '/integrations',
  // Account section (now has billing + portal tabs)
  '/team': '/account',
  '/notifications': '/account',
  '/settings': '/account',
  '/service-tokens': '/account',
  '/portal-customize': '/account',
  '/portal-manage': '/account',
  '/billing': '/account',
  // Deleted container pages
  '/team-mgmt': '/account',
  '/settings-section': '/account',
  '/portal-section': '/account',
};

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // NEVER process API routes through i18n middleware
  if (pathname.startsWith('/api/') || pathname.startsWith('/playground-api/')) {
    return NextResponse.next();
  }

  const withoutLocale = pathname.replace(LOCALE_REGEX, '/');

  // Block access to sensitive files
  if (pathname.match(/\.(env|env\.\w+|git|htaccess|htpasswd|bak|old|log|sql|db)$/i) || pathname.startsWith('/.env')) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // Redirect old individual routes to consolidated routes
  // IMPORTANT: Use the original pathname (with locale) for redirect URL
  // to avoid breaking next-intl localePrefix:'never' routing
  const redirectTarget = ROUTE_REDIRECTS[withoutLocale];
  if (redirectTarget) {
    // Preserve the original URL structure — just swap the path
    const url = new URL(request.url);
    // Reconstruct: keep the same origin + locale prefix (if any) + new path
    const localeMatch = pathname.match(LOCALE_REGEX);
    if (localeMatch) {
      url.pathname = `/${localeMatch[1]}${redirectTarget}`;
    } else {
      url.pathname = redirectTarget;
    }
    return NextResponse.redirect(url, 308);
  }

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
    '/get-started', '/startups',
    // Consolidated dashboard routes
    '/core', '/applications', '/deliveries', '/content-mgmt', '/operational-webhooks',
    '/integrations', '/observability', '/devtools', '/routing-config',
    '/account', '/billing-section',
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

  // Add CSP header with nonce-based script protection (only if response is not a redirect)
  if (!response.headers.get('location')) {
    response.headers.set(
      'Content-Security-Policy',
      `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://hooksniff-api-1046140057667.europe-west1.run.app wss://hooksniff-api-1046140057667.europe-west1.run.app https://*.run.app wss://*.run.app https://*.vercel.app https://*.workers.dev https://*.sentry.io https://*.ingest.de.sentry.io; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`
    );
  }

  return response;
}

export const config = {
  matcher: ['/((?!api/|_next/|_vercel/|.*\\..*).*)'],
};
