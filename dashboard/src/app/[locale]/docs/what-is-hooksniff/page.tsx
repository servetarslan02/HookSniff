import Link from 'next/link';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Building2, Rocket, Ruler , Check, X } from '@/components/icons';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'What is HookSniff?',
  description: 'Understand what HookSniff is, the problem it solves, and how it works',
};

export default async function WhatIsHookSniffPage() {
  const t = await getTranslations('whatIsHookSniff');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('title')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        {t('subtitle')}
      </p>

      {/* The Problem */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('theProblem')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('theProblemDesc')}
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>{t('problemRetry')}</strong> — {t('problemRetryDesc')}</li>
          <li><strong>{t('problemQueue')}</strong> — {t('problemQueueDesc')}</li>
          <li><strong>{t('problemSignature')}</strong> — {t('problemSignatureDesc')}</li>
          <li><strong>{t('problemMonitoring')}</strong> — {t('problemMonitoringDesc')}</li>
          <li><strong>{t('problemRateLimit')}</strong> — {t('problemRateLimitDesc')}</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          {t('problemConclusion')}
        </p>
      </section>

      {/* Before and After */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('beforeAfter')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
          <div className="p-5 border border-red-200 dark:border-red-900/30 rounded-xl bg-red-50/50 dark:bg-red-900/10">
            <h3 className="text-base font-semibold text-red-800 dark:text-red-400 mb-3">{t('withoutHooksniff')}</h3>
            <ul className="space-y-2 text-sm text-red-700 dark:text-red-300">
              <li><X size={14} strokeWidth={1.75} className="inline-block align-text-bottom mr-1 text-red-500" /> {t('without1')}</li>
              <li><X size={14} strokeWidth={1.75} className="inline-block align-text-bottom mr-1 text-red-500" /> {t('without2')}</li>
              <li><X size={14} strokeWidth={1.75} className="inline-block align-text-bottom mr-1 text-red-500" /> {t('without3')}</li>
              <li><X size={14} strokeWidth={1.75} className="inline-block align-text-bottom mr-1 text-red-500" /> {t('without4')}</li>
              <li><X size={14} strokeWidth={1.75} className="inline-block align-text-bottom mr-1 text-red-500" /> {t('without5')}</li>
            </ul>
          </div>
          <div className="p-5 border border-green-200 dark:border-green-900/30 rounded-xl bg-green-50/50 dark:bg-green-900/10">
            <h3 className="text-base font-semibold text-green-800 dark:text-green-400 mb-3">{t('withHooksniff')}</h3>
            <ul className="space-y-2 text-sm text-green-700 dark:text-green-300">
              <li><Check size={14} strokeWidth={1.75} className="inline-block align-text-bottom mr-1 text-emerald-500" /> {t('with1')}</li>
              <li><Check size={14} strokeWidth={1.75} className="inline-block align-text-bottom mr-1 text-emerald-500" /> {t('with2')}</li>
              <li><Check size={14} strokeWidth={1.75} className="inline-block align-text-bottom mr-1 text-emerald-500" /> {t('with3')}</li>
              <li><Check size={14} strokeWidth={1.75} className="inline-block align-text-bottom mr-1 text-emerald-500" /> {t('with4')}</li>
              <li><Check size={14} strokeWidth={1.75} className="inline-block align-text-bottom mr-1 text-emerald-500" /> {t('with5')}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('howItWorks')}</h2>
        <ol className="space-y-3 text-gray-600 dark:text-slate-400">
          <li><strong>1.</strong> {t('step1')}</li>
          <li><strong>2.</strong> {t('step2')}</li>
          <li><strong>3.</strong> {t('step3')}</li>
          <li><strong>4.</strong> {t('step4')}</li>
          <li><strong>5.</strong> {t('step5')}</li>
          <li><strong>6.</strong> {t('step6')}</li>
          <li><strong>7.</strong> {t('step7')}</li>
        </ol>
      </section>

      {/* Core Concepts */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('coreConcepts')}</h2>
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('conceptEndpoint')}</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">{t('conceptEndpointDesc')}</p>
          </div>
          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('conceptWebhook')}</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">{t('conceptWebhookDesc')}</p>
          </div>
          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('conceptEventType')}</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">{t('conceptEventTypeDesc')}</p>
          </div>
          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('conceptRetryPolicy')}</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">{t('conceptRetryPolicyDesc')}</p>
          </div>
          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('conceptDlq')}</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">{t('conceptDlqDesc')}</p>
          </div>
        </div>
      </section>

      {/* Why HookSniff */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('whyHooksniff')}</h2>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>Rust</strong> — {t('why1')}</li>
          <li><strong>11 SDK</strong> — {t('why2')}</li>
          <li><strong>Standard Webhooks</strong> — {t('why3')}</li>
          <li><strong>{t('why4').split('—')[0].trim()}</strong> — {t('why4').split('—')[1]}</li>
          <li><strong>FIFO</strong> — {t('why5')}</li>
          <li><strong>{t('why6').split('—')[0].trim()}</strong> — {t('why6').split('—')[1]}</li>
          <li><strong>{t('why7').split('—')[0].trim()}</strong> — {t('why7').split('—')[1]}</li>
          <li><strong>{t('why8').split('—')[0].trim()}</strong> — {t('why8').split('—')[1]}</li>
          <li><strong>{t('why9').split('—')[0].trim()}</strong> — {t('why9').split('—')[1]}</li>
        </ul>
      </section>

      {/* Use Cases */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('useCases')}</h2>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>{t('ucSaas')}</strong> — {t('ucSaasDesc')}</li>
          <li><strong>{t('ucEcommerce')}</strong> — {t('ucEcommerceDesc')}</li>
          <li><strong>{t('ucCiCd')}</strong> — {t('ucCiCdDesc')}</li>
          <li><strong>{t('ucMicroservices')}</strong> — {t('ucMicroservicesDesc')}</li>
          <li><strong>{t('ucIntegrations')}</strong> — {t('ucIntegrationsDesc')}</li>
          <li><strong>{t('ucAudit')}</strong> — {t('ucAuditDesc')}</li>
        </ul>
      </section>

      {/* Next Steps */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('nextSteps')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
          <Link href="/docs/quickstart" className="block p-4 border border-gray-200 dark:border-slate-700 rounded-xl hover:border-brand-300 dark:hover:border-brand-600 hover:shadow-md transition">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1"><Rocket size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('nextQuickstart')}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">{t('nextQuickstartDesc')}</p>
          </Link>
          <Link href="/docs/concepts" className="block p-4 border border-gray-200 dark:border-slate-700 rounded-xl hover:border-brand-300 dark:hover:border-brand-600 hover:shadow-md transition">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1"><Ruler size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('nextConcepts')}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">{t('nextConceptsDesc')}</p>
          </Link>
          <Link href="/docs/best-practices" className="block p-4 border border-gray-200 dark:border-slate-700 rounded-xl hover:border-brand-300 dark:hover:border-brand-600 hover:shadow-md transition">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1"><Check size={14} strokeWidth={1.75} className="inline-block align-text-bottom mr-1 text-emerald-500" /> {t('nextBestPractices')}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">{t('nextBestPracticesDesc')}</p>
          </Link>
          <Link href="/docs/architecture" className="block p-4 border border-gray-200 dark:border-slate-700 rounded-xl hover:border-brand-300 dark:hover:border-brand-600 hover:shadow-md transition">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1"><Building2 size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('nextArchitecture')}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">{t('nextArchitectureDesc')}</p>
          </Link>
        </div>
      </section>
    </article>
  );
}
