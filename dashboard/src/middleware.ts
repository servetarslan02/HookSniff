import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const handleI18nRouting = createMiddleware(routing);

// Build locale regex from routing config (avoids hardcoding)
const LOCALE_REGEX = new RegExp(`^/(${routing.locales.join('|')})`);

// Reserved slugs that cannot be usernames
const RESERVED_SLUGS = [
  'api', '_next', '_vercel', 'admin', 'login', 'register', 'auth',
  'pricing', 'about', 'contact', 'blog', 'docs', 'faq', 'changelog',
  'compare', 'customers', 'alternatives', 'providers', 'use-cases',
  'webhooks', 'what-is-a-webhook', 'security', 'privacy', 'terms',
  'status', 'newsletter', 'build-vs-buy', 'get-started', 'startups',
  'playground', 'verify-email', 'health',
];

// Protected routes that require authentication
const PROTECTED_PATHS = ['/admin'];

function getUsernameFromPath(pathname: string): string | null {
  const withoutLocale = pathname.replace(LOCALE_REGEX, '') || '/';
  const segments = withoutLocale.split('/').filter(Boolean);
  if (segments.length === 0) return null;
  return segments[0];
}

function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug);
}

function isProtectedRoute(pathname: string): boolean {
  const withoutLocale = pathname.replace(LOCALE_REGEX, '') || '/';
  return PROTECTED_PATHS.some((path) => withoutLocale.startsWith(path));
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect old /dashboard/* URLs to /{username}/* with cookie
  const withoutLocale = pathname.replace(LOCALE_REGEX, '') || '/';
  if (withoutLocale.startsWith('/dashboard')) {
    const locale = pathname.match(LOCALE_REGEX)?.[1] || routing.defaultLocale || 'en';
    // Try to get username from cookie (set during login)
    const usernameCookie = request.cookies.get('hooksniff_username');
    if (usernameCookie) {
      const newPath = withoutLocale.replace('/dashboard', `/${usernameCookie.value}`);
      return NextResponse.redirect(new URL(`/${locale}${newPath}`, request.url));
    }
    // Fallback: redirect to login
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check if this is a username route (not a reserved slug)
  const username = getUsernameFromPath(pathname);
  if (username && !isReservedSlug(username) && !isProtectedRoute(pathname)) {
    // Check for auth cookie
    const authCookie = request.cookies.get('hooksniff_token');
    const refreshCookie = request.cookies.get('hooksniff_refresh');

    // If no auth cookie, redirect to login
    if (!authCookie && !refreshCookie) {
      const locale = pathname.match(LOCALE_REGEX)?.[1] || routing.defaultLocale || 'en';
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Check admin protected routes
  if (isProtectedRoute(pathname)) {
    const authCookie = request.cookies.get('hooksniff_token');
    const refreshCookie = request.cookies.get('hooksniff_refresh');

    if (!authCookie && !refreshCookie) {
      const locale = pathname.match(LOCALE_REGEX)?.[1] || routing.defaultLocale || 'en';
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Apply i18n routing for all other routes
  const response = handleI18nRouting(request);

  // CSP header
  response.headers.set(
    'Content-Security-Policy',
    `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://hooksniff-api-1046140057667.europe-west1.run.app https://*.run.app https://*.vercel.app; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`
  );

  return response;
}

export const config = {
  matcher: [
    '/((?!api/|_next/|_vercel/|.*\\..*).*)',
  ],
};
