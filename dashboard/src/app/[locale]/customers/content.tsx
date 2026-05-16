'use client';

import { useTranslations } from 'next-intl';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

/* ─── Customer Stories Data ─── */
/* HS-067: These are illustrative usage scenarios, not real customer testimonials. */

const featured = [
  {
    slug: 'ecommerce-platform',
    company: 'ShopFlow',
    logo: 'SF',
    industry: 'E-Commerce',
    quote: 'We switched from building our own webhooks to HookSniff. Saved us 3 months of engineering time and $2K/month in infrastructure costs.',
    author: 'CTO',
    metric: '3 months saved',
    metricLabel: 'Engineering time',
    desc: 'How ShopFlow scaled webhook delivery to 50K events/day and cut infrastructure costs by 60%.',
  },
  {
    slug: 'fintech-startup',
    company: 'PayFlow',
    logo: 'PF',
    industry: 'Fintech',
    quote: 'We needed zero event loss for compliance. HookSniff delivers. The HMAC signatures and delivery logs give us the audit trail we need.',
    author: 'Head of Engineering',
    metric: '0',
    metricLabel: 'Events lost',
    desc: 'How PayFlow achieved zero event loss for financial compliance with HookSniff\'s FIFO delivery.',
  },
  {
    slug: 'ai-agent-fleet',
    company: 'NeuralOps',
    logo: 'NO',
    industry: 'AI / ML',
    quote: 'HookSniff is the nervous system for our AI agent fleet. Events trigger actions in real-time. The schema registry ensures payload consistency across 200+ agents.',
    author: 'ML Engineer',
    metric: '<200ms',
    metricLabel: 'Avg latency',
    desc: 'How NeuralOps uses HookSniff to orchestrate 200+ AI agents with real-time event delivery.',
  },
  {
    slug: 'saas-integration',
    company: 'CloudSync',
    logo: 'CS',
    industry: 'SaaS',
    quote: 'Free tier that actually works for startups. We process 8K webhooks/month without paying a cent. Svix wanted $490/month for the same thing.',
    author: 'Solo Founder',
    metric: '$0/mo',
    metricLabel: 'Cost on Free tier',
    desc: 'How CloudSync launched their webhook integration on HookSniff\'s free tier and scaled to Pro.',
  },
];

const stories = [
  {
    slug: 'ecommerce-platform',
    company: 'ShopFlow',
    logo: 'SF',
    industry: 'E-Commerce',
    author: 'CTO',
    authorRole: 'CTO',
    quote: 'We switched from building our own webhooks to HookSniff. Saved us 3 months of engineering time.',
    metric: '50K',
    metricLabel: 'events/day',
  },
  {
    slug: 'fintech-startup',
    company: 'PayFlow',
    logo: 'PF',
    industry: 'Fintech',
    author: 'Head of Engineering',
    authorRole: 'Head of Engineering',
    quote: 'Zero event loss for compliance. The HMAC signatures and delivery logs give us the audit trail we need.',
    metric: '99.99%',
    metricLabel: 'delivery rate',
  },
  {
    slug: 'ai-agent-fleet',
    company: 'NeuralOps',
    logo: 'NO',
    industry: 'AI / ML',
    author: 'ML Engineer',
    authorRole: 'ML Engineer',
    quote: 'HookSniff is the nervous system for our AI agent fleet. Events trigger actions in real-time.',
    metric: '200+',
    metricLabel: 'agents connected',
  },
  {
    slug: 'saas-integration',
    company: 'CloudSync',
    logo: 'CS',
    industry: 'SaaS',
    author: 'Solo Founder',
    authorRole: 'Founder',
    quote: 'Free tier that actually works. We process 8K webhooks/month without paying a cent.',
    metric: '8K',
    metricLabel: 'events/month free',
  },
  {
    slug: 'healthcare-saas',
    company: 'MedConnect',
    logo: 'MC',
    industry: 'Healthcare',
    author: 'CTO',
    authorRole: 'CTO',
    quote: 'GDPR compliance and EU data processing were non-negotiable. HookSniff checked every box.',
    metric: 'EU',
    metricLabel: 'data region (Frankfurt)',
  },
  {
    slug: 'devtools-platform',
    company: 'BuildKit',
    logo: 'BK',
    industry: 'Developer Tools',
    author: 'Lead Developer',
    authorRole: 'Lead Developer',
    quote: 'The webhook playground and 11 SDKs made integration a breeze. Our developers love it.',
    metric: '11',
    metricLabel: 'SDKs available',
  },
];

