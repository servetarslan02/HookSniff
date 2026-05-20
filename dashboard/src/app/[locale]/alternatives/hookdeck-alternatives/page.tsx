import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { getTranslations } from 'next-intl/server';
import { Link as LinkIcon, X, Check } from 'lucide-react';

export const revalidate = 3600;

export const metadata = {
  title: 'Hookdeck Alternatives — Best Webhook Services Compared (2026) | HookSniff',
  description: 'Looking for Hookdeck alternatives? Compare HookSniff, Svix, Hook0, and Convoy. Open-source, self-hosted, and affordable options.',
};

export default async function HookdeckAlternativesPage() {
  const t = await getTranslations('alternatives');
  const tc = await getTranslations('compare');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <nav className="border-b border-gray-200/50 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="items-center gap-3 flex">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">🪝 HookSniff</Link>
            <span className="text-gray-500 dark:text-slate-500">/</span>
            <span className="text-gray-600 dark:text-slate-400">{tc("sdks")}</span>
            <span className="text-gray-500 dark:text-slate-500">/</span>
            <span className="text-gray-600 dark:text-slate-400">Hookdeck</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('hookdeckAlternativesTitle')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-3xl mx-auto">
            {t('hookdeckAlternativesIntro')}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-white">{t('service')}</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">{t('price')}</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">{t('openSourceCol')}</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">{t('selfHostedCol')}</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">{t('sdks')}</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">{t('soc2Col')}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Hookdeck', price: '$39/mo+', oss: <X size={14} strokeWidth={1.75} className="text-red-500" />, self: <X size={14} strokeWidth={1.75} className="text-red-500" />, sdks: '8', soc2: 'Type 2', hl: false },
                  { name: 'HookSniff', price: '$24/mo', oss: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, self: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, sdks: '11', soc2: t('ready'), hl: true },
                  { name: 'Svix', price: '$490/mo', oss: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, self: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, sdks: '6', soc2: 'Type 2', hl: false },
                  { name: 'Hook0', price: t('pricePro').includes('$') ? 'Free' : 'Ücretsiz', oss: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, self: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, sdks: '4', soc2: <X size={14} strokeWidth={1.75} className="text-red-500" />, hl: false },
                  { name: 'Convoy', price: t('pricePro').includes('$') ? 'Free' : 'Ücretsiz', oss: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, self: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, sdks: '1', soc2: <X size={14} strokeWidth={1.75} className="text-red-500" />, hl: false },
                ].map((row) => (
                  <tr key={row.name} className={`border-b border-gray-100 dark:border-slate-700/50 last:border-0 ${row.hl ? 'bg-brand-50/30 dark:bg-brand-500/5' : ''}`}>
                    <td className={`py-3 px-6 font-medium ${row.hl ? 'text-brand-600 dark:text-brand-400' : 'text-gray-900 dark:text-white'}`}>{row.name}</td>
                    <td className="py-3 px-4 text-center text-gray-600 dark:text-slate-400">{row.price}</td>
                    <td className="py-3 px-4 text-center text-gray-600 dark:text-slate-400">{row.oss}</td>
                    <td className="py-3 px-4 text-center text-gray-600 dark:text-slate-400">{row.self}</td>
                    <td className="py-3 px-4 text-center text-gray-600 dark:text-slate-400">{row.sdks}</td>
                    <td className="py-3 px-4 text-center text-gray-600 dark:text-slate-400">{row.soc2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6 mb-16">
          <div className="p-6 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">🪝 {t('whyChooseHooksniff')}</h2>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-slate-400">
              <li className="flex items-start gap-2"><svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><strong>Open source:</strong> HookSniff is MIT licensed. Hookdeck is closed-source.</li>
              <li className="flex items-start gap-2"><svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><strong>Self-hosted:</strong> You can deploy HookSniff on your own infrastructure. Hookdeck is cloud-only.</li>
              <li className="flex items-start gap-2"><svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><strong>Fixed pricing:</strong> $24/mo flat vs Hookdeck&apos;s usage-based billing.</li>
              <li className="flex items-start gap-2"><svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><strong>More SDKs:</strong> 11 SDKs vs Hookdeck&apos;s 8. FIFO delivery and CloudEvents support.</li>
            </ul>
          </div>

          <div className="p-6 bg-purple-50 dark:bg-purple-500/10 rounded-xl border border-purple-200 dark:border-purple-500/20">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2"><LinkIcon size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('whenToChooseHookdeck')}</h2>
            <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">{t('whenToChooseHookdeckDesc')}</p>
          </div>
        </div>

        <div className="text-center p-8 bg-gray-900 dark:bg-slate-800 rounded-xl">
          <h2 className="text-2xl font-bold text-white mb-2">{t('openSourceAlternative', { alternative: 'Hookdeck' })}</h2>
          <p className="text-gray-400 dark:text-slate-400 mb-6">{t('switchCta')}</p>
          <Link href="/login" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">{t('tryFree')}</Link>
        </div>
      </main>
    </div>
  );
}
