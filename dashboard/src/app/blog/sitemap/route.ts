import { NextResponse } from 'next/server';
import { blogSlugs } from '@/lib/blog-slugs';

export async function GET() {
  const urls = blogSlugs.map(slug => `  <url>
    <loc>https://hooksniff.vercel.app/blog/${slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://hooksniff.vercel.app/blog</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
${urls}
</urlset>`;

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
