import { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { posts } from './[locale]/blog/[slug]/data';

const BASE_URL = 'https://hooksniff.vercel.app';

const locales = routing.locales;

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
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1 : page.startsWith('/blog') ? 0.9 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${BASE_URL}/${l}${page}`])
          ),
        },
      });
    }
  }

  // Blog posts
  const blogSlugs = Object.keys(posts);
  for (const slug of blogSlugs) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${BASE_URL}/${l}/blog/${slug}`])
          ),
        },
      });
    }
  }

  return entries;
}
