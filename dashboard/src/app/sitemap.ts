import { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';

const BASE_URL = 'https://hooksniff.vercel.app';

const locales = routing.locales;

const publicPages = ['', '/about', '/faq', '/contact', '/privacy', '/terms', '/docs', '/docs/api-reference', '/docs/sdk-libraries', '/status', '/login'];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const page of publicPages) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${BASE_URL}/${l}${page}`])
          ),
        },
      });
    }
  }

  return entries;
}
