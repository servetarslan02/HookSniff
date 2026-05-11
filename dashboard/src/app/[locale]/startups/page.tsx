'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import PublicNavbar from '@/components/PublicNavbar';
import Footer from '@/components/Footer';

export default function StartupsPage() {
  const t = useTranslations('startups');
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <PublicNavbar pageTitle={t("title")} />

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 text-sm font-medium rounded-full mb-4">🚀 Startup Program</span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">{t("buildFaster")}</h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-xl mx-auto">Special pricing for early-stage startups. Focus on your product, not webhook infrastructure.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: '💰', title: '50% off Pro', desc: 'Pre-Series A startups get Pro plan for $14.50/mo (instead of $29).' },
            { icon: '📈', title: 'Extended free tier', desc: '10,000 events/month on free tier.' },
            { icon: '🤝', title: 'Priority support', desc: 'Direct Slack channel with our engineering team for onboarding help.' },
          ].map((b) => (
            <div key={b.title} className="text-center p-6 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
              <span className="text-3xl">{b.icon}</span>
              <h3 className="font-bold text-gray-900 dark:text-white mt-3 mb-2">{b.title}</h3>
              <p className="text-sm text-gray-600 dark:text-slate-400">{b.desc}</p>
            </div>
          ))}
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 mb-16">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Who qualifies?</h2>
          <ul className="space-y-3 text-gray-600 dark:text-slate-400">
            {['Pre-Series A startups', 'Less than $1M in funding', 'Less than 10 employees', 'Building a product (not a side project)', 'Registered company or active incorporation'].map((q) => (
              <li key={q} className="flex items-start gap-2">
                <svg className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                {q}
              </li>
            ))}
          </ul>
        </div>

        <div className="text-center p-8 bg-gray-900 dark:bg-slate-800 rounded-xl">
          <h2 className="text-2xl font-bold text-white mb-2">{t("apply")}</h2>
          <p className="text-gray-400 dark:text-slate-400 mb-6">Tell us about your startup. We usually respond within 24 hours.</p>
          <Link href="/contact" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">Apply now →</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
