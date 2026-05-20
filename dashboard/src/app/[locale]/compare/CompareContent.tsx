'use client';
import React from 'react';
import { useTranslations } from 'next-intl';

import { useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Inbox, Anchor, Check, X, AlertTriangle, LinkIcon } from 'lucide-react';

const tlDrKeys = ['tlDr1', 'tlDr2', 'tlDr3', 'tlDr4', 'tlDr5'];

/* Section keys map — title, description, bestFit are translated via t() */
const sectionKeys = [
  { titleKey: 'sectionProductionTitle', descKey: 'sectionProductionDesc', bestFitKey: 'bestFitProduction', winner: 'svix',
    hooksniff: { text: 'prodHooksniff', badge: 'badgeGrowing' },
    svix: { text: 'prodSvix', badge: 'badgeLeader' },
    hookdeck: { text: 'prodHookdeck', badge: 'badgeEstablished' },
    hook0: { text: 'prodHook0', badge: 'badgeNiche' },
  },
  { titleKey: 'sectionUptimeTitle', descKey: 'sectionUptimeDesc', bestFitKey: 'bestFitUptime', winner: 'svix',
    hooksniff: { text: 'uptimeHooksniff', badge: '99.9%' },
    svix: { text: 'uptimeSvix', badge: '99.999%' },
    hookdeck: { text: 'uptimeHookdeck', badge: '99.999%' },
    hook0: { text: 'uptimeHook0', badge: 'badgeNa' },
  },
  { titleKey: 'sectionPricingTitle', descKey: 'sectionPricingDesc', bestFitKey: 'bestFitPricing', winner: 'hooksniff',
    hooksniff: { text: 'pricingHooksniff', badge: '$24/mo' },
    svix: { text: 'pricingSvix', badge: '$490/mo' },
    hookdeck: { text: 'pricingHookdeck', badge: '$39/mo+' },
    hook0: { text: 'pricingHook0', badge: 'pricingFree' },
  },
  { titleKey: 'sectionSdkTitle', descKey: 'sectionSdkDesc', bestFitKey: 'bestFitSdk', winner: 'tie',
    hooksniff: { text: 'sdkHooksniff', badge: '11 SDKs' },
    svix: { text: 'sdkSvix', badge: '11 SDKs' },
    hookdeck: { text: 'sdkHookdeck', badge: '8 SDKs' },
    hook0: { text: 'sdkHook0', badge: '4 SDKs' },
  },
  { titleKey: 'sectionFifoTitle', descKey: 'sectionFifoDesc', bestFitKey: 'bestFitFifo', winner: 'hooksniff',
    hooksniff: { text: 'fifoHooksniff', badge: <Check size={14} strokeWidth={1.75} className="text-emerald-500" /> },
    svix: { text: 'fifoSvix', badge: <X size={14} strokeWidth={1.75} className="text-red-500" /> },
    hookdeck: { text: 'fifoHookdeck', badge: <X size={14} strokeWidth={1.75} className="text-red-500" /> },
    hook0: { text: 'fifoHook0', badge: <X size={14} strokeWidth={1.75} className="text-red-500" /> },
  },
  { titleKey: 'sectionCloudEventsTitle', descKey: 'sectionCloudEventsDesc', bestFitKey: 'bestFitCloudEvents', winner: 'hooksniff',
    hooksniff: { text: 'ceHooksniff', badge: <Check size={14} strokeWidth={1.75} className="text-emerald-500" /> },
    svix: { text: 'ceSvix', badge: <X size={14} strokeWidth={1.75} className="text-red-500" /> },
    hookdeck: { text: 'ceHookdeck', badge: <X size={14} strokeWidth={1.75} className="text-red-500" /> },
    hook0: { text: 'ceHook0', badge: <X size={14} strokeWidth={1.75} className="text-red-500" /> },
  },
  { titleKey: 'sectionSchemaTitle', descKey: 'sectionSchemaDesc', bestFitKey: 'bestFitSchema', winner: 'hooksniff',
    hooksniff: { text: 'schemaHooksniff', badge: <Check size={14} strokeWidth={1.75} className="text-emerald-500" /> },
    svix: { text: 'schemaSvix', badge: <X size={14} strokeWidth={1.75} className="text-red-500" /> },
    hookdeck: { text: 'schemaHookdeck', badge: <X size={14} strokeWidth={1.75} className="text-red-500" /> },
    hook0: { text: 'schemaHook0', badge: <X size={14} strokeWidth={1.75} className="text-red-500" /> },
  },
  { titleKey: 'sectionPortalTitle', descKey: 'sectionPortalDesc', bestFitKey: 'bestFitPortal', winner: 'svix',
    hooksniff: { text: 'portalHooksniff', badge: <Check size={14} strokeWidth={1.75} className="text-emerald-500" /> },
    svix: { text: 'portalSvix', badge: 'badgeBest' },
    hookdeck: { text: 'portalHookdeck', badge: <X size={14} strokeWidth={1.75} className="text-red-500" /> },
    hook0: { text: 'portalHook0', badge: <X size={14} strokeWidth={1.75} className="text-red-500" /> },
  },
  { titleKey: 'sectionRoutingTitle', descKey: 'sectionRoutingDesc', bestFitKey: 'bestFitRouting', winner: 'hookdeck',
    hooksniff: { text: 'routingHooksniff', badge: <Check size={14} strokeWidth={1.75} className="text-emerald-500" /> },
    svix: { text: 'routingSvix', badge: <X size={14} strokeWidth={1.75} className="text-red-500" /> },
    hookdeck: { text: 'routingHookdeck', badge: 'badgeBest' },
    hook0: { text: 'routingHook0', badge: <X size={14} strokeWidth={1.75} className="text-red-500" /> },
  },
  { titleKey: 'sectionTransformTitle', descKey: 'sectionTransformDesc', bestFitKey: 'bestFitTransform', winner: 'svix',
    hooksniff: { text: 'transformHooksniff', badge: <Check size={14} strokeWidth={1.75} className="text-emerald-500" /> },
    svix: { text: 'transformSvix', badge: <Check size={14} strokeWidth={1.75} className="text-emerald-500" /> },
    hookdeck: { text: 'transformHookdeck', badge: <Check size={14} strokeWidth={1.75} className="text-emerald-500" /> },
    hook0: { text: 'transformHook0', badge: <X size={14} strokeWidth={1.75} className="text-red-500" /> },
  },
  { titleKey: 'sectionInboundTitle', descKey: 'sectionInboundDesc', bestFitKey: 'bestFitInbound', winner: 'hookdeck',
    hooksniff: { text: 'inboundHooksniff', badge: <Check size={14} strokeWidth={1.75} className="text-emerald-500" /> },
    svix: { text: 'inboundSvix', badge: <Check size={14} strokeWidth={1.75} className="text-emerald-500" /> },
    hookdeck: { text: 'inboundHookdeck', badge: 'badgeBest' },
    hook0: { text: 'inboundHook0', badge: <X size={14} strokeWidth={1.75} className="text-red-500" /> },
  },
  { titleKey: 'sectionStreamingTitle', descKey: 'sectionStreamingDesc', bestFitKey: 'bestFitStreaming', winner: 'svix',
    hooksniff: { text: 'streamingHooksniff', badge: <Check size={14} strokeWidth={1.75} className="text-emerald-500" /> },
    svix: { text: 'streamingSvix', badge: 'badgeBest' },
    hookdeck: { text: 'streamingHookdeck', badge: <X size={14} strokeWidth={1.75} className="text-red-500" /> },
    hook0: { text: 'streamingHook0', badge: <X size={14} strokeWidth={1.75} className="text-red-500" /> },
  },
  { titleKey: 'sectionRateLimitTitle', descKey: 'sectionRateLimitDesc', bestFitKey: 'bestFitRateLimit', winner: 'hooksniff',
    hooksniff: { text: 'rlHooksniff', badge: <Check size={14} strokeWidth={1.75} className="text-emerald-500" /> },
    svix: { text: 'rlSvix', badge: <Check size={14} strokeWidth={1.75} className="text-emerald-500" /> },
    hookdeck: { text: 'rlHookdeck', badge: <Check size={14} strokeWidth={1.75} className="text-emerald-500" /> },
    hook0: { text: 'rlHook0', badge: <X size={14} strokeWidth={1.75} className="text-red-500" /> },
  },
  { titleKey: 'sectionLatencyTitle', descKey: 'sectionLatencyDesc', bestFitKey: 'bestFitLatency', winner: 'hookdeck',
    hooksniff: { text: 'latencyHooksniff', badge: <Check size={14} strokeWidth={1.75} className="text-emerald-500" /> },
    svix: { text: 'latencySvix', badge: <X size={14} strokeWidth={1.75} className="text-red-500" /> },
    hookdeck: { text: 'latencyHookdeck', badge: 'badgeBest' },
    hook0: { text: 'latencyHook0', badge: <X size={14} strokeWidth={1.75} className="text-red-500" /> },
  },
  { titleKey: 'sectionStandardTitle', descKey: 'sectionStandardDesc', bestFitKey: 'bestFitStandard', winner: 'svix',
    hooksniff: { text: 'standardHooksniff', badge: <Check size={14} strokeWidth={1.75} className="text-emerald-500" /> },
    svix: { text: 'standardSvix', badge: 'badgeAuthor' },
    hookdeck: { text: 'standardHookdeck', badge: <AlertTriangle size={14} strokeWidth={1.75} className="text-amber-500" /> },
    hook0: { text: 'standardHook0', badge: <Check size={14} strokeWidth={1.75} className="text-emerald-500" /> },
  },
  { titleKey: 'sectionComplianceTitle', descKey: 'sectionComplianceDesc', bestFitKey: 'bestFitCompliance', winner: 'svix',
    hooksniff: { text: 'complianceHooksniff', badge: 'SOC 2 Ready' },
    svix: { text: 'complianceSvix', badge: 'badgeFull' },
    hookdeck: { text: 'complianceHookdeck', badge: 'SOC 2' },
    hook0: { text: 'complianceHook0', badge: 'GDPR' },
  },
  { titleKey: 'sectionResidencyTitle', descKey: 'sectionResidencyDesc', bestFitKey: 'bestFitResidency', winner: 'svix',
    hooksniff: { text: 'residencyHooksniff', badge: 'EU' },
    svix: { text: 'residencySvix', badge: '6+ regions' },
    hookdeck: { text: 'residencyHookdeck', badge: '3 regions' },
    hook0: { text: 'residencyHook0', badge: 'Any' },
  },
  { titleKey: 'sectionOpenSourceTitle', descKey: 'sectionOpenSourceDesc', bestFitKey: 'bestFitOpenSource', winner: 'hooksniff',
    hooksniff: { text: 'ossHooksniff', badge: <><Check size={14} strokeWidth={1.75} className="text-emerald-500" /> MIT</> },
    svix: { text: 'ossSvix', badge: <><Check size={14} strokeWidth={1.75} className="text-emerald-500" /> MIT</> },
    hookdeck: { text: 'ossHookdeck', badge: <X size={14} strokeWidth={1.75} className="text-red-500" /> },
    hook0: { text: 'ossHook0', badge: <Check size={14} strokeWidth={1.75} className="text-emerald-500" /> },
  },
  { titleKey: 'sectionDxTitle', descKey: 'sectionDxDesc', bestFitKey: 'bestFitDx', winner: 'svix',
    hooksniff: { text: 'dxHooksniff', badge: 'badgeStrong' },
    svix: { text: 'dxSvix', badge: 'badgeBest' },
    hookdeck: { text: 'dxHookdeck', badge: 'badgeStrong' },
    hook0: { text: 'dxHook0', badge: 'badgeBasic' },
  },
  { titleKey: 'sectionContinuityTitle', descKey: 'sectionContinuityDesc', bestFitKey: 'bestFitContinuity', winner: 'svix',
    hooksniff: { text: 'continuityHooksniff', badge: 'badgeLowRisk' },
    svix: { text: 'continuitySvix', badge: 'badgeVeryLow' },
    hookdeck: { text: 'continuityHookdeck', badge: 'badgeLow' },
    hook0: { text: 'continuityHook0', badge: 'badgeLow' },
  },
];

