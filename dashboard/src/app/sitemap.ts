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

  // Static pages
  for (const page of publicPages) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified,
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1 : page.startsWith('/blog') ? 0.9 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            [
              ...locales.map((l) => [l, `${BASE_URL}/${l}${page}`]),
              ['x-default', `${BASE_URL}/en${page}`],
            ]
          ),
        },
      });
    }
  }

  // Blog posts
  for (const slug of blogSlugs) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/blog/${slug}`,
        lastModified,
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            [
              ...locales.map((l) => [l, `${BASE_URL}/${l}/blog/${slug}`]),
              ['x-default', `${BASE_URL}/en/blog/${slug}`],
            ]
          ),
        },
      });
    }
  }

  return entries;
}
