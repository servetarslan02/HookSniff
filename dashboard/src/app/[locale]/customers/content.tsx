'use client';

import { useTranslations } from 'next-intl';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

/* ─── Customer Stories Data ─── */
/* HS-067: These are illustrative usage scenarios, not real customer testimonials. */

export function CustomersPageContent() {
  const t = useTranslations('customers');
  const [activeFilter, setActiveFilter] = useState('All');

  const featured = [
    {
      slug: 'ecommerce-platform',
      company: 'ShopFlow',
      logo: 'SF',
      industry: t('indEcommerce'),
      quote: t('quoteShopFlow'),
      author: t('roleCto'),
      metric: '3 months saved',
      metricLabel: t('metricEngTime'),
      desc: t('descShopFlow'),
    },
    {
      slug: 'fintech-startup',
      company: 'PayFlow',
      logo: 'PF',
      industry: t('indFintech'),
      quote: t('quotePayFlow'),
      author: t('roleHeadEng'),
      metric: '0',
      metricLabel: t('metricEventsLost'),
      desc: t('descPayFlow'),
    },
    {
      slug: 'ai-agent-fleet',
      company: 'NeuralOps',
      logo: 'NO',
      industry: t('indAiMl'),
      quote: t('quoteNeuralOps'),
      author: t('roleMlEng'),
      metric: '<200ms',
      metricLabel: t('metricAvgLatency'),
      desc: t('descNeuralOps'),
    },
    {
      slug: 'saas-integration',
      company: 'CloudSync',
      logo: 'CS',
      industry: t('indSaas'),
      quote: t('quoteCloudSync'),
      author: t('roleSoloFounder'),
      metric: '$0/mo',
      metricLabel: t('metricCostFree'),
      desc: t('descCloudSync'),
    },
  ];

  const stories = [
    {
      slug: 'ecommerce-platform',
      company: 'ShopFlow',
      logo: 'SF',
      industry: t('indEcommerce'),
      author: t('roleCto'),
      authorRole: t('roleCto'),
      quote: t('quoteShopFlowShort'),
      metric: '50K',
      metricLabel: t('metricEventsDay'),
    },
    {
      slug: 'fintech-startup',
      company: 'PayFlow',
      logo: 'PF',
      industry: t('indFintech'),
      author: t('roleHeadEng'),
      authorRole: t('roleHeadEng'),
      quote: t('quotePayFlowShort'),
      metric: '99.9%',
      metricLabel: t('metricSla'),
    },
    {
      slug: 'ai-agent-fleet',
      company: 'NeuralOps',
      logo: 'NO',
      industry: t('indAiMl'),
      author: t('roleMlEng'),
      authorRole: t('roleMlEng'),
      quote: t('quoteNeuralOpsShort'),
      metric: '200+',
      metricLabel: t('metricAgents'),
    },
    {
      slug: 'saas-integration',
      company: 'CloudSync',
      logo: 'CS',
      industry: t('indSaas'),
      author: t('roleSoloFounder'),
      authorRole: t('roleFounder'),
      quote: t('quoteCloudSyncShort'),
      metric: '8K',
      metricLabel: t('metricEventsMonth'),
    },
    {
      slug: 'healthcare-saas',
      company: 'MedConnect',
      logo: 'MC',
      industry: t('indHealthcare'),
      author: t('roleCto'),
      authorRole: t('roleCto'),
      quote: t('quoteMedConnect'),
      metric: 'EU',
      metricLabel: t('metricDataRegion'),
    },
    {
      slug: 'devtools-platform',
      company: 'BuildKit',
      logo: 'BK',
      industry: t('indDevTools'),
      author: t('roleLeadDev'),
      authorRole: t('roleLeadDev'),
      quote: t('quoteBuildKit'),
      metric: '11',
      metricLabel: t('metricSdks'),
    },
  ];

  const techLogos = [
    { name: 'GCP Cloud Run', desc: t('techGcp') },
    { name: 'Neon PostgreSQL', desc: t('techNeon') },
    { name: 'Upstash Redis', desc: t('techUpstash') },
    { name: 'Cloudflare', desc: t('techCf') },
    { name: 'Vercel', desc: t('techVercel') },
    { name: 'Polar.sh', desc: t('techPolar') },
    { name: 'Rust', desc: t('techRust') },
    { name: 'Next.js', desc: t('techNext') },
  ];

  const stats = [
    { value: '11', label: 'metricSdks' },
    { value: '1,378', label: 'metricTestsPassing' },
    { value: '99.9%', label: 'metricDeliveryRate' },
    { value: '8', label: 'metricLanguages' },
  ];

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
            {t('heroTitle')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
            {t('heroSubtitle')}
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
            {techLogos.map((tech) => (
              <div key={tech.name} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-500/40 transition-colors">
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-brand-100 to-blue-100 dark:from-brand-900/30 dark:to-blue-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 text-xs font-bold">
                  {tech.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{tech.name}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-500">{tech.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Stories */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">{t("featuredStories")}</h2>
          <p className="text-center text-sm text-gray-500 dark:text-slate-500 mb-8">{t('illustrativeNote')}</p>
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
                    <span className="text-sm text-brand-600 dark:text-brand-400 group-hover:underline">{t('readStory')}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* All Stories */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">{t("allStories")}</h2>
          <p className="text-center text-sm text-gray-500 dark:text-slate-500 mb-8">{t('disclaimerNote')}</p>

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
          <p className="text-gray-500 dark:text-slate-400 mb-6">{t('startSending')}</p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/login" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">{t('startFree')}</Link>
            <Link href="/contact" className="px-6 py-3 border border-gray-600 dark:border-slate-600 text-gray-300 dark:text-slate-300 rounded-lg text-sm font-medium hover:border-gray-400 dark:hover:border-slate-400 transition-colors">{t("talkToUs")}</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