const techLogos = [
  { name: 'GCP Cloud Run', desc: 'API hosting' },
  { name: 'Neon PostgreSQL', desc: 'Database' },
  { name: 'Upstash Redis', desc: 'Cache & rate limiting' },
  { name: 'Cloudflare', desc: 'CDN & DNS' },
  { name: 'Vercel', desc: 'Dashboard hosting' },
  { name: 'Polar.sh', desc: 'Payments' },
  { name: 'Rust', desc: 'API language' },
  { name: 'Next.js', desc: 'Dashboard framework' },
];

const stats = [
  { value: '11', label: 'SDKs published' },
  { value: '1,378', label: 'metricTestsPassing' },
  { value: '99.97%', label: 'metricDeliveryRate' },
  { value: '8', label: 'metricLanguages' },
];

export function CustomersPageContent() {
  const t = useTranslations('customers');
  const [activeFilter, setActiveFilter] = useState('All');
  const industries = ['All', ...new Set(stories.map((s) => s.industry))];
  const filtered = activeFilter === 'All' ? stories : stories.filter((s) => s.industry === activeFilter);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <nav className="border-b border-gray-200/50 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="items-center gap-3 flex">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">🪝 HookSniff</Link>
            <span className="text-gray-500 dark:text-slate-500">/</span>
            <span className="text-gray-600 dark:text-slate-400">{t("title")}</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Trusted by developers worldwide
          </h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
            From solo founders to enterprise teams — HookSniff delivers webhooks reliably for thousands of developers.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((s) => (
            <div key={s.label} className="text-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
              <p className="text-3xl font-bold text-brand-600 dark:text-brand-400">{s.value}</p>
              <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">{t(s.label)}</p>
            </div>
          ))}
        </div>

        {/* Technology Logos */}
        <div className="mb-16">
          <p className="text-center text-sm text-gray-500 dark:text-slate-500 uppercase tracking-wider mb-6">{t("builtOn")}</p>
          <div className="flex flex-wrap justify-center gap-6">
            {techLogos.map((t) => (
              <div key={t.name} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-500/40 transition-colors">
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-brand-100 to-blue-100 dark:from-brand-900/30 dark:to-blue-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 text-xs font-bold">
                  {t.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{t.name}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-500">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Stories */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">{t("featuredStories")}</h2>
          <p className="text-center text-sm text-gray-500 dark:text-slate-500 mb-8">Illustrative usage scenarios based on common webhook patterns.</p>
          <div className="grid md:grid-cols-2 gap-6">
            {featured.map((f) => (
              <Link key={f.slug} href={`/customers/${f.slug}`} className="group">
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 hover:border-brand-300 dark:hover:border-brand-500/40 transition-colors h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-lg">{f.logo}</div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-lg">{f.company}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-500">{f.industry}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed mb-4">{f.desc}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{f.metric}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-500">{f.metricLabel}</p>
                    </div>
                    <span className="text-sm text-brand-600 dark:text-brand-400 group-hover:underline">Read story →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* All Stories */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">{t("allStories")}</h2>
          <p className="text-center text-sm text-gray-500 dark:text-slate-500 mb-8">These are illustrative usage scenarios, not real customer testimonials.</p>

          {/* Filter */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {industries.map((ind) => (
              <button
                key={ind}
                onClick={() => setActiveFilter(ind)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors ${
                  activeFilter === ind
                    ? 'bg-brand-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-500/40'
                }`}
              >
                {ind}
              </button>
            ))}
          </div>

          {/* Story Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((s) => (
              <Link key={s.slug} href={`/customers/${s.slug}`} className="group">
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 hover:border-brand-300 dark:hover:border-brand-500/40 transition-colors h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-sm">{s.logo}</div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{s.company}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-500">{s.industry}</p>
                    </div>
                  </div>
                  <svg className="w-6 h-6 text-brand-200 dark:text-brand-800 mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
                  </svg>
                  <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed mb-4">{s.quote}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{s.author}</p>
                    <div className="text-right">
                      <p className="text-lg font-bold text-brand-600 dark:text-brand-400">{s.metric}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-500">{s.metricLabel}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-8 bg-gray-900 dark:bg-slate-800 rounded-xl">
          <h2 className="text-2xl font-bold text-white mb-2">{t("joinThousands")}</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-6">Start sending webhooks in 5 minutes. No credit card required.</p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/login" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">Start for free →</Link>
            <Link href="/contact" className="px-6 py-3 border border-gray-600 dark:border-slate-600 text-gray-300 dark:text-slate-300 rounded-lg text-sm font-medium hover:border-gray-400 dark:hover:border-slate-400 transition-colors">{t("talkToUs")}</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
