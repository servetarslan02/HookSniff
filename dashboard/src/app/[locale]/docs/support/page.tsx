import { Suspense } from 'react';
import { PrefetchLink as Link } from '@/components/PrefetchLink';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';


export const metadata: Metadata = {
  title: 'Support',
  description: 'Get help with HookSniff',
};



async function SupportPageContent(params: Promise<{ locale: string }>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('docsSupport');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('title')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        {t('subtitle')}
      </p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('selfHelp')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('selfHelpDesc')}
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><Link href="/docs/troubleshooting" className="text-brand-600 hover:text-brand-700">{t('troubleshootingLink')}</Link> — {t('troubleshootingDesc')}</li>
          <li><Link href="/docs/error-codes" className="text-brand-600 hover:text-brand-700">{t('errorCodesLink')}</Link> — {t('errorCodesDesc')}</li>
          <li><Link href="/docs/debug-failed-webhooks" className="text-brand-600 hover:text-brand-700">{t('debugLink')}</Link> — {t('debugDesc')}</li>
          <li><Link href="/docs/faq" className="text-brand-600 hover:text-brand-700">{t('faqLink')}</Link> — {t('faqDesc')}</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('githubIssues')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('githubDesc')}
        </p>
        <p className="text-gray-600 dark:text-slate-400">
          <a href="https://github.com/servetarslan02/HookSniff/issues" className="text-brand-600 hover:text-brand-700" target="_blank" rel="noopener noreferrer">{t('openIssue')}</a>
        </p>
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          {t('bugReport')}
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>{t('bug1')}</li>
          <li>{t('bug2')}</li>
          <li>{t('bug3')}</li>
          <li>{t('bug4')}</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('email')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('emailDesc')}
        </p>
        <p className="text-gray-600 dark:text-slate-400">
          <a href="mailto:servetarslan02@gmail.com" className="text-brand-600 hover:text-brand-700">servetarslan02@gmail.com</a>
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('securityReports')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('securityDesc')}
        </p>
        <p className="text-gray-600 dark:text-slate-400">
          <a href="mailto:security@hooksniff.com" className="text-brand-600 hover:text-brand-700">security@hooksniff.com</a>
        </p>
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          {t('securityNote')}
        </p>
      </section>
    </article>
  );
}

export default async function Page(params: Promise<{ locale: string }>) {
  return (
    <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-8 w-64 rounded bg-gray-200 dark:bg-gray-700" /><div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" /><div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" /><div className="h-64 w-full rounded bg-gray-200 dark:bg-gray-700" /></div>}>
      <SupportPageContent {...params} />
    </Suspense>
  );
}
