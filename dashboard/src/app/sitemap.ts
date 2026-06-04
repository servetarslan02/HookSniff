import { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { blogSlugs } from '@/lib/blog-slugs';

const BASE_URL = 'https://hooksniff.vercel.app';

const locales = routing.locales;
const lastModified = new Date('2026-05-23T00:00:00.000Z');

const publicPages = [
  '',
  '/about',
  '/faq',
  '/contact',
  '/privacy',
  '/terms',
  '/docs',
  '/docs/api-reference',
  '/docs/sdk-libraries',
  '/docs/quickstart',
  '/docs/concepts',
  '/docs/security',
  '/docs/best-practices',
  '/docs/retries',
  '/docs/dlq',
  '/docs/event-types',
  '/docs/error-codes',
  '/status',
  '/login',
  '/register',
  '/pricing',
  '/blog',
  '/compare',
  '/alternatives/svix',
  '/alternatives/hookdeck',
  '/alternatives/hook0',
  '/alternatives/convoy',
  '/playground',
  '/what-is-webhook',
  '/build-vs-buy',
  '/startups',
  '/customers',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // With localePrefix: 'never', URLs don't have /en/ or /tr/ prefix.
  // Each page has a single canonical URL without locale prefix.
  // The alternates.languages field handles hreflang for different locales.

  // Static pages
  for (const page of publicPages) {
    entries.push({
      url: `${BASE_URL}${page}`,
      lastModified,
      changeFrequency: page === '' ? 'daily' : 'weekly',
      priority: page === '' ? 1 : page.startsWith('/blog') ? 0.9 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          [
            ...locales.map((l) => [l, `${BASE_URL}${page}`]),
            ['x-default', `${BASE_URL}${page}`],
          ]
        ),
      },
    });
  }

  // Blog posts
  for (const slug of blogSlugs) {
    entries.push({
      url: `${BASE_URL}/blog/${slug}`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: Object.fromEntries(
          [
            ...locales.map((l) => [l, `${BASE_URL}/blog/${slug}`]),
            ['x-default', `${BASE_URL}/blog/${slug}`],
          ]
        ),
      },
    });
  }

  return entries;
}
