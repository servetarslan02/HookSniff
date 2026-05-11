import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const handleI18nRouting = createMiddleware(routing);

// Protected routes that require authentication
const PROTECTED_PATHS = ['/dashboard', '/admin'];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PATHS.some((path) => pathname.includes(path));
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is a protected route
  if (isProtectedRoute(pathname)) {
    // Check for auth cookie (HttpOnly cookie set by the API)
    const authCookie = request.cookies.get('hooksniff_token');
    const refreshCookie = request.cookies.get('hooksniff_refresh');

    // If no auth cookie and no refresh cookie, redirect to login
    if (!authCookie && !refreshCookie) {
      const locale = pathname.match(/^\/(tr|en)/)?.[1] || 'en';
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
    // Match all paths except: /api/*, /_next/*, /_vercel/*, and files with extensions
    // Note: /docs/api is NOT excluded (only top-level /api is excluded)
    '/((?!api/|_next/|_vercel/|.*\\..*).*)',
  ],
};
