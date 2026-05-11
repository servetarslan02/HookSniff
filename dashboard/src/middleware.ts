import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Match all paths except: /api/*, /_next/*, /_vercel/*, and files with extensions
    // Note: /docs/api is NOT excluded (only top-level /api is excluded)
    '/((?!api/|_next/|_vercel/|.*\\..*).*)',
  ],
};
