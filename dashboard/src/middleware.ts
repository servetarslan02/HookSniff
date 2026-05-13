import { NextRequest, NextResponse } from 'next/server';

const LOCALES = ['en', 'tr'];
const DEFAULT_LOCALE = 'en';

const PUBLIC_PATHS = [
  '/login', '/register', '/auth', '/forgot-password', '/reset-password',
  '/verify-email', '/pricing', '/about', '/contact', '/blog', '/docs',
  '/faq', '/changelog', '/customers', '/alternatives', '/providers',
  '/use-cases', '/webhooks', '/what-is-a-webhook', '/security',
  '/privacy', '/terms', '/status', '/newsletter', '/build-vs-buy',
  '/get-started', '/startups', '/playground', '/health',
];

const LOCALE_REGEX = /^\/(en|tr)(\/|$)/;

function detectLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get('hooksniff_locale')?.value;
  if (cookieLocale && LOCALES.includes(cookieLocale)) {
    return cookieLocale;
  }
  const acceptLang = request.headers.get('accept-language');
  if (acceptLang) {
    const preferred = acceptLang
      .split(',')
      .map(lang => lang.split(';')[0].trim().toLowerCase().slice(0, 2))
      .find(lang => LOCALES.includes(lang));
    if (preferred) return preferred;
  }
  return DEFAULT_LOCALE;
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Root redirect to /applications
  if (pathname === '/' || pathname === '/en' || pathname === '/tr') {
    return NextResponse.redirect(new URL('/applications', request.url));
  }

  // Redirect old locale-prefixed URLs: /tr/deliveries → /deliveries
  if (LOCALE_REGEX.test(pathname)) {
    const oldLocale = pathname.match(LOCALE_REGEX)?.[1];
    let withoutLocale = pathname.replace(LOCALE_REGEX, '/');

    // Also strip old username if present
    const segments = withoutLocale.split('/').filter(Boolean);
    if (segments.length > 0) {
      const first = segments[0];
      const isKnown = PUBLIC_PATHS.some(p => `/${first}`.startsWith(p)) || first === 'admin';
      if (!isKnown && !first.includes('.')) {
        withoutLocale = '/' + segments.slice(1).join('/');
      }
    }

    const response = NextResponse.redirect(new URL(withoutLocale || '/', request.url));
    if (oldLocale) {
      response.cookies.set('hooksniff_locale', oldLocale, { maxAge: 31536000, path: '/', sameSite: 'lax' });
    }
    return response;
  }

  // Auth check
  if (!isPublicRoute(pathname) && !pathname.startsWith('/admin')) {
    const authCookie = request.cookies.get('hooksniff_token');
    const refreshCookie = request.cookies.get('hooksniff_refresh');
    if (!authCookie && !refreshCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname.startsWith('/admin')) {
    const authCookie = request.cookies.get('hooksniff_token');
    const refreshCookie = request.cookies.get('hooksniff_refresh');
    if (!authCookie && !refreshCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();
  response.headers.set('x-locale', detectLocale(request));

  if (!request.cookies.get('hooksniff_locale')) {
    response.cookies.set('hooksniff_locale', detectLocale(request), {
      maxAge: 31536000, path: '/', sameSite: 'lax',
    });
  }

  response.headers.set(
    'Content-Security-Policy',
    `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://hooksniff-api-1046140057667.europe-west1.run.app https://*.run.app https://*.vercel.app; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`
  );

  return response;
}

export const config = {
  matcher: ['/((?!api/|_next/|_vercel/|.*\\..*).*)'],
};
