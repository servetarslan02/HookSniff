'use client';

import { Link } from '@/i18n/navigation';
import PublicNavbar from '@/components/PublicNavbar';
import { useTranslations } from 'next-intl';
import Footer from '@/components/Footer';



export function AboutPageContent() {
  const t = useTranslations();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <PublicNavbar pageTitle={t('about.title')} />

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-brand-100 dark:border-brand-500/20">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            {t('about.liveOperational')}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">{t('about.title')}</h1>
          <p className="text-xl text-gray-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {t('about.heroSubtitle')}
          </p>
        </div>

        {/* Mission */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{t('about.ourMission')}</h2>
          <p className="text-gray-600 dark:text-slate-400 leading-relaxed mb-4">
            {t('about.missionP1')}
          </p>
          <p className="text-gray-600 dark:text-slate-400 leading-relaxed">
            {t('about.missionP2')}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { value: '99.97%', label: t('deliveryRate') },
            { value: '<50ms', label: t('avgLatency') },
            { value: '11', label: t('about.sdkLanguages') },
            { value: '$0', label: t('about.startingPrice') },
          ].map(stat => (
            <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 text-center">
              <div className="text-3xl font-bold text-brand-600 dark:text-brand-400 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Story */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{t('about.ourStory')}</h2>
          <p className="text-gray-600 dark:text-slate-400 leading-relaxed mb-4">
            {t('about.storyP1')}
          </p>
          <p className="text-gray-600 dark:text-slate-400 leading-relaxed mb-4">
            {t('about.storyP2')}
          </p>
          <p className="text-gray-600 dark:text-slate-400 leading-relaxed">
            {t('about.storyP3')}
          </p>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              icon: '🔒',
              title: t('about.securityFirst'),
              desc: t('about.securityFirstDesc'),
            },
            {
              icon: '💰',
              title: t('about.transparentPricing'),
              desc: t('about.transparentPricingDesc'),
            },
            {
              icon: '🌍',
              title: t('about.globalInfrastructure'),
              desc: t('about.globalInfrastructureDesc'),
            },
          ].map(v => (
            <div key={v.title} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
              <div className="text-3xl mb-3">{v.icon}</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{v.title}</h3>
              <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center bg-linear-to-r from-brand-50 to-purple-50 dark:from-brand-500/10 dark:to-purple-500/10 rounded-xl border border-brand-100 dark:border-brand-500/20 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">{t('about.readyToStart')}</h2>
          <p className="text-gray-600 dark:text-slate-400 mb-6">{t('cta')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={"/"} className="bg-brand-600 dark:bg-brand-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-brand-700 dark:hover:bg-brand-600 transition">
              {t('about.startFree')}
            </Link>
            <Link href="/contact" className="border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 px-8 py-3 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition">
              {t('about.contactUs')}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
