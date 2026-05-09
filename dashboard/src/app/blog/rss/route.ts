import { NextResponse } from 'next/server';

const posts = [
  { slug: 'why-ai-agents-need-webhooks', title: 'Why AI Agents Need Webhooks', date: '2026-05-09', excerpt: 'As AI agents become autonomous, they need real-time event delivery.' },
  { slug: 'gemini-webhook-integration', title: 'How to Handle Google Gemini Webhooks', date: '2026-05-08', excerpt: 'Google just added webhooks to the Gemini API.' },
  { slug: 'stripe-webhook-guide', title: 'Complete Guide to Stripe Webhooks', date: '2026-05-05', excerpt: 'Stripe sends dozens of event types. Learn how to handle them reliably.' },
  { slug: 'changelog-may-2026', title: 'HookSniff Changelog — May 2026', date: '2026-05-01', excerpt: 'Blog launch, CSP fixes, 4 new database tables.' },
  { slug: 'introducing-hooksniff', title: 'Introducing HookSniff: Webhooks Made Simple', date: '2026-04-28', excerpt: 'Webhook delivery should just work.' },
  { slug: 'webhook-best-practices', title: 'Webhook Best Practices for Production', date: '2026-04-25', excerpt: 'HMAC signatures, idempotency keys, and exponential backoff retries.' },
  { slug: 'fifo-webhook-delivery', title: 'Why FIFO Webhook Delivery Matters', date: '2026-04-20', excerpt: 'Event ordering is critical for many workflows.' },
  { slug: 'github-webhook-guide', title: 'How to Set Up GitHub Webhooks', date: '2026-04-15', excerpt: 'Receive push, PR, and issue events from GitHub.' },
  { slug: 'cloudevents-standard', title: 'Embracing the CloudEvents Standard', date: '2026-04-10', excerpt: 'CloudEvents v1.0 provides a standardized way to describe event data.' },
  { slug: 'webhook-security-guide', title: 'Webhook Security: A Complete Guide', date: '2026-04-05', excerpt: 'HMAC, replay attack prevention, IP whitelisting, and TLS.' },
];

export async function GET() {
  const items = posts.map(post => `    <item>
      <title>${post.title}</title>
      <link>https://hooksniff.vercel.app/blog/${post.slug}</link>
      <guid>https://hooksniff.vercel.app/blog/${post.slug}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${post.excerpt}</description>
    </item>`).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>HookSniff Blog</title>
    <link>https://hooksniff.vercel.app/blog</link>
    <description>Insights on webhooks, event-driven architecture, and developer tools.</description>
    <language>en</language>
    <atom:link href="https://hooksniff.vercel.app/blog/rss" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
