import { NextResponse } from 'next/server';
import { posts } from './[locale]/blog/[slug]/data';

const BASE_URL = 'https://hooksniff.vercel.app';

export async function GET() {
  const blogPosts = Object.entries(posts)
    .sort(([, a], [, b]) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20);

  const items = blogPosts
    .map(
      ([slug, post]) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${BASE_URL}/blog/${slug}</link>
      <guid isPermaLink="true">${BASE_URL}/blog/${slug}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description><![CDATA[${post.content.split('\n\n').find(p => !p.startsWith('#') && !p.startsWith('```') && !p.startsWith('-'))?.slice(0, 300) || post.title}]]></description>
      <category>${post.category}</category>
    </item>`
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>HookSniff Blog</title>
    <link>${BASE_URL}/blog</link>
    <description>Insights on webhooks, API design, and developer tools from HookSniff</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${BASE_URL}/favicon.svg</url>
      <title>HookSniff</title>
      <link>${BASE_URL}</link>
    </image>
    ${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
