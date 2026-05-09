'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const customers = [
  {
    name: 'SaaS Startup',
    industry: 'SaaS',
    logo: 'SS',
    quote: 'We switched from building our own webhooks to HookSniff. Saved us 3 months of engineering time and $2K/month in infrastructure costs.',
    author: 'CTO',
    metric: '3 months saved',
    metricLabel: 'Engineering time',
  },
  {
    name: 'E-Commerce Platform',
    industry: 'E-Commerce',
    logo: 'EC',
    quote: 'The FIFO delivery feature is a game-changer for our order processing pipeline. Events arrive in order, every time. Zero missed webhooks since we started.',
    author: 'Lead Developer',
    metric: '99.97%',
    metricLabel: 'Delivery rate',
  },
  {
    name: 'Indie Hacker',
    industry: 'Solo Founder',
    logo: 'IH',
    quote: 'Free tier that actually works for startups. We process 8K webhooks/month without paying a cent. Svix wanted $490/month for the same thing.',
    author: 'Solo Founder',
    metric: '$0/mo',
    metricLabel: 'Cost on Free tier',
  },
  {
    name: 'AI Startup',
    industry: 'AI / ML',
    logo: 'AI',
    quote: 'HookSniff is the nervous system for our AI agent fleet. Events trigger actions in real-time. The schema registry ensures payload consistency across agents.',
    author: 'ML Engineer',
    metric: '<200ms',
    metricLabel: 'Avg latency',
  },
  {
    name: 'FinTech Company',
    industry: 'Fintech',
    logo: 'FT',
    quote: 'We needed zero event loss for compliance. HookSniff delivers. The HMAC signatures and delivery logs give us the audit trail we need.',
    author: 'Head of Engineering',
    metric: '0',
    metricLabel: 'Events lost',
  },
  {
    name: 'Healthcare SaaS',
    industry: 'Healthcare',
    logo: 'HC',
    quote: 'GDPR compliance and EU data processing were non-negotiable for us. HookSniff checked every box. The delivery logs are our audit trail.',
    author: 'CTO',
    metric: 'EU',
    metricLabel: 'Data region (Frankfurt)',
  },
];

const logos = [
  { name: 'Stripe Partner', initials: 'SP' },
  { name: 'Vercel Integration', initials: 'VI' },
  { name: 'GitHub Marketplace', initials: 'GH' },
  { name: 'Neon Partner', initials: 'NP' },
  { name: 'Cloudflare', initials: 'CF' },
  { name: 'Polar.sh', initials: 'PS' },
  { name: 'Upstash', initials: 'UP' },
  { name: 'Resend', initials: 'RE' },
];

const stats = [
  { value: '11', label: 'SDKs published' },
  { value: '1,378', label: 'Tests passing' },
  { value: '99.97%', label: 'Delivery rate' },
  { value: '11/11', label: 'SDKs on package managers' },
];

export default function CustomersPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const industries = ['All', ...new Set(customers.map((c) => c.industry))];
  const filtered = activeFilter === 'All' ? customers : customers.filter((c) => c.industry === activeFilter);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <nav className="border-b border-gray-200/50 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="items-center gap-3 flex">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">🪝 HookSniff</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 dark:text-slate-400">Customers</span>
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
            <div key={s.label} className="text-center p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
              <p className="text-3xl font-bold text-brand-600 dark:text-brand-400">{s.value}</p>
              <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Logo Wall */}
        <div className="mb-16">
          <p className="text-center text-sm text-gray-500 dark:text-slate-500 uppercase tracking-wider mb-6">Integrated with</p>
          <div className="flex flex-wrap justify-center gap-8">
            {logos.map((l) => (
              <div key={l.name} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800">
                <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 text-xs font-bold">{l.initials}</div>
                <span className="text-sm text-gray-700 dark:text-slate-300 font-medium">{l.name}</span>
              </div>
            ))}
          </div>
        </div>

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

        {/* Customer Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filtered.map((c) => (
            <div key={c.name} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 hover:border-brand-300 dark:hover:border-brand-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-sm">{c.logo}</div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{c.name}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-500">{c.industry}</p>
                </div>
              </div>
              <svg className="w-6 h-6 text-brand-200 dark:text-brand-800 mb-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
              </svg>
              <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed mb-4">{c.quote}</p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-800">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{c.author}</p>
                <div className="text-right">
                  <p className="text-lg font-bold text-brand-600 dark:text-brand-400">{c.metric}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-500">{c.metricLabel}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center p-8 bg-gray-900 dark:bg-slate-800 rounded-xl">
          <h2 className="text-2xl font-bold text-white mb-2">Join thousands of developers</h2>
          <p className="text-gray-400 dark:text-slate-400 mb-6">Start sending webhooks in 5 minutes. No credit card required.</p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/login" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">Start for free →</Link>
            <Link href="/contact" className="px-6 py-3 border border-gray-600 dark:border-slate-600 text-gray-300 dark:text-slate-300 rounded-lg text-sm font-medium hover:border-gray-400 dark:hover:border-slate-400 transition-colors">Talk to us</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
