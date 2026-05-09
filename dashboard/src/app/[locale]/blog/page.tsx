import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const categories = ['All', 'Announcement', 'Engineering', 'Standard', 'Changelog', 'Integration', 'AI & Agents'];

const posts = [
  {
    slug: 'why-ai-agents-need-webhooks',
    title: 'Why AI Agents Need Webhooks',
    excerpt: 'As AI agents become autonomous, they need real-time event delivery. Webhooks are the nervous system of the agent ecosystem.',
    date: '2026-05-09',
    category: 'AI & Agents',
    readTime: '6 min',
    tags: ['ai', 'agents', 'mcp'],
    featured: true,
  },
  {
    slug: 'gemini-webhook-integration',
    title: 'How to Handle Google Gemini Webhooks',
    excerpt: 'Google just added webhooks to the Gemini API. Here is how to receive, verify, and process them with HookSniff.',
    date: '2026-05-08',
    category: 'Integration',
    readTime: '5 min',
    tags: ['google', 'gemini', 'integration'],
  },
  {
    slug: 'stripe-webhook-guide',
    title: 'Complete Guide to Stripe Webhooks',
    excerpt: 'Stripe sends dozens of event types. Learn how to set up, verify, and handle Stripe webhooks reliably in production.',
    date: '2026-05-05',
    category: 'Integration',
    readTime: '8 min',
    tags: ['stripe', 'payments', 'integration'],
  },
  {
    slug: 'changelog-may-2026',
    title: 'HookSniff Changelog — May 2026',
    excerpt: 'Blog launch, CSP fixes, 4 new database tables, API deploy automation, and 11 SDK updates.',
    date: '2026-05-01',
    category: 'Changelog',
    readTime: '3 min',
    tags: ['changelog', 'product'],
  },
  {
    slug: 'introducing-hooksniff',
    title: 'Introducing HookSniff: Webhooks Made Simple',
    excerpt: 'We built HookSniff to solve a simple problem — webhook delivery should just work. No more missed events, no more complex retry logic.',
    date: '2026-04-28',
    category: 'Announcement',
    readTime: '3 min',
    tags: ['announcement', 'product'],
  },
  {
    slug: 'webhook-best-practices',
    title: 'Webhook Best Practices for Production',
    excerpt: 'Learn how to implement secure, reliable webhooks with HMAC signatures, idempotency keys, and exponential backoff retries.',
    date: '2026-04-25',
    category: 'Engineering',
    readTime: '7 min',
    tags: ['security', 'engineering', 'best-practices'],
  },
  {
    slug: 'fifo-webhook-delivery',
    title: 'Why FIFO Webhook Delivery Matters',
    excerpt: 'Event ordering is critical for many workflows. Learn how HookSniff guarantees ordered delivery with sequence numbers.',
    date: '2026-04-20',
    category: 'Engineering',
    readTime: '5 min',
    tags: ['engineering', 'fifo', 'architecture'],
  },
  {
    slug: 'github-webhook-guide',
    title: 'How to Set Up GitHub Webhooks',
    excerpt: 'Receive push, PR, and issue events from GitHub. Full guide with code examples in Node.js and Python.',
    date: '2026-04-15',
    category: 'Integration',
    readTime: '6 min',
    tags: ['github', 'integration', 'ci-cd'],
  },
  {
    slug: 'cloudevents-standard',
    title: 'Embracing the CloudEvents Standard',
    excerpt: 'CloudEvents v1.0 provides a standardized way to describe event data. Here is why we adopted it and how it benefits your integrations.',
    date: '2026-04-10',
    category: 'Standard',
    readTime: '4 min',
    tags: ['cloudevents', 'standard', 'architecture'],
  },
  {
    slug: 'webhook-security-guide',
    title: 'Webhook Security: A Complete Guide',
    excerpt: 'HMAC signatures, replay attack prevention, IP whitelisting, and TLS — everything you need to secure your webhook endpoints.',
    date: '2026-04-05',
    category: 'Engineering',
    readTime: '9 min',
    tags: ['security', 'hmac', 'best-practices'],
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <nav className="border-b border-gray-200/50 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="items-center gap-3 flex">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">🪝 HookSniff</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 dark:text-slate-400">Blog</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Blog</h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">Insights on webhooks, event-driven architecture, AI agents, and developer tools.</p>
        </div>

        {/* Newsletter */}
        <div className="bg-gradient-to-r from-brand-50 to-blue-50 dark:from-brand-500/10 dark:to-blue-500/10 rounded-xl border border-brand-100 dark:border-brand-500/20 p-6 mb-10">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">Subscribe to our newsletter</h3>
              <p className="text-sm text-gray-600 dark:text-slate-400">Get webhook tips, product updates, and engineering insights. No spam.</p>
            </div>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="you@example.com" className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none w-64" />
              <button type="submit" className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">Subscribe</button>
            </form>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <span key={cat} className={`px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors ${cat === 'All' ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-500/40'}`}>
              {cat}
            </span>
          ))}
        </div>

        {/* Featured Post */}
        {posts.filter(p => p.featured).map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="block group mb-8">
            <article className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-800 p-8 hover:border-brand-300 dark:hover:border-brand-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-medium bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 px-2.5 py-1 rounded-full">⭐ Featured</span>
                <span className="text-xs font-medium bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 px-2.5 py-1 rounded-full">{post.category}</span>
                <span className="text-sm text-gray-500 dark:text-slate-500">{post.date}</span>
                <span className="text-sm text-gray-400 dark:text-slate-600">·</span>
                <span className="text-sm text-gray-500 dark:text-slate-500">{post.readTime}</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{post.title}</h2>
              <p className="text-gray-600 dark:text-slate-400 leading-relaxed text-lg">{post.excerpt}</p>
              <div className="flex gap-2 mt-4">
                {post.tags.map(tag => (
                  <span key={tag} className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-500 px-2 py-0.5 rounded">#{tag}</span>
                ))}
              </div>
            </article>
          </Link>
        ))}

        {/* Post Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {posts.filter(p => !p.featured).map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
              <article className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 hover:border-brand-300 dark:hover:border-brand-500/40 transition-colors h-full">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-medium bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 px-2.5 py-1 rounded-full">{post.category}</span>
                  <span className="text-sm text-gray-500 dark:text-slate-500">{post.date}</span>
                  <span className="text-sm text-gray-400 dark:text-slate-600">·</span>
                  <span className="text-sm text-gray-500 dark:text-slate-500">{post.readTime}</span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{post.title}</h2>
                <p className="text-gray-600 dark:text-slate-400 leading-relaxed text-sm">{post.excerpt}</p>
                <div className="flex gap-2 mt-3">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-500 px-2 py-0.5 rounded">#{tag}</span>
                  ))}
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* RSS */}
        <div className="text-center mt-12">
          <a href="/blog/rss" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a1 1 0 000 2c5.523 0 10 4.477 10 10a1 1 0 102 0C17 8.373 11.627 3 5 3z"/><path d="M4 9a1 1 0 000 2 4 4 0 014 4 1 1 0 102 0 6 6 0 00-6-6z"/><circle cx="5" cy="15" r="2"/></svg>
            Subscribe via RSS
          </a>
        </div>
      </main>
    </div>
  );
}
