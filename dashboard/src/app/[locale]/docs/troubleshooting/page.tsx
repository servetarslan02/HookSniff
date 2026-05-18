import Link from 'next/link';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Troubleshooting',
  description: 'Common issues and solutions for HookSniff webhook deliveries',
};

export default async function TroubleshootingPage() {
  const t = await getTranslations('docsTroubleshooting');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('title')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        {t('subtitle')}
      </p>

      {/* Webhooks not arriving */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('webhooksNotArriving')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4"><strong>{t('notArrivingSymptoms').split(':')[0]}:</strong>{t('notArrivingSymptoms').split(':').slice(1).join(':')}</p>
        <p className="text-gray-600 dark:text-slate-400 mb-4"><strong>{t('notArrivingCauses')}</strong></p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400 mb-4">
          <li><strong>{t('notArrivingCause1').split(' — ')[0]}</strong> — {t('notArrivingCause1').split(' — ')[1]}</li>
          <li><strong>{t('notArrivingCause2').split(' — ')[0]}</strong> — {t('notArrivingCause2').split(' — ')[1]}</li>
          <li><strong>{t('notArrivingCause3').split(' — ')[0]}</strong> — {t('notArrivingCause3').split(' — ')[1]}</li>
          <li><strong>{t('notArrivingCause4').split(' — ')[0]}</strong> — {t('notArrivingCause4').split(' — ')[1]}</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400"><strong>{t('notArrivingFix').split(':')[0]}:</strong>{t('notArrivingFix').split(':').slice(1).join(':')}</p>
      </section>

      {/* 401 Unauthorized */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('unauthorized')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4"><strong>{t('unauthorizedSymptoms').split(':')[0]}:</strong>{t('unauthorizedSymptoms').split(':').slice(1).join(':')}</p>
        <p className="text-gray-600 dark:text-slate-400 mb-4"><strong>{t('unauthorizedCauses')}</strong></p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400 mb-4">
          <li>{t('unauthorizedCause1')}</li>
          <li>{t('unauthorizedCause2')}</li>
          <li>{t('unauthorizedCause3')}</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400"><strong>{t('unauthorizedFix').split(':')[0]}:</strong>{t('unauthorizedFix').split(':').slice(1).join(':')}</p>
      </section>

      {/* Signature verification failing */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('signatureFailing')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4"><strong>{t('signatureSymptoms').split(':')[0]}:</strong>{t('signatureSymptoms').split(':').slice(1).join(':')}</p>
        <p className="text-gray-600 dark:text-slate-400 mb-4"><strong>{t('signatureCauses')}</strong></p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400 mb-4">
          <li><strong>{t('signatureCause1').split(' — ')[0]}</strong> — {t('signatureCause1').split(' — ')[1]}</li>
          <li><strong>{t('signatureCause2').split(' — ')[0]}</strong> — {t('signatureCause2').split(' — ')[1]}</li>
          <li><strong>{t('signatureCause3').split(' — ')[0]}</strong> — {t('signatureCause3').split(' — ')[1]}</li>
          <li><strong>{t('signatureCause4').split(' — ')[0]}</strong> — {t('signatureCause4').split(' — ')[1]}</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400"><strong>{t('signatureFix').split(':')[0]}:</strong> {t('signatureFix').split(':').slice(1).join(':')} <Link href="/docs/security" className="text-brand-600 hover:text-brand-700">Security</Link></p>
      </section>

      {/* Rate limited */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('rateLimited')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4"><strong>{t('rateLimitedSymptoms').split(':')[0]}:</strong>{t('rateLimitedSymptoms').split(':').slice(1).join(':')}</p>
        <p className="text-gray-600 dark:text-slate-400 mb-4"><strong>{t('rateLimitedCause')}</strong></p>
        <p className="text-gray-600 dark:text-slate-400"><strong>{t('rateLimitedFix').split(':')[0]}:</strong>{t('rateLimitedFix').split(':').slice(1).join(':')}</p>
      </section>

      {/* Deliveries stuck in pending */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('stuckPending')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4"><strong>{t('stuckSymptoms').split(':')[0]}:</strong>{t('stuckSymptoms').split(':').slice(1).join(':')}</p>
        <p className="text-gray-600 dark:text-slate-400 mb-4"><strong>{t('stuckCauses')}</strong></p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400 mb-4">
          <li><strong>{t('stuckCause1').split(' — ')[0]}</strong> — {t('stuckCause1').split(' — ')[1]}</li>
          <li><strong>{t('stuckCause2').split(' — ')[0]}</strong> — {t('stuckCause2').split(' — ')[1]}</li>
          <li><strong>{t('stuckCause3').split(' — ')[0]}</strong> — {t('stuckCause3').split(' — ')[1]}</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400"><strong>{t('stuckFix').split(':')[0]}:</strong>{t('stuckFix').split(':').slice(1).join(':')}</p>
      </section>

      {/* High failure rate */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('highFailure')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4"><strong>{t('highFailureSymptoms').split(':')[0]}:</strong>{t('highFailureSymptoms').split(':').slice(1).join(':')}</p>
        <p className="text-gray-600 dark:text-slate-400 mb-4"><strong>{t('highFailureCauses')}</strong></p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400 mb-4">
          <li><strong>{t('highFailureCause1').split(' — ')[0]}</strong> — {t('highFailureCause1').split(' — ')[1]}</li>
          <li><strong>{t('highFailureCause2').split(' — ')[0]}</strong> — {t('highFailureCause2').split(' — ')[1]}</li>
          <li><strong>{t('highFailureCause3').split(' — ')[0]}</strong> — {t('highFailureCause3').split(' — ')[1]}</li>
          <li><strong>{t('highFailureCause4').split(' — ')[0]}</strong> — {t('highFailureCause4').split(' — ')[1]}</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400"><strong>{t('highFailureFix').split(':')[0]}:</strong>{t('highFailureFix').split(':').slice(1).join(':')}</p>
      </section>

      {/* Webhook limit reached */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('limitReached')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4"><strong>{t('limitSymptoms').split(':')[0]}:</strong>{t('limitSymptoms').split(':').slice(1).join(':')}</p>
        <p className="text-gray-600 dark:text-slate-400 mb-4"><strong>{t('limitCause')}</strong></p>
        <p className="text-gray-600 dark:text-slate-400"><strong>{t('limitFix').split(':')[0]}:</strong>{t('limitFix').split(':').slice(1).join(':')}</p>
      </section>

      {/* Getting help */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('stillNeedHelp')}</h2>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><Link href="/docs/error-codes" className="text-brand-600 hover:text-brand-700">{t('helpErrorCodes')}</Link></li>
          <li><Link href="/docs/debug-failed-webhooks" className="text-brand-600 hover:text-brand-700">{t('helpDebugGuide')}</Link></li>
          <li><a href="https://github.com/servetarslan02/HookSniff" className="text-brand-600 hover:text-brand-700" target="_blank" rel="noopener noreferrer">{t('helpGithub')}</a></li>
        </ul>
      </section>
    </article>
  );
}
