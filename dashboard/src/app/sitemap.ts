import { MetadataRoute } from 'next';
import { blogSlugs } from '@/lib/blog-slugs';

const BASE_URL = 'https://hooksniff.vercel.app';
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
  '/what-is-a-webhook',
  '/build-vs-buy',
  '/startups',
  '/customers',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // localePrefix: 'never' → no /en/ or /tr/ prefix.
  // All pages serve both languages from a single URL.
  // No hreflang needed — Google treats each URL as the canonical version.

  // Static pages
  for (const page of publicPages) {
    entries.push({
      url: `${BASE_URL}${page}`,
      lastModified,
      changeFrequency: page === '' ? 'daily' : 'weekly',
      priority: page === '' ? 1 : page.startsWith('/blog') ? 0.9 : 0.8,
    });
  }

  // Blog posts
  for (const slug of blogSlugs) {
    entries.push({
      url: `${BASE_URL}/blog/${slug}`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  return entries;
}
