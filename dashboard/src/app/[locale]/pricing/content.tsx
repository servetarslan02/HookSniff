'use client';

import React, { useState } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/store';
import Footer from '@/components/Footer';
import PublicNavbar from '@/components/PublicNavbar';
import { DollarSign, Lock, Shield, Key, ShieldCheck, ClipboardList, Globe, MapPin, Rocket, Star, Anchor, XCircle, CheckCircle, Clock } from '@/components/icons';



/* ─── ROI Calculator ─── */

function RoiCalculator() {
  const [events, setEvents] = useState(10000);
  const t = useTranslations('pricing');

  const svixCost = events <= 0 ? 0 : 490;
  const hookdeckCost = events <= 10000 ? 0 : 39 + Math.max(0, Math.ceil((events - 10000) / 100000)) * 1;
  const hooksniffCost = events <= 1000 ? 0 : events <= 30000 ? 24 : events <= 100000 ? 49 : 149 + Math.max(0, Math.ceil((events - 100000) / 1000)) * 0.0001;
  const savingsVsSvix = svixCost - hooksniffCost;
  const savingsPercent = svixCost > 0 ? Math.round((savingsVsSvix / svixCost) * 100) : 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-xs dark:shadow-lg p-6 md:p-8">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2"><DollarSign size={20} strokeWidth={1.75} className="inline mr-1" /> {t('roiTitle')}</h3>
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
        <div className="flex justify-between text-xs text-gray-500 dark:text-slate-600 mt-1">
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
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1"><Anchor size={14} strokeWidth={1.75} className="inline mr-1" /> HookSniff</p>
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

export function PricingPageContent() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const router = useRouter();
  const { token } = useAuth();
  const t = useTranslations('pricing');
  const tf = useTranslations('pricingFaq');

  const monthlyPrices = { developer: 0, startup: 24, pro: 49, enterprise: 149 };
  const annualPrices = {
    developer: 0,
    startup: Math.round(24 * 12 * 0.8),
    pro: Math.round(49 * 12 * 0.8),
    enterprise: Math.round(149 * 12 * 0.8),
  };

  const getPrice = (plan: string) => {
    if (plan === 'developer') return '$0';
    if (plan === 'enterprise') return '$149';
    const prices = billingPeriod === 'annual' ? annualPrices : monthlyPrices;
    const val = prices[plan as keyof typeof prices];
    return `$${val}`;
  };

  const getPeriodLabel = () => billingPeriod === 'annual' ? t('billedAnnually') : t('month');

  const planData = [
    { key: 'developer', ctaStyle: 'outline-solid', popular: false },
    { key: 'startup', ctaStyle: 'outline-solid', popular: false },
    { key: 'pro', ctaStyle: 'filled', popular: true },
    { key: 'enterprise', ctaStyle: 'outline-solid', popular: false },
  ];

  const featureKeys: Record<string, string[]> = {
    developer: t.raw('developerFeatures') as string[],
    startup: t.raw('startupFeatures') as string[],
    pro: t.raw('proFeatures') as string[],
    enterprise: t.raw('enterpriseFeatures') as string[],
  };

  const comparisonSections = [
    {
      category: t('usage'),
      items: [
        { feature: t('dailyEvents'), developer: '1,000', startup: '30,000', pro: '100,000', enterprise: t('custom') },
        { feature: t('applications'), developer: t('unlimited'), startup: t('unlimited'), pro: t('unlimited'), enterprise: t('unlimited') },
        { feature: t('endpoints'), developer: '5', startup: '50', pro: '500', enterprise: t('unlimited') },
        { feature: t('eventTypes'), developer: '10', startup: '50', pro: t('unlimited'), enterprise: t('unlimited') },
        { feature: t('teamMembers'), developer: '1', startup: '25', pro: t('unlimited'), enterprise: t('unlimited') },
        { feature: t('subscriptions'), developer: '10', startup: '300', pro: t('unlimited'), enterprise: t('unlimited') },
        { feature: t('overagePerEvent'), developer: '—', startup: '$0.003', pro: '$0.0001', enterprise: t('custom') },
      ],
    },
    {
      category: t('delivery'),
      items: [
        { feature: t('deliveryMethods'), developer: t('http'), startup: `${t('http')}, WebSocket`, pro: `${t('http')}, WebSocket`, enterprise: `${t('http')}, WebSocket` },
        { feature: t('retryAttempts'), developer: '3', startup: '5', pro: '10', enterprise: t('custom') },
        { feature: t('customRetryPolicies'), developer: '—', startup : <CheckCircle size={16} className="text-emerald-500 mx-auto" />, pro : <CheckCircle size={16} className="text-emerald-500 mx-auto" />, enterprise : <CheckCircle size={16} className="text-emerald-500 mx-auto" /> },
        { feature: t('fifoDelivery'), developer: '—', startup: '—', pro : <CheckCircle size={16} className="text-emerald-500 mx-auto" />, enterprise : <CheckCircle size={16} className="text-emerald-500 mx-auto" /> },
        { feature: t('exponentialBackoff'), developer : <CheckCircle size={16} className="text-emerald-500 mx-auto" />, startup : <CheckCircle size={16} className="text-emerald-500 mx-auto" />, pro : <CheckCircle size={16} className="text-emerald-500 mx-auto" />, enterprise : <CheckCircle size={16} className="text-emerald-500 mx-auto" /> },
        { feature: t('dlq'), developer: '—', startup : <CheckCircle size={16} className="text-emerald-500 mx-auto" />, pro : <CheckCircle size={16} className="text-emerald-500 mx-auto" />, enterprise : <CheckCircle size={16} className="text-emerald-500 mx-auto" /> },
      ],
    },
    {
      category: t('security'),
      items: [
        { feature: t('hmacSignatures'), developer : <CheckCircle size={16} className="text-emerald-500 mx-auto" />, startup : <CheckCircle size={16} className="text-emerald-500 mx-auto" />, pro : <CheckCircle size={16} className="text-emerald-500 mx-auto" />, enterprise : <CheckCircle size={16} className="text-emerald-500 mx-auto" /> },
        { feature: t('secretRotation'), developer: '—', startup : <CheckCircle size={16} className="text-emerald-500 mx-auto" />, pro : <CheckCircle size={16} className="text-emerald-500 mx-auto" />, enterprise : <CheckCircle size={16} className="text-emerald-500 mx-auto" /> },
        { feature: `${t('ipWhitelisting')} (Coming Soon)`, developer: '—', startup: '—', pro : <Clock size={16} className="text-amber-500 mx-auto" />, enterprise : <Clock size={16} className="text-amber-500 mx-auto" /> },
        { feature: t('ssoSaml'), developer: '—', startup: '—', pro: '—', enterprise : <CheckCircle size={16} className="text-emerald-500 mx-auto" /> },
        { feature: t('twoFactor'), developer : <CheckCircle size={16} className="text-emerald-500 mx-auto" />, startup : <CheckCircle size={16} className="text-emerald-500 mx-auto" />, pro : <CheckCircle size={16} className="text-emerald-500 mx-auto" />, enterprise : <CheckCircle size={16} className="text-emerald-500 mx-auto" /> },
        { feature: t('cloudevents'), developer: '—', startup : <CheckCircle size={16} className="text-emerald-500 mx-auto" />, pro : <CheckCircle size={16} className="text-emerald-500 mx-auto" />, enterprise : <CheckCircle size={16} className="text-emerald-500 mx-auto" /> },
      ],
    },
    {
      category: t('monitoringLogs'),
      items: [
        { feature: t('dashboard'), developer : <CheckCircle size={16} className="text-emerald-500 mx-auto" />, startup : <CheckCircle size={16} className="text-emerald-500 mx-auto" />, pro : <CheckCircle size={16} className="text-emerald-500 mx-auto" />, enterprise : <CheckCircle size={16} className="text-emerald-500 mx-auto" /> },
        { feature: t('logRetention'), developer: `7 ${t('days')}`, startup: `14 ${t('days')}`, pro: `180 ${t('days')}`, enterprise: t('custom') },
        { feature: t('realtimeLogs'), developer : <CheckCircle size={16} className="text-emerald-500 mx-auto" />, startup : <CheckCircle size={16} className="text-emerald-500 mx-auto" />, pro : <CheckCircle size={16} className="text-emerald-500 mx-auto" />, enterprise : <CheckCircle size={16} className="text-emerald-500 mx-auto" /> },
        { feature: t('analyticsGraphs'), developer: '—', startup : <CheckCircle size={16} className="text-emerald-500 mx-auto" />, pro : <CheckCircle size={16} className="text-emerald-500 mx-auto" />, enterprise : <CheckCircle size={16} className="text-emerald-500 mx-auto" /> },
        { feature: t('schemaRegistry'), developer: '—', startup: '—', pro : <CheckCircle size={16} className="text-emerald-500 mx-auto" />, enterprise : <CheckCircle size={16} className="text-emerald-500 mx-auto" /> },
        { feature: t('webhookPlayground'), developer: '—', startup : <CheckCircle size={16} className="text-emerald-500 mx-auto" />, pro : <CheckCircle size={16} className="text-emerald-500 mx-auto" />, enterprise : <CheckCircle size={16} className="text-emerald-500 mx-auto" /> },
      ],
    },
    {
      category: t('support'),
      items: [
        { feature: t('communitySupport'), developer : <CheckCircle size={16} className="text-emerald-500 mx-auto" />, startup : <CheckCircle size={16} className="text-emerald-500 mx-auto" />, pro : <CheckCircle size={16} className="text-emerald-500 mx-auto" />, enterprise : <CheckCircle size={16} className="text-emerald-500 mx-auto" /> },
        { feature: t('emailSupport'), developer: '—', startup : <CheckCircle size={16} className="text-emerald-500 mx-auto" />, pro : <CheckCircle size={16} className="text-emerald-500 mx-auto" />, enterprise : <CheckCircle size={16} className="text-emerald-500 mx-auto" /> },
        { feature: t('prioritySupport'), developer: '—', startup: '—', pro : <CheckCircle size={16} className="text-emerald-500 mx-auto" />, enterprise : <CheckCircle size={16} className="text-emerald-500 mx-auto" /> },
        { feature: t('dedicatedManager'), developer: '—', startup: '—', pro: '—', enterprise : <CheckCircle size={16} className="text-emerald-500 mx-auto" /> },
        { feature: t('slaGuarantee'), developer: '—', startup: '—', pro: '—', enterprise: '99.9%' },
        { feature: t('customIntegrations'), developer: '—', startup: '—', pro: '—', enterprise : <CheckCircle size={16} className="text-emerald-500 mx-auto" /> },
      ],
    },
  ];

  const faqCount = 16;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <PublicNavbar pageTitle={t('title')} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
        {/* Hero */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <span className="inline-block px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm font-medium rounded-full mb-3 sm:mb-4">
            {t('badge')}
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            {t('heroTitle')}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto mb-2 px-2">
            {t('heroSubtitle')}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-500 mb-4 sm:mb-8">
            {t('heroNote')}
          </p>

          {/* Billing Period Toggle */}
          <div className="inline-flex items-center gap-3 p-1 bg-gray-100 dark:bg-slate-800 rounded-full">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={
                'px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ' +
                (billingPeriod === 'monthly'
                  ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white')
              }
            >
              {t('monthly')}
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={
                'px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer flex items-center gap-2 ' +
                (billingPeriod === 'annual'
                  ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white')
              }
            >
              {t('annual')}
              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full">
                {t('savePercent', { percent: 20 })}
              </span>
            </button>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {planData.map((plan) => (
            <div
              key={plan.key}
              className={
                'relative rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col ' +
                (plan.popular
                  ? 'bg-white dark:bg-slate-800 border-2 border-brand-500 dark:border-brand-400 shadow-xl dark:shadow-brand-500/20 ring-1 ring-brand-400/30 dark:ring-brand-500/30'
                  : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-lg')
              }
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-600 to-purple-600 text-white px-5 py-1.5 rounded-full text-sm font-bold shadow-lg z-10 whitespace-nowrap">
                  <Star size={14} strokeWidth={1.75} className="inline-block align-text-bottom mr-1 text-amber-500" /> {t('mostPopular')}
                </div>
              )}
              {/* Startup: First month free badge */}
              {plan.key === 'startup' && (
                <div className="absolute -top-3.5 right-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg z-10 whitespace-nowrap">
                  🎁 {t('firstMonthFree') || 'İlk Ay Ücretsiz'}
                </div>
              )}
              {/* Header */}
              <div className={`p-6 pb-4 ${plan.popular ? 'pt-8 bg-gradient-to-br from-brand-50 to-purple-50 dark:from-brand-500/10 dark:to-purple-500/10' : ''}`}>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t(plan.key)}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 leading-relaxed min-h-[2.5rem]">{t(`${plan.key}Desc`)}</p>
                <div className="mt-4 flex items-baseline gap-1 min-h-[3.5rem]">
                  <span className="text-5xl font-extrabold text-gray-900 dark:text-white">{getPrice(plan.key)}</span>
                  <span className="text-gray-500 dark:text-slate-500 text-sm font-medium">{getPeriodLabel()}</span>
                </div>
                {billingPeriod === 'annual' && plan.key !== 'developer' && plan.key !== 'enterprise' && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium min-h-[1rem]">
                    {t('billedAnnually')}
                  </p>
                )}
              </div>
              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-slate-600 to-transparent" />
              {/* Features */}
              <ul className="p-6 space-y-3 flex-1">
                {featureKeys[plan.key].map((f: string) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-gray-700 dark:text-slate-300">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="leading-snug">{f}</span>
                  </li>
                ))}
              </ul>
              {/* CTA */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => {
                    if (token) {
                      router.push(`/billing`);
                    } else {
                      router.push('/register');
                    }
                  }}
                  className={
                    'block w-full text-center py-3.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ' +
                    (plan.ctaStyle === 'filled'
                      ? 'bg-gradient-to-r from-brand-600 to-purple-600 text-white hover:from-brand-700 hover:to-purple-700 shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30'
                      : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 shadow-xs')
                  }
                >
                {t('getStarted')}
              </button>
            </div>
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
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white text-center mb-4 sm:mb-6">{t('compareTitle')}</h2>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-xs dark:shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-slate-700">
                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase">{t('feature')}</th>
                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase">Developer</th>
                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase">Startup</th>
                    <th className="py-3 px-4 text-center text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase bg-brand-50/30 dark:bg-brand-500/5">Pro</th>
                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonSections.map((section) => (
                    <React.Fragment key={section.category}>
                      <tr className="bg-gray-50 dark:bg-slate-800/50">
                        <td colSpan={5} className="py-2 px-6 text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">
                          {section.category}
                        </td>
                      </tr>
                      {section.items.map((item) => (
                        <tr key={item.feature} className="border-b border-gray-100 dark:border-slate-700/50 last:border-0">
                          <td className="py-3 px-6 text-gray-700 dark:text-slate-300">{item.feature}</td>
                          <td className="py-3 px-4 text-center text-gray-600 dark:text-slate-400">{item.developer}</td>
                          <td className="py-3 px-4 text-center text-gray-600 dark:text-slate-400">{item.startup}</td>
                          <td className="py-3 px-4 text-center text-gray-900 dark:text-white bg-brand-50/30 dark:bg-brand-500/5 font-medium">{item.pro}</td>
                          <td className="py-3 px-4 text-center text-gray-900 dark:text-white">{item.enterprise}</td>
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
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white text-center mb-4 sm:mb-8">{t('securityTitle')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[
              { icon: <Lock size={24} strokeWidth={1.75} />, titleKey: 'securityItem1Title', descKey: 'securityItem1Desc' },
              { icon: <Shield size={24} strokeWidth={1.75} />, titleKey: 'securityItem2Title', descKey: 'securityItem2Desc' },
              { icon: <Globe size={24} strokeWidth={1.75} />, titleKey: 'securityItem3Title', descKey: 'securityItem3Desc' },
              { icon: <Key size={24} strokeWidth={1.75} />, titleKey: 'securityItem4Title', descKey: 'securityItem4Desc' },
              { icon: <ShieldCheck size={24} strokeWidth={1.75} />, titleKey: 'securityItem5Title', descKey: 'securityItem5Desc' },
              { icon: <ClipboardList size={24} strokeWidth={1.75} />, titleKey: 'securityItem6Title', descKey: 'securityItem6Desc' },
              { icon: <Globe size={24} strokeWidth={1.75} />, titleKey: 'securityItem7Title', descKey: 'securityItem7Desc' },
              { icon: <MapPin size={24} strokeWidth={1.75} />, titleKey: 'securityItem8Title', descKey: 'securityItem8Desc' },
            ].map((item) => (
              <div key={item.titleKey} className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4 text-center">
                <span className="text-gray-600 dark:text-slate-400">{item.icon}</span>
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm mt-2">{t(item.titleKey)}</h4>
                <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">{t(item.descKey)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Support Levels */}
        <div className="mb-16">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white text-center mb-4 sm:mb-8">{t('supportTitle')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              { plan: t('developer'), level: t('communitySupport'), features: t.raw('supportDeveloperFeatures') as string[], response: t('supportBestEffort'), highlight: false },
              { plan: t('pro'), level: t('prioritySupport'), features: t.raw('supportProFeatures') as string[], response: t('supportResponse48h'), highlight: true },
              { plan: t('enterprise'), level: t('dedicatedManager'), features: t.raw('supportEnterpriseFeatures') as string[], response: t('supportResponse24h'), highlight: false },
            ].map((s) => (
              <div
                key={s.plan}
                className={
                  'bg-white dark:bg-slate-800 rounded-xl border p-6 flex flex-col ' +
                  (s.highlight ? 'border-brand-400 dark:border-brand-500 ring-1 ring-brand-400 dark:ring-brand-500' : 'border-gray-200 dark:border-slate-700')
                }
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

        {/* Build vs Buy */}
        <div className="mb-16 p-6 md:p-8 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-xs dark:shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">{t('buildVsBuy')}</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-4"><XCircle size={18} strokeWidth={1.75} className="inline mr-1" /> {t('buildingOwn')}</h3>
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
              <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 mb-4"><CheckCircle size={18} strokeWidth={1.75} className="inline mr-1" /> {t('usingHookSniff')}</h3>
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
        <div className="mb-16 text-center p-8 bg-linear-to-r from-brand-50 to-blue-50 dark:from-brand-500/10 dark:to-blue-500/10 rounded-xl border border-brand-100 dark:border-brand-500/20">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2"><Rocket size={24} strokeWidth={1.75} className="inline mr-1" /> {t('startupTitle')}</h2>
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
                    className={`w-5 h-5 text-gray-500 dark:text-slate-500 shrink-0 transition-transform ${expandedFaq === i ? 'rotate-180' : ''}`}
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
          <p className="text-gray-500 dark:text-slate-400 mb-6">{t('ctaDesc')}</p>
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
