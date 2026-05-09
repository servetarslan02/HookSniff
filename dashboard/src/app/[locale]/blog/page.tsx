import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const posts = [
  {
    slug: 'introducing-hooksniff',
    title: 'Introducing HookSniff: Webhooks Made Simple',
    excerpt: 'We built HookSniff to solve a simple problem — webhook delivery should just work. No more missed events, no more complex retry logic.',
    date: '2026-05-01',
    category: 'Announcement',
    readTime: '3 min',
  },
  {
    slug: 'webhook-best-practices',
    title: 'Webhook Best Practices for Production',
    excerpt: 'Learn how to implement secure, reliable webhooks with HMAC signatures, idempotency keys, and exponential backoff retries.',
    date: '2026-04-25',
    category: 'Engineering',
    readTime: '7 min',
  },
  {
    slug: 'fifo-webhook-delivery',
    title: 'Why FIFO Webhook Delivery Matters',
    excerpt: 'Event ordering is critical for many workflows. Learn how HookSniff guarantees ordered delivery with sequence numbers.',
    date: '2026-04-18',
    category: 'Engineering',
    readTime: '5 min',
  },
  {
    slug: 'cloudevents-standard',
    title: 'Embracing the CloudEvents Standard',
    excerpt: 'CloudEvents v1.0 provides a standardized way to describe event data. Here is why we adopted it and how it benefits your integrations.',
    date: '2026-04-10',
    category: 'Standard',
    readTime: '4 min',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <nav className="border-b border-gray-200/50 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="items-center gap-3 flex">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">🪝 HookSniff</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 dark:text-slate-400">Blog</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Blog</h1>
          <p className="text-lg text-gray-600 dark:text-slate-400">Insights on webhooks, event-driven architecture, and developer tools.</p>
        </div>

        <div className="space-y-6">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
              <article className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 hover:border-brand-300 dark:hover:border-brand-500/40 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-medium bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 px-2.5 py-1 rounded-full">{post.category}</span>
                  <span className="text-sm text-gray-500 dark:text-slate-500">{post.date}</span>
                  <span className="text-sm text-gray-400 dark:text-slate-600">·</span>
                  <span className="text-sm text-gray-500 dark:text-slate-500">{post.readTime}</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{post.title}</h2>
                <p className="text-gray-600 dark:text-slate-400 leading-relaxed">{post.excerpt}</p>
              </article>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
