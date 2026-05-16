'use client';

import { useTranslations } from 'next-intl';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';



/* ─── Sample Past Issues ─── */

const pastIssues = [
  {
    title: 'Webhook Retry Strategies: Exponential Backoff vs Linear',
    date: '2026-05-03',
    category: 'Engineering',
    excerpt: 'Deep dive into retry strategies, jitter, and why exponential backoff with jitter beats linear every time.',
    slug: 'webhook-retry-strategies',
  },
  {
    title: 'How Stripe Processes 100M+ Webhooks Per Day',
    date: '2026-04-26',
    category: 'Industry',
    excerpt: 'Architecture analysis of Stripe\'s webhook infrastructure and lessons for your own system.',
    slug: 'stripe-webhook-architecture',
  },
  {
    title: 'HookSniff v0.4.0: All 11 SDKs Published',
    date: '2026-04-19',
    category: 'Product',
    excerpt: 'Node.js, Python, Rust, Go, Java, Kotlin, PHP, C#, Elixir, Swift, Ruby — all on their package managers.',
    slug: 'v0-4-0-sdks',
  },
];

const faqs = [
  {
    q: 'How often do you send emails?',
    a: 'We send 1-2 emails per week. Product updates come with each release, engineering posts are biweekly. We never spam.',
  },
  {
    q: 'What kind of content do you send?',
    a: 'Product updates (new features, SDK releases), engineering deep dives (webhook architecture, Rust, distributed systems), and industry trends (webhook standards, AI agents, event-driven architecture).',
  },
  {
    q: 'Can I unsubscribe anytime?',
    a: 'Yes — every email has an unsubscribe link at the bottom. One click, instant. We respect your inbox.',
  },
  {
    q: 'Do you share my email with anyone?',
    a: 'Never. Your email stays with us. We don\'t sell, share, or rent your data. See our Privacy Policy for details.',
  },
  {
    q: 'Is there an RSS feed?',
    a: 'Yes! You can subscribe via RSS at /blog/rss if you prefer a reader over email.',
  },
];

/* ─── Main Page ─── */

