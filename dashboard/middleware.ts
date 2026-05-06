import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

const intlMiddleware = createMiddleware(routing);

const locales = ['en', 'tr', 'de', 'ja', 'pt-BR', 'es', 'fr', 'ko'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if pathname already has a locale prefix
  const hasLocale = locales.some(
    (loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)
  );

  // If no locale prefix, redirect to /en/path
  if (!hasLocale && pathname !== '/') {
    const url = request.nextUrl.clone();
    url.pathname = `/en${pathname}`;
    return NextResponse.redirect(url);
  }

  // Root redirect
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/en';
    return NextResponse.rewrite(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
