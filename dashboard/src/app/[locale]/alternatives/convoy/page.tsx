import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export default async function ConvoyAlternativePage() {
  const t = await getTranslations('alternatives');
  const tc = await getTranslations('compare');
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <nav className="border-b border-gray-200/50 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="items-center gap-3 flex">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">🪝 HookSniff</Link>
            <span className="text-gray-500 dark:text-slate-500">/</span>
            <span className="text-gray-600 dark:text-slate-400">{tc("sdks")} / Convoy</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">HookSniff vs Convoy</h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">{t('convoyDesc')}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden mb-12">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 dark:border-slate-700">
              <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-white">{t("feature")}</th>
              <th className="text-center py-3 px-4 font-semibold text-brand-600 dark:text-brand-400 bg-brand-50/30">🪝 {t('hooksniff')}</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Convoy</th>
            </tr></thead>
            <tbody>{[
              { featureKey: 'sdkCount', hooksniff: '11', convoy: '3' },
              { featureKey: 'fifoDelivery', hooksniff: '✅', convoy: '❌' },
              { featureKey: 'cloudEvents', hooksniff: '✅', convoy: '❌' },
              { featureKey: 'schemaRegistry', hooksniff: '✅', convoy: '❌' },
              { featureKey: 'selfHosted', hooksniff: '✅', convoy: '✅' },
              { featureKey: 'openSource', hooksniff: '✅', convoy: '✅' },
              { featureKey: 'i18n', hooksniff: '✅', convoy: '❌' },
            ].map((r) => (
              <tr key={r.featureKey} className="border-b border-gray-100 dark:border-slate-700/50 last:border-0">
                <td className="py-3 px-6 text-gray-700 dark:text-slate-300">{t(r.featureKey)}</td>
                <td className="py-3 px-4 text-center font-medium text-emerald-600 dark:text-emerald-400 bg-brand-50/20">{r.hooksniff}</td>
                <td className="py-3 px-4 text-center text-gray-600 dark:text-slate-400">{r.convoy}</td>
              </tr>
            ))}</tbody>
          </table></div>
        </div>
        <div className="p-6 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/20 mb-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">⚠️ Convoy</h2>
          <p className="text-sm text-gray-600 dark:text-slate-400">{t('migratingFrom', { alternative: 'Convoy' })}</p>
        </div>
        <div className="text-center"><Link href="/login" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">{t('tryFree')}</Link></div>
      </main>
    </div>
  );
}
