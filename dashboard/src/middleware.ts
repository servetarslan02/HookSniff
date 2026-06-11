import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const handleI18nRouting = createMiddleware(routing);

// Match locale prefix WITH the trailing slash to avoid double-slash bug
const LOCALE_REGEX = new RegExp(`^/(${routing.locales.join('|')})(/|$)`);

// SECURITY: Validate that a cookie value looks like a JWT (3 dot-separated base64url parts).
// Prevents accepting garbage/expired tokens as valid auth.
// Full JWT verification happens server-side in /api/auth/me.
function isValidJwtFormat(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  return parts.every(p => p.length > 0 && /^[A-Za-z0-9_-]+$/.test(p));
}

// Route consolidation map: old individual routes → new consolidated routes
const ROUTE_REDIRECTS: Record<string, string> = {
  // Core section
  '/endpoints': '/applications',
  '/api-keys': '/core',
  // Deliveries section
  '/logs': '/deliveries',
  '/search': '/deliveries',
  // Content/Webhooks section (content-mgmt now has inbound, operational, poller, tasks tabs)
  '/transforms': '/operational-webhooks',
  '/schemas': '/operational-webhooks',
  '/templates': '/operational-webhooks',
  '/inbound': '/operational-webhooks',
  // DevTools section (playground is public, don't redirect)
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
  '/environments': '/routing-config',
  '/rate-limiting': '/routing-config',
  '/sso': '/organization',
  '/team': '/organization',
  '/audit-log': '/organization',
  // Integrations section (now has connectors + streaming tabs)
  '/connectors': '/integrations',
  '/streaming': '/integrations',
  // Account section (now has billing + portal tabs)
  '/notifications': '/account',
  '/settings': '/account',
  '/service-tokens': '/core',
  '/portal-customize': '/account',
  '/portal-manage': '/account',
  // Deleted container pages
  '/team-mgmt': '/organization',
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
    const authCookie = request.cookies.get('hooksniff_token')?.value;
    const refreshCookie = request.cookies.get('hooksniff_refresh')?.value;
    const hasValidAuth = (authCookie && isValidJwtFormat(authCookie)) || (refreshCookie && isValidJwtFormat(refreshCookie));
    if (!hasValidAuth) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Auth check for dashboard routes (non-public)
  // NOTE: Only list truly public pages here. Dashboard routes under (dashboard)/
  // are already protected by AuthGuard in (dashboard)/layout.tsx — listing them
  // here would bypass the middleware redirect and force a slower client-side check.
  const publicPaths = [
    '/login', '/register', '/auth', '/forgot-password', '/reset-password',
    '/verify-email', '/pricing', '/about', '/contact', '/blog', '/docs',
    '/faq', '/changelog', '/customers', '/alternatives', '/providers',
    '/use-cases', '/webhooks', '/what-is-a-webhook', '/security',
    '/privacy', '/terms', '/status', '/newsletter', '/build-vs-buy',
    '/get-started', '/startups', '/compare', '/playground',
  ];
  const isPublic = withoutLocale === '/' || publicPaths.some((path) => withoutLocale.startsWith(path));
  if (!isPublic && !withoutLocale.startsWith('/admin')) {
    const authCookie = request.cookies.get('hooksniff_token')?.value;
    const refreshCookie = request.cookies.get('hooksniff_refresh')?.value;
    const hasValidAuth = (authCookie && isValidJwtFormat(authCookie)) || (refreshCookie && isValidJwtFormat(refreshCookie));
    if (!hasValidAuth) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Let next-intl handle locale routing
  return handleI18nRouting(request);
}

export const config = {
  matcher: ['/((?!api/|_next/|_vercel/|.*\\..*).*)'],
};
