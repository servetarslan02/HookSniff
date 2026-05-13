import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const handleI18nRouting = createMiddleware(routing);

const LOCALE_REGEX = new RegExp(`^/(${routing.locales.join('|')})`);

function getLocaleFromPath(pathname: string): string {
  return pathname.match(LOCALE_REGEX)?.[1] || routing.defaultLocale || 'en';
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const withoutLocale = pathname.replace(LOCALE_REGEX, '/') || '/';
  const locale = getLocaleFromPath(pathname);

  // Redirect old /dashboard/* URLs to root with cookie
  if (withoutLocale.startsWith('/dashboard')) {
    const usernameCookie = request.cookies.get('hooksniff_username');
    if (usernameCookie) {
      const newPath = withoutLocale.replace('/dashboard', `/${usernameCookie.value}`);
      return NextResponse.redirect(new URL(newPath, request.url));
    }
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
    '/get-started', '/startups', '/playground', '/health',
  ];
  const isPublic = publicPaths.some((path) => withoutLocale.startsWith(path));
  if (!isPublic && !withoutLocale.startsWith('/admin')) {
    const authCookie = request.cookies.get('hooksniff_token');
    const refreshCookie = request.cookies.get('hooksniff_refresh');
    if (!authCookie && !refreshCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Let next-intl handle locale routing (sets x-next-intl-locale header, rewrites internally)
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
