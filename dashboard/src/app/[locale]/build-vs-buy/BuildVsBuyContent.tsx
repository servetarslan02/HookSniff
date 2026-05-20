'use client';
import { useTranslations } from 'next-intl';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { DollarSign, Lightbulb, Wrench } from '@/components/icons';

export default function BuildVsBuyContent() {
  const t = useTranslations('buildVsBuy');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const dimensions = [
    { title: t('dimTimeToMarket'), hooksniff: t('timeToMarketHooksniff'), build: t('timeToMarketBuild'), whyItMatters: t('timeToMarketWhy') },
    { title: t('dimEngineeringCost'), hooksniff: t('engineeringCostHooksniff'), build: t('engineeringCostBuild'), whyItMatters: t('engineeringCostWhy') },
    { title: t('dimOngoingMaintenance'), hooksniff: t('maintenanceHooksniff'), build: t('maintenanceBuild'), whyItMatters: t('maintenanceWhy') },
    { title: t('dimReliability'), hooksniff: t('reliabilityHooksniff'), build: t('reliabilityBuild'), whyItMatters: t('reliabilityWhy') },
    { title: t('dimSecurity'), hooksniff: t('securityHooksniff'), build: t('securityBuild'), whyItMatters: t('securityWhy') },
    { title: t('dimDeveloperExperience'), hooksniff: t('dxHooksniff'), build: t('dxBuild'), whyItMatters: t('dxWhy') },
    { title: t('dimScalability'), hooksniff: t('scalabilityHooksniff'), build: t('scalabilityBuild'), whyItMatters: t('scalabilityWhy') },
    { title: t('dimCompliance'), hooksniff: t('complianceHooksniff'), build: t('complianceBuild'), whyItMatters: t('complianceWhy') },
    { title: t('dimRetry'), hooksniff: t('retryHooksniff'), build: t('retryBuild'), whyItMatters: t('retryWhy') },
    { title: t('dimObservability'), hooksniff: t('observabilityHooksniff'), build: t('observabilityBuild'), whyItMatters: t('observabilityWhy') },
    { title: t('dimSelfServePortal'), hooksniff: t('portalHooksniff'), build: t('portalBuild'), whyItMatters: t('portalWhy') },
    { title: t('dimMultiTenancy'), hooksniff: t('multiTenancyHooksniff'), build: t('multiTenancyBuild'), whyItMatters: t('multiTenancyWhy') },
  ];

  const buildCostRows = [
    { item: t('costInitialDev'), cost: '$300K–$1M+' },
    { item: t('costOngoing'), cost: '$200K–$400K/yr' },
    { item: t('costInfra'), cost: '$2K–$10K/mo' },
    { item: t('costSoc2'), cost: '$50K–$100K' },
    { item: t('costOnCall'), cost: t('costStress') },
    { item: t('costOpportunity'), cost: t('costImmeasurable') },
  ];

  const hooksniffCostRows = [
    { item: t('costSetup'), cost: '1 gün' },
    { item: t('costMonthly'), cost: '$24/mo' },
    { item: t('costInfra'), cost: t('costInfraIncluded') },
    { item: t('costSoc2'), cost: t('costSoc2Ready') },
    { item: t('costOnCall'), cost: t('costOnCallZero') },
    { item: t('costOpportunity'), cost: t('costOpportunityZero') },
  ];

  const whenBuildItems = [
    t('whenBuildItem1'),
    t('whenBuildItem2'),
    t('whenBuildItem3'),
    t('whenBuildItem4'),
  ];

  const faq = [
    { q: t('faq1q'), a: t('faq1a') },
    { q: t('faq2q'), a: t('faq2a') },
    { q: t('faq3q'), a: t('faq3a') },
    { q: t('faq4q'), a: t('faq4a') },
    { q: t('faq5q'), a: t('faq5a') },
    { q: t('faq6q'), a: t('faq6a') },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <nav className="border-b border-gray-200/50 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="items-center gap-3 flex">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">🪝 HookSniff</Link>
            <span className="text-gray-500 dark:text-slate-500">/</span>
            <span className="text-gray-600 dark:text-slate-400">{t("title")}</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Webhooks: {t("title")}
          </h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-3xl mx-auto mb-6">
            {t('ctaSubtitle')}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 text-center">
            <p className="text-3xl font-bold text-brand-600 dark:text-brand-400 mb-2">1–2</p>
            <p className="text-sm text-gray-600 dark:text-slate-400">{t("engineers")}</p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 text-center">
            <p className="text-3xl font-bold text-brand-600 dark:text-brand-400 mb-2">{t("days")}</p>
            <p className="text-sm text-gray-600 dark:text-slate-400">{t("timeToProduction")}</p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 text-center">
            <p className="text-3xl font-bold text-brand-600 dark:text-brand-400 mb-2">$24/mo</p>
            <p className="text-sm text-gray-600 dark:text-slate-400">{t("hooksniffPro")}</p>
          </div>
        </div>

        {/* Dimensions */}
        <div className="space-y-6 mb-16">
          {dimensions.map((dim, i) => (
            <div key={dim.title} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-sm font-bold">{i + 1}</span>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{dim.title}</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6 mb-4">
                  <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">🪝 HookSniff</p>
                    <p className="text-sm text-gray-700 dark:text-slate-300">{dim.hooksniff}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2"><Wrench size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('dimEngineeringCost')}</p>
                    <p className="text-sm text-gray-700 dark:text-slate-300">{dim.build}</p>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/20">
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1"><Lightbulb size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('timeToMarketWhy').split('.')[0]}</p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">{dim.whyItMatters}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cost Breakdown */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center"><DollarSign size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('costYear1')}</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-4"><Wrench size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('dimEngineeringCost')}</h3>
              <ul className="space-y-3">
                {buildCostRows.map((row) => (
                  <li key={row.item} className="flex justify-between items-start text-sm">
                    <span className="text-gray-600 dark:text-slate-400 mr-4">{row.item}</span>
                    <span className="font-medium text-gray-900 dark:text-white whitespace-nowrap">{row.cost}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                <div className="flex justify-between font-bold">
                  <span className="text-gray-900 dark:text-white">{t('costYear1')}</span>
                  <span className="text-red-600 dark:text-red-400">$550K–$1.5M+</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">🪝 HookSniff</h3>
              <ul className="space-y-3">
                {hooksniffCostRows.map((row) => (
                  <li key={row.item} className="flex justify-between items-start text-sm">
                    <span className="text-gray-600 dark:text-slate-400 mr-4">{row.item}</span>
                    <span className="font-medium text-gray-900 dark:text-white whitespace-nowrap">{row.cost}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                <div className="flex justify-between font-bold">
                  <span className="text-gray-900 dark:text-white">{t('costYear1')}</span>
                  <span className="text-emerald-600 dark:text-emerald-400">$348</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* When to Build */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("whenBuilding")}</h2>
          <ul className="space-y-2">
            {whenBuildItems.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-400">
                <svg className="w-4 h-4 text-gray-500 dark:text-slate-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
          <p className="text-sm text-gray-500 dark:text-slate-500 mt-4">
            {t('whenBuildNote')}{' '}
            <a href="https://github.com/servetarslan02/HookSniff" className="text-brand-600 dark:text-brand-400 hover:underline" target="_blank" rel="noopener noreferrer">{t('whenBuildNote2')}</a>
          </p>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">{t("faq")}</h2>
          <div className="space-y-3 max-w-3xl mx-auto">
            {faq.map((item, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                <button
                  type="button"
                  aria-expanded={expandedFaq === i}
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span className="font-medium text-gray-900 dark:text-white pr-4">{item.q}</span>
                  <svg className={`w-5 h-5 text-gray-500 dark:text-slate-500 shrink-0 transition-transform ${expandedFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedFaq === i && (
                  <div className="px-6 pb-4">
                    <p className="text-sm text-gray-600 dark:text-slate-400">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-8 bg-gray-900 dark:bg-slate-800 rounded-xl">
          <h2 className="text-2xl font-bold text-white mb-2">{t('ctaTitle')}</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-6">{t('ctaSubtitle')}</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/login" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">{t('ctaButton')}</Link>
            <Link href="/compare" className="px-6 py-3 border border-gray-600 dark:border-slate-600 text-gray-300 dark:text-slate-300 rounded-lg text-sm font-medium hover:border-gray-400 dark:hover:border-slate-400 transition-colors">{t("compareAlternatives")}</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
