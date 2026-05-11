import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const handleI18nRouting = createMiddleware(routing);

// Build locale regex from routing config (avoids hardcoding)
const LOCALE_REGEX = new RegExp(`^/(${routing.locales.join('|')})`);

// Protected routes that require authentication
const PROTECTED_PATHS = ['/dashboard', '/admin'];

function isProtectedRoute(pathname: string): boolean {
  // Use startsWith to avoid false matches like "/something-dashboard"
  // Strip locale prefix first (e.g. /tr/dashboard → /dashboard)
  const withoutLocale = pathname.replace(LOCALE_REGEX, '') || '/';
  return PROTECTED_PATHS.some((path) => withoutLocale.startsWith(path));
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is a protected route
  if (isProtectedRoute(pathname)) {
    // Check for auth cookie (HttpOnly cookie set by the API)
    const authCookie = request.cookies.get('hooksniff_token');
    const refreshCookie = request.cookies.get('hooksniff_refresh');

    // If no auth cookie and no refresh cookie, redirect to login
    // Note: having only refreshCookie is valid — the API will handle token refresh
    if (!authCookie && !refreshCookie) {
      const locale = pathname.match(LOCALE_REGEX)?.[1] || routing.defaultLocale || 'en';
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Apply i18n routing for all other routes
  return handleI18nRouting(request);
}

export const config = {
  matcher: [
    '/((?!api/|_next/|_vercel/|.*\\..*).*)',
  ],
};
