export type BlogPost = {
  slug: string;
  titleKey: string;
  excerptKey: string;
  date: string;
  categoryKey: string;
  readTime: string;
  tags: string[];
  featured?: boolean;
};

export const posts: BlogPost[] = [
  { slug: 'hooksniff-vs-svix-vs-hookdeck', titleKey: 'post1Title', excerptKey: 'post1Excerpt', date: '2026-05-10', categoryKey: 'catEngineering', readTime: '10 min', tags: ['comparison', 'svix', 'hookdeck', 'webhooks'], featured: true },
  { slug: 'may-2026-changelog', titleKey: 'post2Title', excerptKey: 'post2Excerpt', date: '2026-05-10', categoryKey: 'catChangelog', readTime: '4 min', tags: ['changelog', 'product'] },
  { slug: 'why-ai-agents-need-webhooks', titleKey: 'post3Title', excerptKey: 'post3Excerpt', date: '2026-05-09', categoryKey: 'catAiAgents', readTime: '6 min', tags: ['ai', 'agents', 'mcp'] },
  { slug: 'building-mcp-ready-webhooks', titleKey: 'post4Title', excerptKey: 'post4Excerpt', date: '2026-05-09', categoryKey: 'catAiAgents', readTime: '8 min', tags: ['mcp', 'ai', 'agents', 'architecture'] },
  { slug: 'gemini-webhook-integration', titleKey: 'post5Title', excerptKey: 'post5Excerpt', date: '2026-05-08', categoryKey: 'catIntegration', readTime: '5 min', tags: ['google', 'gemini', 'integration'] },
  { slug: 'webhook-integration-tutorial', titleKey: 'post6Title', excerptKey: 'post6Excerpt', date: '2026-05-07', categoryKey: 'catEngineering', readTime: '12 min', tags: ['tutorial', 'getting-started', 'integration'] },
  { slug: 'stripe-webhook-guide', titleKey: 'post7Title', excerptKey: 'post7Excerpt', date: '2026-05-05', categoryKey: 'catIntegration', readTime: '8 min', tags: ['stripe', 'payments', 'integration'] },
  { slug: 'webhook-architecture-deep-dive', titleKey: 'post8Title', excerptKey: 'post8Excerpt', date: '2026-05-03', categoryKey: 'catEngineering', readTime: '10 min', tags: ['architecture', 'rust', 'engineering', 'infrastructure'] },
  { slug: 'changelog-may-2026', titleKey: 'post9Title', excerptKey: 'post9Excerpt', date: '2026-05-01', categoryKey: 'catChangelog', readTime: '3 min', tags: ['changelog', 'product'] },
  { slug: 'shopify-webhook-incident-analysis', titleKey: 'post10Title', excerptKey: 'post10Excerpt', date: '2026-04-30', categoryKey: 'catEngineering', readTime: '8 min', tags: ['incident', 'resilience', 'shopify', 'engineering'] },
  { slug: 'introducing-hooksniff', titleKey: 'post11Title', excerptKey: 'post11Excerpt', date: '2026-04-28', categoryKey: 'catAnnouncement', readTime: '3 min', tags: ['announcement', 'product'] },
  { slug: 'webhook-best-practices', titleKey: 'post12Title', excerptKey: 'post12Excerpt', date: '2026-04-25', categoryKey: 'catEngineering', readTime: '7 min', tags: ['security', 'engineering', 'best-practices'] },
  { slug: 'fifo-webhook-delivery', titleKey: 'post13Title', excerptKey: 'post13Excerpt', date: '2026-04-20', categoryKey: 'catEngineering', readTime: '5 min', tags: ['engineering', 'fifo', 'architecture'] },
  { slug: 'customer-spotlight-ecommerce', titleKey: 'post14Title', excerptKey: 'post14Excerpt', date: '2026-04-18', categoryKey: 'catAnnouncement', readTime: '6 min', tags: ['customer', 'use-case', 'ecommerce'] },
  { slug: 'github-webhook-guide', titleKey: 'post15Title', excerptKey: 'post15Excerpt', date: '2026-04-15', categoryKey: 'catIntegration', readTime: '6 min', tags: ['github', 'integration', 'ci-cd'] },
  { slug: 'cloudevents-standard', titleKey: 'post16Title', excerptKey: 'post16Excerpt', date: '2026-04-10', categoryKey: 'catStandard', readTime: '4 min', tags: ['cloudevents', 'standard', 'architecture'] },
  { slug: 'webhook-security-guide', titleKey: 'post17Title', excerptKey: 'post17Excerpt', date: '2026-04-05', categoryKey: 'catEngineering', readTime: '9 min', tags: ['security', 'hmac', 'best-practices'] },
];
