'use client';

import { PrefetchLink as Link } from '@/components/PrefetchLink';
import PublicNavbar from '@/components/PublicNavbar';
import { useTranslations } from 'next-intl';
import { Lightbulb, Shuffle, X, Check } from '@/components/icons';

export function WebhookRelayContent() {
  const t = useTranslations('alternatives');
  return (
    <div>
      <PublicNavbar pageTitle={t('webhookRelayTitle')} />
      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t('webhookRelayTitle')}</h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">{t('webhookRelayDesc')}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden mb-12">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 dark:border-slate-700">
              <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-white">{t("feature")}</th>
              <th className="text-center py-3 px-4 font-semibold text-brand-600 dark:text-brand-400 bg-brand-50/30">🪝 {t('hooksniff')}</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Webhook Relay</th>
            </tr></thead>
            <tbody>{[
              { featureKey: 'sdkCount', hooksniff: '11', relay: '0', bestFor: 'hooksniff' },
              { featureKey: 'fifoDelivery', hooksniff: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, relay: <X size={14} strokeWidth={1.75} className="text-red-500" />, bestFor: 'hooksniff' },
              { featureKey: 'cloudEvents', hooksniff: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, relay: <X size={14} strokeWidth={1.75} className="text-red-500" />, bestFor: 'hooksniff' },
              { featureKey: 'schemaRegistry', hooksniff: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, relay: <X size={14} strokeWidth={1.75} className="text-red-500" />, bestFor: 'hooksniff' },
              { featureKey: 'selfHosted', hooksniff: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, relay: <X size={14} strokeWidth={1.75} className="text-red-500" />, bestFor: 'hooksniff' },
              { featureKey: 'openSource', hooksniff: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, relay: <X size={14} strokeWidth={1.75} className="text-red-500" />, bestFor: 'hooksniff' },
              { featureKey: 'i18n', hooksniff: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, relay: <X size={14} strokeWidth={1.75} className="text-red-500" />, bestFor: 'hooksniff' },
            ].map((r) => (
              <tr key={r.featureKey} className="border-b border-gray-100 dark:border-slate-700/50 last:border-0">
                <td className="py-3 px-6 text-gray-700 dark:text-slate-300">{t(r.featureKey)}</td>
                <td className={`py-3 px-4 text-center font-medium ${r.bestFor === 'hooksniff' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'} bg-brand-50/20`}>{r.hooksniff}</td>
                <td className={`py-3 px-4 text-center ${r.bestFor === 'relay' ? 'text-emerald-600 dark:text-emerald-400 font-medium' : r.bestFor === 'tie' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-slate-400'}`}>{r.relay}</td>
              </tr>
            ))}</tbody>
          </table></div>
        </div>

        {/* When to choose each */}
        <div className="space-y-6 mb-12">
          <div className="p-6 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">🪝 {t('whyChooseHooksniff')}</h2>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-slate-400">
              <li className="flex items-start gap-2"><svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>{t('relayFullPlatformDesc')}</li>
              <li className="flex items-start gap-2"><svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>{t('hookdeckOssDesc')}</li>
              <li className="flex items-start gap-2"><svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>{t('relayProductionDesc')}</li>
            </ul>
          </div>

          <div className="p-6 bg-purple-50 dark:bg-purple-500/10 rounded-xl border border-purple-200 dark:border-purple-500/20">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2"><Shuffle size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('whenToChooseWebhookRelay')}</h2>
            <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">{t('whenToChooseWebhookRelayDesc')}</p>
          </div>
        </div>

        <div className="p-6 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-500/20 mb-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2"><Lightbulb size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('bottomLine')}</h2>
          <p className="text-sm text-gray-600 dark:text-slate-400">{t('relayBottomLineDesc')}</p>
        </div>
        <div className="text-center"><Link href="/login" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">{t('tryFree')}</Link></div>
      </main>
    </div>
  );

}
