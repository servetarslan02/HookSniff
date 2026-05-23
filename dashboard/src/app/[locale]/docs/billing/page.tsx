import CodeBlock from '@/components/CodeBlock';
import { CreditCard } from '@/components/icons';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Billing & Plans — HookSniff Docs',
  description: 'Understand HookSniff pricing plans, usage limits, and payment options.',
};

export default async function BillingPlansPage() {
  const t = await getTranslations('docsBilling');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
        <CreditCard size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('title')}
      </h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">{t('subtitle')}</p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('plans')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('plansDesc')}</p>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr><th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Plan</th><th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Price</th><th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Webhooks/day</th><th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Endpoints</th><th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Payload</th><th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Retention</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              <tr><td className="px-4 py-3 font-medium">Developer</td><td className="px-4 py-3">$0</td><td className="px-4 py-3">1,000</td><td className="px-4 py-3">Unlimited</td><td className="px-4 py-3">256 KB</td><td className="px-4 py-3">7 days</td></tr>
              <tr><td className="px-4 py-3 font-medium">Startup</td><td className="px-4 py-3">$29/mo</td><td className="px-4 py-3">30,000</td><td className="px-4 py-3">Unlimited</td><td className="px-4 py-3">1 MB</td><td className="px-4 py-3">14 days</td></tr>
              <tr><td className="px-4 py-3 font-medium">Pro</td><td className="px-4 py-3">$49/mo</td><td className="px-4 py-3">100,000</td><td className="px-4 py-3">Unlimited</td><td className="px-4 py-3">5 MB</td><td className="px-4 py-3">180 days</td></tr>
              <tr><td className="px-4 py-3 font-medium">Enterprise</td><td className="px-4 py-3">$149/mo</td><td className="px-4 py-3">Unlimited</td><td className="px-4 py-3">Unlimited</td><td className="px-4 py-3">10 MB</td><td className="px-4 py-3">365 days</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </article>
  );
}