import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const handleI18nRouting = createMiddleware(routing);

/**
 * Generate a cryptographic nonce for CSP script-src.
 * Used to replace 'unsafe-eval' with nonce-based script trust.
 */
function generateNonce(): string {
  const buffer = new Uint8Array(16);
  crypto.getRandomValues(buffer);
  // Base64-encode without padding (CSP nonce convention)
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

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

  // BUG-022: Generate per-request nonce for CSP script-src.
  // Replaces 'unsafe-eval' with nonce-based trust. Next.js automatically
  // picks up the nonce from the 'x-nonce' request header for inline scripts.
  const nonce = generateNonce();

  // Apply i18n routing for all other routes
  const response = handleI18nRouting(request);

  // Set nonce as request header so Next.js can use it for inline scripts
  response.headers.set('x-nonce', nonce);

  // CSP header with nonce — 'unsafe-eval' removed (not needed in Next.js 15+ production).
  // 'unsafe-inline' kept for style-src (required by Next.js CSS-in-JS / styled-jsx).
  // 'strict-dynamic' ensures scripts loaded by a nonce-trusted script are also trusted.
  // Older browsers that don't support 'strict-dynamic' fall back to 'unsafe-inline'.
  response.headers.set(
    'Content-Security-Policy',
    `default-src 'self'; script-src 'self' 'nonce-${nonce}' 'unsafe-inline' 'strict-dynamic'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://hooksniff-api-1046140057667.europe-west1.run.app https://*.run.app https://*.vercel.app; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`
  );

  return response;
}

export const config = {
  matcher: [
    '/((?!api/|_next/|_vercel/|.*\\..*).*)',
  ],
};