export function NewsletterPageContent() {
  const t = useTranslations('newsletter');
  const tc = useTranslations('common');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setMessage(data.message || 'Check your inbox to confirm!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || tc('somethingWentWrong'));
      }
    } catch {
      setStatus('error');
      setMessage('Network error — please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Nav */}
      <nav className="border-b border-gray-200/50 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="items-center gap-3 flex">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">🪝 HookSniff</Link>
            <span className="text-gray-500 dark:text-slate-500">/</span>
            <span className="text-gray-600 dark:text-slate-400">{t("title")}</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <span className="text-5xl mb-4 block">📬</span>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t("theWebhookDigest")}</h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-xl mx-auto">
            Webhook tips, product updates, and engineering insights. Delivered to your inbox. No spam. Unsubscribe anytime.
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500 dark:text-slate-500">
            <span>📧 1-2x per week</span>
            <span>·</span>
            <a href="/blog/rss" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">📡 RSS feed</a>
            <span>·</span>
            <span>🔒 Privacy first</span>
          </div>
        </div>

        {/* Subscribe Form */}
        <div className="max-w-md mx-auto mb-16">
          {status === 'success' ? (
            <div className="text-center p-6 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
              <span className="text-3xl mb-2 block">✅</span>
              <p className="text-emerald-700 dark:text-emerald-400 font-medium mb-1">You&apos;re in!</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-500">{message}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-hidden"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {status === 'loading' ? '...' : 'Subscribe'}
              </button>
            </form>
          )}
          {status === 'error' && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-3 text-center">{message}</p>
          )}
        </div>

        {/* What You'll Get */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            {
              icon: '🚀',
              title: 'Product updates',
              desc: 'New features, SDK releases, platform improvements, and changelog highlights.',
              example: 'v0.5.0: Blog v2, Status Page, Docs v2 — 31 strategy reports completed',
            },
            {
              icon: '🔧',
              title: 'Engineering insights',
              desc: 'Deep dives into webhook architecture, Rust, distributed systems, and developer tools.',
              example: 'How we built FIFO webhook delivery with PostgreSQL LISTEN/NOTIFY',
            },
            {
              icon: '📊',
              title: 'Industry trends',
              desc: 'Webhook standards, AI agents, event-driven architecture, and developer ecosystem news.',
              example: 'Why every AI agent needs webhooks (and how to build them right)',
            },
          ].map((item) => (
            <div key={item.title} className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
              <span className="text-3xl">{item.icon}</span>
              <h3 className="font-bold text-gray-900 dark:text-white mt-3 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">{item.desc}</p>
              <p className="text-xs text-gray-500 dark:text-slate-500 italic bg-gray-50 dark:bg-slate-800 rounded-lg px-3 py-2">
                e.g. &ldquo;{item.example}&rdquo;
              </p>
            </div>
          ))}
        </div>

        {/* Past Issues */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">{t("recentIssues")}</h2>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            {['all', 'Engineering', 'Product', 'Industry'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                  activeCategory === cat
                    ? 'bg-brand-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-500'
                }`}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {pastIssues
              .filter((issue) => activeCategory === 'all' || issue.category === activeCategory)
              .map((issue) => (
              <div
                key={issue.slug}
                className="flex items-start gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-brand-200 dark:hover:border-brand-500/20 transition-colors"
              >
                <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${
                  issue.category === 'Engineering'
                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
                    : issue.category === 'Product'
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400'
                }`}>
                  {issue.category}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm">{issue.title}</h3>
                    <span className="text-xs text-gray-500 dark:text-slate-600 shrink-0">{issue.date}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-500">{issue.excerpt}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <Link href="/blog" className="text-sm text-brand-600 dark:text-brand-400 hover:underline">
              {t('viewAllPosts')}
            </Link>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-6 px-8 py-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">500+</p>
              <p className="text-xs text-gray-500 dark:text-slate-500">{t("subscribers")}</p>
            </div>
            <div className="w-px h-10 bg-gray-200 dark:bg-slate-800" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">48%</p>
              <p className="text-xs text-gray-500 dark:text-slate-500">{t("openRate")}</p>
            </div>
            <div className="w-px h-10 bg-gray-200 dark:border-slate-700" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">17</p>
              <p className="text-xs text-gray-500 dark:text-slate-500">{t("issuesSent")}</p>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">{t("whatSubscribersSay")}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                quote: 'Finally, a webhook newsletter that goes beyond product announcements. The engineering deep dives are genuinely useful.',
                author: 'Alex K.',
                role: 'Backend Engineer',
              },
              {
                quote: 'HookSniff\'s changelog emails are the only product updates I actually read. Concise, well-structured, and always relevant.',
                author: 'Maria S.',
                role: 'DevOps Lead',
              },
            ].map((t) => (
              <div key={t.author} className="p-5 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                <p className="text-sm text-gray-700 dark:text-slate-300 italic mb-3">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center text-xs font-bold text-brand-600 dark:text-brand-400">
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">{t.author}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Who writes this?</h2>
          <div className="max-w-lg mx-auto flex items-start gap-4 p-5 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <div className="w-12 h-12 rounded-full bg-linear-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold shrink-0">
              S
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Servet Arslan</h3>
              <p className="text-xs text-gray-500 dark:text-slate-500 mb-2">Founder &amp; Engineer @ HookSniff</p>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Building webhook infrastructure for developers. Writing about distributed systems, Rust, and what I learn along the way.
                Every issue is hand-crafted, not auto-generated.
              </p>
              <div className="flex items-center gap-3 mt-3">
                <a href="https://github.com/servetarslan02" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  GitHub
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  𝕏 Twitter
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">{t("faq")}</h2>
          <div className="max-w-2xl mx-auto space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-left"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{faq.q}</span>
                  <span className="text-gray-500 dark:text-slate-600 text-sm shrink-0 ml-2">
                    {openFaq === i ? '−' : '+'}
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-4 py-3 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
                    <p className="text-sm text-gray-600 dark:text-slate-400">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Privacy */}
        <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 mb-16">
          <span className="text-2xl mb-2 block">🔒</span>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">{t("privacyMatters")}</h3>
          <p className="text-sm text-gray-600 dark:text-slate-400 max-w-lg mx-auto">
            We use your email only for our newsletter. No spam, no selling, no sharing.
            Unsubscribe with one click anytime. Read our{' '}
            <Link href="/privacy" className="text-brand-600 dark:text-brand-400 hover:underline">{t("privacyPolicy")}</Link>.
          </p>
        </div>

        {/* Bottom CTA */}
        <div className="text-center p-8 bg-linear-to-br from-brand-50 to-blue-50 dark:from-brand-500/10 dark:to-blue-500/10 rounded-xl border border-brand-200 dark:border-brand-500/20">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ready to stay in the loop?</h3>
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">Join 500+ developers getting webhook insights.</p>
          {status !== 'success' && (
            <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-hidden"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {status === 'loading' ? '...' : 'Subscribe'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
