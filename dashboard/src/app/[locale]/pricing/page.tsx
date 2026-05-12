'use client';

import React, { useState } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/lib/store';
import Footer from '@/components/Footer';
import PublicNavbar from '@/components/PublicNavbar';



/* ─── ROI Calculator ─── */

function RoiCalculator() {
  const [events, setEvents] = useState(10000);
  const t = useTranslations('pricing');

  const svixCost = events <= 0 ? 0 : 490;
  const hookdeckCost = events <= 10000 ? 0 : 39 + Math.max(0, Math.ceil((events - 10000) / 100000)) * 1;
  const hooksniffCost = events <= 10000 ? 0 : events <= 50000 ? 49 : 99;
  const savingsVsSvix = svixCost - hooksniffCost;
  const savingsPercent = svixCost > 0 ? Math.round((savingsVsSvix / svixCost) * 100) : 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-lg p-6 md:p-8">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">💰 {t('roiTitle')}</h3>
      <p className="text-sm text-gray-600 dark:text-slate-400 mb-6">{t('roiDesc')}</p>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
          {t('roiMonthlyWebhooks')}: <span className="text-brand-600 dark:text-brand-400 font-bold">{events.toLocaleString()}</span>
        </label>
        <input
          type="range"
          min={0}
          max={100000}
          step={1000}
          value={events}
          onChange={(e) => setEvents(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
        />
        <div className="flex justify-between text-xs text-gray-400 dark:text-slate-600 mt-1">
          <span>0</span>
          <span>50K</span>
          <span>100K</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
          <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">Svix</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-400">${svixCost}</p>
          <p className="text-xs text-red-500 dark:text-red-500">{t('month')}</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">Hookdeck</p>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">${hookdeckCost}</p>
          <p className="text-xs text-amber-500 dark:text-amber-500">{t('month')}</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border-2 border-emerald-400 dark:border-emerald-500/40">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">🪝 HookSniff</p>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">${hooksniffCost}</p>
          <p className="text-xs text-emerald-500 dark:text-emerald-500">{t('month')}</p>
        </div>
      </div>

      {savingsVsSvix > 0 && (
        <div className="text-center p-4 rounded-lg bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20">
          <p className="text-sm text-gray-600 dark:text-slate-400">
            {t('roiYouSave')} <span className="text-brand-700 dark:text-brand-400 font-bold text-lg">${savingsVsSvix}/mo</span> {t('roiVsSvix')}
            <span className="text-brand-600 dark:text-brand-400 font-bold"> ({savingsPercent}% {t('roiLess')})</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
            {t('roiPerYear', { amount: `$${(savingsVsSvix * 12).toLocaleString()}` })}
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─── */

export default function PricingPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const router = useRouter();
  const { token } = useAuth();
  const locale = useLocale();
  const t = useTranslations('pricing');
  const tf = useTranslations('pricingFaq');
  const isTr = locale === 'tr';

  const planData = [
    { key: 'free', price: isTr ? '₺0' : '$0', ctaStyle: 'outline', popular: false },
    { key: 'pro', price: isTr ? '₺999' : '$49', ctaStyle: 'filled', popular: true },
    { key: 'business', price: isTr ? '₺1,999' : '$99', ctaStyle: 'outline', popular: false },
  ];

  const featureKeys: Record<string, string[]> = {
    free: t.raw('freeFeatures') as string[],
    pro: t.raw('proFeatures') as string[],
    business: t.raw('businessFeatures') as string[],
  };

  const comparisonSections = [
    {
      category: t('usage'),
      items: [
        { feature: t('monthlyWebhooks'), free: '1,000', pro: '50,000', business: '500,000' },
        { feature: t('endpoints'), free: '1', pro: '10', business: t('unlimited') },
        { feature: t('rateLimit'), free: '100', pro: '1,000', business: '10,000' },
        { feature: t('additionalEvents'), free: '—', pro: '$0.50/100K', business: '$0.30/100K' },
        { feature: t('teamMembers'), free: '1', pro: '3', business: t('unlimited') },
      ],
    },
    {
      category: t('delivery'),
      items: [
        { feature: t('deliveryMethods'), free: t('http'), pro: `${t('http')}, ${t('ws')}`, business: `${t('http')}, ${t('ws')}, ${t('grpc')}, ${t('sqs')}` },
        { feature: t('retryAttempts'), free: '3', pro: '5', business: '10' },
        { feature: t('customRetryPolicies'), free: '—', pro: '✅', business: '✅' },
        { feature: t('fifoDelivery'), free: '—', pro: '—', business: '✅' },
        { feature: t('exponentialBackoff'), free: '✅', pro: '✅', business: '✅' },
        { feature: t('dlq'), free: '—', pro: '✅', business: '✅' },
      ],
    },
    {
      category: t('security'),
      items: [
        { feature: t('hmacSignatures'), free: '✅', pro: '✅', business: '✅' },
        { feature: t('secretRotation'), free: '—', pro: '✅', business: '✅' },
        { feature: t('ipWhitelisting'), free: '—', pro: '—', business: '✅' },
        { feature: t('ssoSaml'), free: '—', pro: '—', business: '✅' },
        { feature: t('twoFactor'), free: '✅', pro: '✅', business: '✅' },
        { feature: t('cloudevents'), free: '—', pro: '✅', business: '✅' },
      ],
    },
    {
      category: t('monitoringLogs'),
      items: [
        { feature: t('dashboard'), free: '✅', pro: '✅', business: '✅' },
        { feature: t('logRetention'), free: `7 ${t('days')}`, pro: `30 ${t('days')}`, business: `90 ${t('days')}` },
        { feature: t('realtimeLogs'), free: '✅', pro: '✅', business: '✅' },
        { feature: t('analyticsGraphs'), free: '—', pro: '✅', business: '✅' },
        { feature: t('schemaRegistry'), free: '—', pro: '—', business: '✅' },
        { feature: t('webhookPlayground'), free: '—', pro: '✅', business: '✅' },
      ],
    },
    {
      category: t('support'),
      items: [
        { feature: t('communitySupport'), free: '✅', pro: '✅', business: '✅' },
        { feature: t('emailSupport'), free: '—', pro: '✅', business: '✅' },
        { feature: t('prioritySupport'), free: '—', pro: '✅', business: '✅' },
        { feature: t('dedicatedManager'), free: '—', pro: '—', business: '✅' },
        { feature: t('slaGuarantee'), free: '—', pro: '—', business: '99.9%' },
        { feature: t('customIntegrations'), free: '—', pro: '—', business: '✅' },
      ],
    },
  ];

  const testimonials = [
    { quoteKey: 'testimonial1Quote', authorKey: 'testimonial1Author', companyKey: 'testimonial1Company', avatar: 'CS' },
    { quoteKey: 'testimonial2Quote', authorKey: 'testimonial2Author', companyKey: 'testimonial2Company', avatar: 'LD' },
    { quoteKey: 'testimonial3Quote', authorKey: 'testimonial3Author', companyKey: 'testimonial3Company', avatar: 'SF' },
  ];

  const faqCount = 16;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <PublicNavbar pageTitle={t('title')} />

      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm font-medium rounded-full mb-4">
            {t('badge')}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('heroTitle')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto mb-2">
            {t('heroSubtitle')}
          </p>
          <p className="text-sm text-gray-500 dark:text-slate-500">
            {t('heroNote')}
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {planData.map((plan) => (
            <div
              key={plan.key}
              className={`relative rounded-xl p-6 transition-all duration-300 hover:shadow-lg flex flex-col ${
                plan.popular
                  ? 'bg-white dark:bg-slate-800 border-2 border-brand-400 dark:border-brand-500 shadow-lg dark:shadow-brand-500/20 ring-1 ring-brand-400/30 dark:ring-brand-500/30'
                  : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-lg'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-brand-600 text-white text-xs font-medium rounded-full">
                  {t('mostPopular')}
                </span>
              )}
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t(plan.key)}</h3>
              <div className="mt-2 mb-1">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                <span className="text-gray-500 dark:text-slate-500">{t('month')}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-6">{t(`${plan.key}Desc`)}</p>
              <ul className="space-y-3 mb-6 flex-1">
                {featureKeys[plan.key].map((f: string) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-700 dark:text-slate-300">
                    <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  if (plan.key === 'business') {
                    router.push(`/${locale}/contact`);
                  } else if (token) {
                    router.push(`/${locale}/dashboard/billing`);
                  } else {
                    router.push(`/${locale}/register`);
                  }
                }}
                className={`block w-full text-center py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  plan.ctaStyle === 'filled'
                    ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-md'
                    : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 shadow-sm'
                }`}
              >
                {plan.key === 'business' ? t('contactSales') : plan.key === 'pro' ? t('startTrial') : t('getStarted')}
              </button>
            </div>
          ))}
        </div>

        {/* "Only pay for what you use" */}
        <div className="text-center mb-16 p-6 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
          <p className="text-lg font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
            {t('payWhatYouUse')}
          </p>
          <p className="text-sm text-emerald-700 dark:text-emerald-400">
            {t('payWhatYouUseDesc')}
          </p>
        </div>

        {/* ROI Calculator */}
        <div className="mb-16">
          <RoiCalculator />
        </div>

        {/* Comparison Table */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">{t('compareTitle')}</h2>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm dark:shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700">
                    <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white w-2/5">{t('feature')}</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-900 dark:text-white">{t('free')}</th>
                    <th className="text-center py-4 px-4 font-semibold text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-500/10">{t('pro')}</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-900 dark:text-white">{t('business')}</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonSections.map((section) => (
                    <React.Fragment key={section.category}>
                      <tr className="bg-gray-50 dark:bg-slate-800/50">
                        <td colSpan={4} className="py-2 px-6 text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">
                          {section.category}
                        </td>
                      </tr>
                      {section.items.map((item) => (
                        <tr key={item.feature} className="border-b border-gray-100 dark:border-slate-700/50 last:border-0">
                          <td className="py-3 px-6 text-gray-700 dark:text-slate-300">{item.feature}</td>
                          <td className="py-3 px-4 text-center text-gray-600 dark:text-slate-400">{item.free}</td>
                          <td className="py-3 px-4 text-center text-gray-900 dark:text-white bg-brand-50/30 dark:bg-brand-500/5 font-medium">{item.pro}</td>
                          <td className="py-3 px-4 text-center text-gray-900 dark:text-white">{item.business}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Security & Compliance */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">{t('securityTitle')}</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: '🔒', titleKey: 'securityItem1Title', descKey: 'securityItem1Desc' },
              { icon: '🛡️', titleKey: 'securityItem2Title', descKey: 'securityItem2Desc' },
              { icon: '🇪🇺', titleKey: 'securityItem3Title', descKey: 'securityItem3Desc' },
              { icon: '🔑', titleKey: 'securityItem4Title', descKey: 'securityItem4Desc' },
              { icon: '🔐', titleKey: 'securityItem5Title', descKey: 'securityItem5Desc' },
              { icon: '📋', titleKey: 'securityItem6Title', descKey: 'securityItem6Desc' },
              { icon: '🌐', titleKey: 'securityItem7Title', descKey: 'securityItem7Desc' },
              { icon: '📍', titleKey: 'securityItem8Title', descKey: 'securityItem8Desc' },
            ].map((item) => (
              <div key={item.titleKey} className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4 text-center">
                <span className="text-2xl">{item.icon}</span>
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm mt-2">{t(item.titleKey)}</h4>
                <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">{t(item.descKey)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Support Levels */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">{t('supportTitle')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { plan: t('free'), level: t('communitySupport'), features: t.raw('supportFreeFeatures') as string[], response: t('supportBestEffort'), highlight: false },
              { plan: t('pro'), level: t('prioritySupport'), features: t.raw('supportProFeatures') as string[], response: '< 48 hours', highlight: true },
              { plan: t('business'), level: t('dedicatedManager'), features: t.raw('supportBusinessFeatures') as string[], response: '< 24 hours', highlight: false },
            ].map((s) => (
              <div
                key={s.plan}
                className={`bg-white dark:bg-slate-800 rounded-xl border p-6 flex flex-col ${
                  s.highlight ? 'border-brand-400 dark:border-brand-500 ring-1 ring-brand-400 dark:ring-brand-500' : 'border-gray-200 dark:border-slate-700'
                }`}
              >
                <p className="text-xs font-medium text-gray-500 dark:text-slate-500 uppercase tracking-wider">{s.plan}</p>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1">{s.level}</h3>
                <p className="text-sm text-brand-600 dark:text-brand-400 font-medium mb-4">{t('supportResponse')}: {s.response}</p>
                <ul className="space-y-2 flex-1">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300">
                      <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">{t('testimonialsTitle')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t_item, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-lg p-6">
                <svg className="w-8 h-8 text-brand-200 dark:text-brand-800 mb-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
                </svg>
                <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed mb-4">{t(t_item.quoteKey)}</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 text-xs font-bold">
                    {t_item.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{t(t_item.authorKey)}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-500">{t(t_item.companyKey)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Build vs Buy */}
        <div className="mb-16 p-6 md:p-8 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">{t('buildVsBuy')}</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-4">❌ {t('buildingOwn')}</h3>
              <ul className="space-y-3">
                {(t.raw('buildOwnItems') as string[]).map((item: string) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-400">
                    <span className="text-red-500 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 mb-4">✅ {t('usingHookSniff')}</h3>
              <ul className="space-y-3">
                {(t.raw('useHookSniffItems') as string[]).map((item: string) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-700 dark:text-slate-300">
                    <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Startup Discount */}
        <div className="mb-16 text-center p-8 bg-gradient-to-r from-brand-50 to-blue-50 dark:from-brand-500/10 dark:to-blue-500/10 rounded-xl border border-brand-100 dark:border-brand-500/20">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">🚀 {t('startupTitle')}</h2>
          <p className="text-gray-600 dark:text-slate-400 max-w-xl mx-auto mb-4">
            {t('startupDesc')}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {t('startupCta')}
          </Link>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">{t('faqTitle')}</h2>
          <div className="max-w-3xl mx-auto space-y-3">
            {Array.from({ length: faqCount }, (_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="font-medium text-gray-900 dark:text-white text-sm pr-4">{tf(`${i}.q`)}</span>
                  <svg
                    className={`w-5 h-5 text-gray-400 dark:text-slate-500 shrink-0 transition-transform ${expandedFaq === i ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedFaq === i && (
                  <div className="px-6 pb-4">
                    <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">{tf(`${i}.a`)}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-8 bg-gray-900 dark:bg-slate-800 rounded-xl">
          <h2 className="text-2xl font-bold text-white mb-2">{t('ctaTitle')}</h2>
          <p className="text-gray-400 dark:text-slate-400 mb-6">{t('ctaDesc')}</p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/login"
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {t('ctaStart')}
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 border border-gray-600 dark:border-slate-600 text-gray-300 dark:text-slate-300 rounded-lg text-sm font-medium hover:border-gray-400 dark:hover:border-slate-400 transition-colors"
            >
              {t('ctaContact')}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
