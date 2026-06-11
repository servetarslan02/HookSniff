import { PrefetchLink as Link } from '@/components/PrefetchLink';
import PublicNavbar from '@/components/PublicNavbar';
import { X, Check } from '@/components/icons';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export const metadata = {
  title: 'Convoy Alternatives — Best Webhook Services Compared (2026) | HookSniff',
  description: 'Looking for Convoy alternatives? Convoy may be discontinued. Compare HookSniff, Svix, Hookdeck, and Hook0 as replacements.',
};

export default async function ConvoyAlternativesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('alternatives');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <PublicNavbar pageTitle={t('convoyAltTitle')} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">{t('convoyAltTitle')}</h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-3xl mx-auto">{t('convoyAltDesc')}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-200 dark:border-slate-700">
                <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-white">{t('service')}</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">{t('price')}</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">{t('sdks')}</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">{t('managedCloud')}</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">{t('openSourceCol')}</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">{t('portal')}</th>
              </tr></thead>
              <tbody>
                {[
                  { name: 'Convoy', price: 'Free', sdks: '1 (Go)', cloud: <X size={14} strokeWidth={1.75} className="text-red-500" />, oss: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, portal: t('ready') || 'Basic', hl: false },
                  { name: 'HookSniff', price: '$49/mo', sdks: '11', cloud: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, oss: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, portal: t('ready') || 'Full', hl: true },
                  { name: 'Svix', price: '$490/mo', sdks: '6', cloud: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, oss: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, portal: t('ready') || 'Full', hl: false },
                  { name: 'Hookdeck', price: '$39/mo+', sdks: '8', cloud: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, oss: <X size={14} strokeWidth={1.75} className="text-red-500" />, portal: t('ready') || 'Full', hl: false },
                  { name: 'Hook0', price: 'Free', sdks: '4', cloud: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, oss: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, portal: t('ready') || 'Basic', hl: false },
                ].map((row) => (
                  <tr key={row.name} className={`border-b border-gray-100 dark:border-slate-700/50 last:border-0 ${row.hl ? 'bg-brand-50/30 dark:bg-brand-500/5' : ''}`}>
                    <td className={`py-3 px-6 font-medium ${row.hl ? 'text-brand-600 dark:text-brand-400' : 'text-gray-900 dark:text-white'}`}>{row.name}</td>
                    <td className="py-3 px-4 text-center text-gray-600 dark:text-slate-400">{row.price}</td>
                    <td className="py-3 px-4 text-center text-gray-600 dark:text-slate-400">{row.sdks}</td>
                    <td className="py-3 px-4 text-center text-gray-600 dark:text-slate-400">{row.cloud}</td>
                    <td className="py-3 px-4 text-center text-gray-600 dark:text-slate-400">{row.oss}</td>
                    <td className="py-3 px-4 text-center text-gray-600 dark:text-slate-400">{row.portal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-6 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/20 mb-16">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">🪝 {t('whyChooseOverConvoy')}</h2>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-slate-400">
            <li className="flex items-start gap-2"><svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>{t('sdkCountDesc')}</li>
            <li className="flex items-start gap-2"><svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>{t('managedCloudDesc')}</li>
            <li className="flex items-start gap-2"><svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>{t('fullPortalDesc')}</li>
            <li className="flex items-start gap-2"><svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>{t('fifoCloudEventsDesc')}</li>
          </ul>
        </div>

        <div className="text-center p-8 bg-gray-900 dark:bg-slate-800 rounded-xl">
          <h2 className="text-2xl font-bold text-white mb-2">{t('lookingForAlt')}</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-6">{t('noGoRequired')}</p>
          <Link href="/login" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">{t('tryFree')}</Link>
        </div>
      </main>
    </div>
  );
}
