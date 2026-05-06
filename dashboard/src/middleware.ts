import { NextRequest, NextResponse } from 'next/server';

const locales = ['en', 'tr', 'de', 'ja', 'pt-BR', 'es', 'fr', 'ko'];
const defaultLocale = 'en';

function getLocaleFromPath(pathname: string): string | null {
  for (const loc of locales) {
    if (pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)) {
      return loc;
    }
  }
  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip internal paths
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_vercel') ||
    pathname.match(/\.\w+$/)
  ) {
    return NextResponse.next();
  }

  const localeInPath = getLocaleFromPath(pathname);

  // Root or path without locale → redirect to /en/...
  if (pathname === '/' || !localeInPath) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === '/' ? `/${defaultLocale}` : `/${defaultLocale}${pathname}`;
    return NextResponse.redirect(url);
  }

  // Already has valid locale → continue
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