const faqKeys = [
  { q: 'faq1q', a: 'faq1a' },
  { q: 'faq2q', a: 'faq2a' },
  { q: 'faq3q', a: 'faq3a' },
  { q: 'faq4q', a: 'faq4a' },
  { q: 'faq5q', a: 'faq5a' },
  { q: 'faq6q', a: 'faq6a' },
  { q: 'faq7q', a: 'faq7a' },
  { q: 'faq8q', a: 'faq8a' },
];

const scorecard = [
  { categoryKey: 'scoreFeatures', hooksniff: 9, svix: 8, hookdeck: 8, hook0: 5 },
  { categoryKey: 'scorePricing', hooksniff: 10, svix: 4, hookdeck: 7, hook0: 10 },
  { categoryKey: 'scoreCompliance', hooksniff: 6, svix: 10, hookdeck: 8, hook0: 3 },
  { categoryKey: 'scoreDx', hooksniff: 8, svix: 9, hookdeck: 8, hook0: 5 },
  { categoryKey: 'scoreReliability', hooksniff: 7, svix: 10, hookdeck: 10, hook0: 5 },
  { categoryKey: 'scoreOpenSource', hooksniff: 10, svix: 10, hookdeck: 0, hook0: 10 },
];

function Badge({ text, variant }: { text: React.ReactNode; variant: 'green' | 'red' | 'yellow' | 'gray' | 'blue' }) {
  const colors = {
    green: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
    red: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
    gray: 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400',
    blue: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400',
  };
  return <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${colors[variant]}`}>{text}</span>;
}

function getBadgeVariant(winner: string, name: string): 'green' | 'red' | 'yellow' | 'gray' | 'blue' {
  if (winner === name) return 'green';
  if (winner === 'tie') return 'blue';
  return 'gray';
}

export default function CompareContent() {
  const t = useTranslations('compare');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const chooseSections = [
    { when: t('whenChooseHooksniff'), items: [t('chooseHooksniff1'), t('chooseHooksniff2'), t('chooseHooksniff3'), t('chooseHooksniff4'), t('chooseHooksniff5'), t('chooseHooksniff6')] },
    { when: t('whenChooseSvix'), items: [t('chooseSvix1'), t('chooseSvix2'), t('chooseSvix3'), t('chooseSvix4'), t('chooseSvix5'), t('chooseSvix6')] },
    { when: t('whenChooseHookdeck'), items: [t('chooseHookdeck1'), t('chooseHookdeck2'), t('chooseHookdeck3'), t('chooseHookdeck4'), t('chooseHookdeck5')] },
    { when: t('whenChooseHook0'), items: [t('chooseHook01'), t('chooseHook02'), t('chooseHook03'), t('chooseHook04')] },
  ];

  const deepDiveLinks = [
    { title: t('deepDiveTitle'), desc: t('deepDiveDesc'), href: '/alternatives/svix' },
    { title: t('deepDiveTitle2'), desc: t('deepDiveDesc2'), href: '/alternatives/hookdeck' },
    { title: t('deepDiveTitle3'), desc: t('deepDiveDesc3'), href: '/alternatives/hook0' },
    { title: t('deepDiveTitle4'), desc: t('deepDiveDesc4'), href: '/alternatives/svix-alternatives' },
    { title: t('deepDiveTitle5'), desc: t('deepDiveDesc5'), href: '/alternatives/hookdeck-alternatives' },
    { title: t('deepDiveTitle6'), desc: t('deepDiveDesc6'), href: '/build-vs-buy' },
  ];

  const screenshots = [
    { src: '/screenshots/compare-hero.jpg', alt: t('altComparePage'), title: t('comparePage'), desc: t('sectionDesc20') },
    { src: '/screenshots/scorecard.jpg', alt: t('altScorecard'), title: t('scorecard'), desc: t('sectionDesc6') },
    { src: '/screenshots/playground.png', alt: t('altPlayground'), title: t('playground'), desc: t('sectionDescGenUrl') },
    { src: '/screenshots/build-vs-buy.png', alt: t('altBuildVsBuy'), title: t('buildVsBuy'), desc: t('sectionDesc12dim') },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <nav className="border-b border-gray-200/50 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="items-center gap-3 flex">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white"><Anchor size={20} strokeWidth={1.75} className="inline mr-1" /> HookSniff</Link>
            <span className="text-gray-500 dark:text-slate-500">/</span>
            <span className="text-gray-600 dark:text-slate-400">{t("title")}</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('heroTitle')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-3xl mx-auto">
            {t('heroSubtitle')}
          </p>
        </div>

        {/* TL;DR */}
        <div className="mb-16 p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">TL;DR</h2>
          <ul className="space-y-2">
            {tlDrKeys.map((key) => (
              <li key={key} className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-400">
                <svg className="w-4 h-4 text-brand-600 dark:text-brand-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {t(key)}
              </li>
            ))}
          </ul>
        </div>

        {/* Screenshots */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">{t("inAction")}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {screenshots.map((s) => (
              <div key={s.src} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                <Image src={s.src} alt={s.alt} width={800} height={450} className="w-full" />
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">{s.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scorecard */}
        <div className="mb-16 p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t("scorecard")}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="text-left py-2 px-4 font-semibold text-gray-900 dark:text-white">{t("category")}</th>
                  <th className="text-center py-2 px-4 font-semibold text-brand-600 dark:text-brand-400"><Anchor size={14} strokeWidth={1.75} className="inline mr-1" /> HookSniff</th>
                  <th className="text-center py-2 px-4 font-semibold text-gray-900 dark:text-white"><Inbox size={14} strokeWidth={1.75} className="inline mr-1" /> Svix</th>
                  <th className="text-center py-2 px-4 font-semibold text-gray-900 dark:text-white"><LinkIcon size={14} strokeWidth={1.75} className="inline mr-1" /> Hookdeck</th>
                  <th className="text-center py-2 px-4 font-semibold text-gray-900 dark:text-white"><Anchor size={14} strokeWidth={1.75} className="inline mr-1" /> Hook0</th>
                </tr>
              </thead>
              <tbody>
                {scorecard.map((row) => (
                  <tr key={row.categoryKey} className="border-b border-gray-100 dark:border-slate-700/50 last:border-0">
                    <td className="py-2 px-4 text-gray-700 dark:text-slate-300 font-medium">{t(row.categoryKey)}</td>
                    <td className="py-2 px-4 text-center font-bold text-gray-900 dark:text-white bg-brand-50/20 dark:bg-brand-500/5">{row.hooksniff}/10</td>
                    <td className="py-2 px-4 text-center text-gray-600 dark:text-slate-400">{row.svix}/10</td>
                    <td className="py-2 px-4 text-center text-gray-600 dark:text-slate-400">{row.hookdeck}/10</td>
                    <td className="py-2 px-4 text-center text-gray-600 dark:text-slate-400">{row.hook0}/10</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-300 dark:border-slate-700">
                  <td className="py-2 px-4 text-gray-900 dark:text-white font-bold">{t("total")}</td>
                  <td className="py-2 px-4 text-center font-bold text-brand-600 dark:text-brand-400 bg-brand-50/20 dark:bg-brand-500/5">{scorecard.reduce((s, r) => s + r.hooksniff, 0)}</td>
                  <td className="py-2 px-4 text-center font-bold text-gray-900 dark:text-white">{scorecard.reduce((s, r) => s + r.svix, 0)}</td>
                  <td className="py-2 px-4 text-center font-bold text-gray-900 dark:text-white">{scorecard.reduce((s, r) => s + r.hookdeck, 0)}</td>
                  <td className="py-2 px-4 text-center font-bold text-gray-900 dark:text-white">{scorecard.reduce((s, r) => s + r.hook0, 0)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Trust Statement */}
        <div className="mb-16">
          <p className="text-center text-sm text-gray-500 dark:text-slate-500">{t('trustedBy')}</p>
        </div>

        {/* Detailed Sections */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">{t("detailedComparison")}</h2>
          <div className="space-y-6">
            {sectionKeys.map((section, idx) => (
              <div key={section.titleKey} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 flex items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold">{idx + 1}</span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t(section.titleKey)}</h3>
                      <p className="text-xs text-gray-500 dark:text-slate-500">{t(section.descKey)}</p>
                      {section.bestFitKey && <p className="text-xs text-brand-600 dark:text-brand-400 mt-1 font-medium">{t('bestFit')}: {t(section.bestFitKey)}</p>}
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 divide-x divide-gray-100 dark:divide-slate-800">
                  {(['hooksniff', 'svix', 'hookdeck', 'hook0'] as const).map((name) => {
                    const data = section[name];
                    const isWinner = section.winner === name;
                    const labels: Record<string, React.ReactNode> = { hooksniff: <><Anchor size={12} strokeWidth={1.75} className="inline mr-1" /> HookSniff</>, svix: <><Inbox size={12} strokeWidth={1.75} className="inline mr-1" /> Svix</>, hookdeck: <><LinkIcon size={12} strokeWidth={1.75} className="inline mr-1" /> Hookdeck</>, hook0: <><Anchor size={12} strokeWidth={1.75} className="inline mr-1" /> Hook0</> };
                    return (
                      <div key={name} className={`p-4 ${isWinner ? 'bg-brand-50/30 dark:bg-brand-500/5' : ''}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-gray-500 dark:text-slate-500">{labels[name]}</span>
                          <Badge text={typeof data.badge === 'string' ? t(data.badge) : data.badge} variant={getBadgeVariant(section.winner, name)} />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-slate-400">{t(data.text)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* When to choose what */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">{t('whenChooseHooksniff').replace('...', '?')}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {chooseSections.map((section) => (
              <div key={section.when} className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">{section.when}</h3>
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-400">
                      <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">{t("faq")}</h2>
          <div className="space-y-3 max-w-3xl mx-auto">
            {faqKeys.map((item, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                <button
                  type="button"
                  aria-expanded={expandedFaq === i}
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span className="font-medium text-gray-900 dark:text-white pr-4">{t(item.q)}</span>
                  <svg className={`w-5 h-5 text-gray-500 dark:text-slate-500 shrink-0 transition-transform ${expandedFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {expandedFaq === i && (
                  <div className="px-6 pb-4"><p className="text-sm text-gray-600 dark:text-slate-400">{t(item.a)}</p></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Deep Dive Links */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">{t("deepDive")}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deepDiveLinks.map((link) => (
              <Link key={link.title} href={link.href} className="group p-5 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-500/40 transition-colors">
                <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mb-1">{link.title}</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">{link.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-8 bg-gray-900 dark:bg-slate-800 rounded-xl">
          <h2 className="text-2xl font-bold text-white mb-2">{t('ctaTitle')}</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-6">{t('ctaSubtitle')}</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/login" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">{t('ctaButton')}</Link>
            <Link href="/pricing" className="px-6 py-3 border border-gray-600 dark:border-slate-600 text-gray-300 dark:text-slate-300 rounded-lg text-sm font-medium hover:border-gray-400 dark:hover:border-slate-400 transition-colors">{t("viewPricing")}</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
