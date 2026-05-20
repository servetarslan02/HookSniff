import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { getTranslations } from 'next-intl/server';
import { Package, X, Check, AlertTriangle } from 'lucide-react';

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
              { featureKey: 'pricePro', hooksniff: '$24/mo', convoy: 'Free (self-hosted)', bestFor: 'convoy' },
              { featureKey: 'sdkCount', hooksniff: '11', convoy: '1 (Go)', bestFor: 'hooksniff' },
              { featureKey: 'fifoDelivery', hooksniff: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, convoy: <X size={14} strokeWidth={1.75} className="text-red-500" />, bestFor: 'hooksniff' },
              { featureKey: 'cloudEvents', hooksniff: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, convoy: <X size={14} strokeWidth={1.75} className="text-red-500" />, bestFor: 'hooksniff' },
              { featureKey: 'schemaRegistry', hooksniff: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, convoy: <X size={14} strokeWidth={1.75} className="text-red-500" />, bestFor: 'hooksniff' },
              { featureKey: 'selfHosted', hooksniff: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, convoy: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, bestFor: 'tie' },
              { featureKey: 'openSource', hooksniff: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, convoy: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, bestFor: 'tie' },
              { featureKey: 'i18n', hooksniff: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, convoy: <X size={14} strokeWidth={1.75} className="text-red-500" />, bestFor: 'hooksniff' },
            ].map((r) => (
              <tr key={r.featureKey} className="border-b border-gray-100 dark:border-slate-700/50 last:border-0">
                <td className="py-3 px-6 text-gray-700 dark:text-slate-300">{t(r.featureKey)}</td>
                <td className={`py-3 px-4 text-center font-medium ${r.bestFor === 'hooksniff' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'} bg-brand-50/20`}>{r.hooksniff}</td>
                <td className={`py-3 px-4 text-center ${r.bestFor === 'convoy' ? 'text-emerald-600 dark:text-emerald-400 font-medium' : r.bestFor === 'tie' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-slate-400'}`}>{r.convoy}</td>
              </tr>
            ))}</tbody>
          </table></div>
        </div>

        {/* When to choose each */}
        <div className="space-y-6 mb-12">
          <div className="p-6 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">🪝 {t('whyChooseHooksniff')}</h2>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-slate-400">
              <li className="flex items-start gap-2"><svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><strong>11 SDKs:</strong> Node, Python, Go, Rust, Ruby, Java, Kotlin, PHP, C#, Elixir, Swift. Convoy is Go-only.</li>
              <li className="flex items-start gap-2"><svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><strong>Managed cloud:</strong> Deploy in minutes. Convoy requires self-hosting.</li>
              <li className="flex items-start gap-2"><svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><strong>FIFO + CloudEvents:</strong> Ordered delivery and standard event format. Convoy has neither.</li>
            </ul>
          </div>

          <div className="p-6 bg-purple-50 dark:bg-purple-500/10 rounded-xl border border-purple-200 dark:border-purple-500/20">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2"><Package size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('whenToChooseConvoy')}</h2>
            <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">{t('whenToChooseConvoyDesc')}</p>
          </div>
        </div>

        <div className="p-6 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/20 mb-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2"><AlertTriangle size={14} strokeWidth={1.75} className="inline-block align-text-bottom mr-1 text-amber-500" /> Note on Convoy</h2>
          <p className="text-sm text-gray-600 dark:text-slate-400">Convoy&apos;s GitHub repository is no longer actively maintained. If you&apos;re currently using Convoy, consider migrating to an actively maintained alternative. HookSniff, Svix, and Hook0 are all good options depending on your needs.</p>
        </div>
        <div className="text-center"><Link href="/login" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">{t('tryFree')}</Link></div>
      </main>
    </div>
  );
}
