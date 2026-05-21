import { NextResponse } from 'next/server';

const posts = [
  'hooksniff-vs-svix-vs-hookdeck',
  'may-2026-changelog',
  'building-mcp-ready-webhooks',
  'webhook-integration-tutorial',
  'why-ai-agents-need-webhooks',
  'gemini-webhook-integration',
  'stripe-webhook-guide',
  'changelog-may-2026',
  'webhook-architecture-deep-dive',
  'customer-spotlight-ecommerce',
  'introducing-hooksniff',
  'webhook-best-practices',
  'fifo-webhook-delivery',
  'github-webhook-guide',
  'cloudevents-standard',
  'webhook-security-guide',
  'shopify-webhook-incident-analysis',
  'what-is-a-webhook',
  'webhook-vs-polling',
  'best-free-webhook-services-2026',
  'webhook-vs-api',
  'webhook-examples',
  'how-to-use-webhooks',
  'webhook-tutorial',
];

export async function GET() {
  const urls = posts.map(slug => `  <url>
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
