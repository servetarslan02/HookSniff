'use client';

import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslations } from 'next-intl';



export default function AboutPage() {
  const t = useTranslations();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <nav className="border-b border-gray-200/50 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-xl font-bold text-gray-900 dark:text-white">🪝 HookSniff</a>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 dark:text-slate-400">{t('about.title')}</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-brand-100 dark:border-brand-500/20">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live & Operational
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">{t('about.title')}</h1>
          <p className="text-xl text-gray-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Reliable webhook delivery infrastructure built by developers, for developers.
          </p>
        </div>

        {/* Mission */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{t('about.ourMission')}</h2>
          <p className="text-gray-600 dark:text-slate-400 leading-relaxed mb-4">
            Webhooks are the backbone of modern integrations, but building reliable webhook infrastructure is hard. 
            We built HookSniff to make it simple — send webhooks, we deliver them. If they fail, we retry.
          </p>
          <p className="text-gray-600 dark:text-slate-400 leading-relaxed">
            We believe developers shouldn&apos;t have to pay enterprise prices for reliable webhook delivery. 
            That&apos;s why HookSniff starts at $0/month with a generous free tier.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { value: '99.97%', label: t('deliveryRate') },
            { value: '<50ms', label: t('avgLatency') },
            { value: '11', label: 'SDK Languages' },
            { value: '$0', label: 'Starting Price' },
          ].map(stat => (
            <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 text-center">
              <div className="text-3xl font-bold text-brand-600 dark:text-brand-400 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Story */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{t('about.ourStory')}</h2>
          <p className="text-gray-600 dark:text-slate-400 leading-relaxed mb-4">
            HookSniff started as a side project in 2026. We were tired of dealing with unreliable webhook deliveries 
            and expensive third-party services. So we built our own.
          </p>
          <p className="text-gray-600 dark:text-slate-400 leading-relaxed mb-4">
            Today, HookSniff handles webhook delivery for developers worldwide, with support for HTTP, WebSocket, 
            gRPC, and SQS delivery methods. Our infrastructure runs entirely on free-tier services, 
            keeping costs at $0/month while maintaining enterprise-grade reliability.
          </p>
          <p className="text-gray-600 dark:text-slate-400 leading-relaxed">
            We&apos;re committed to keeping HookSniff affordable and accessible. As we grow, 
            we&apos;ll continue to offer a generous free tier and transparent pricing.
          </p>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              icon: '🔒',
              title: 'Security First',
              desc: 'HMAC-SHA256 signatures, TLS encryption, and zero-knowledge payload processing.',
            },
            {
              icon: '💰',
              title: 'Transparent Pricing',
              desc: 'No hidden fees, no surprise charges. What you see is what you pay.',
            },
            {
              icon: '🌍',
              title: 'Global Infrastructure',
              desc: 'Deployed in EU (Frankfurt) with CDN coverage worldwide via Cloudflare.',
            },
          ].map(v => (
            <div key={v.title} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
              <div className="text-3xl mb-3">{v.icon}</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{v.title}</h3>
              <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-500/10 dark:to-purple-500/10 rounded-xl border border-brand-100 dark:border-brand-500/20 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Ready to get started?</h2>
          <p className="text-gray-600 dark:text-slate-400 mb-6">{t('cta')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard" className="bg-brand-600 dark:bg-brand-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-brand-700 dark:hover:bg-brand-600 transition">
              Start Free
            </Link>
            <Link href="/contact" className="border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 px-8 py-3 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition">
              Contact Us
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
