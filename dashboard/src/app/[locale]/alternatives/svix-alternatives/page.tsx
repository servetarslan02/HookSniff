import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { getTranslations } from 'next-intl/server';
import { Building2, Link2, Package, Check, X } from '@/components/icons';

export const revalidate = 3600;

export const metadata = {
  title: 'Svix Alternatives — Best Webhook Services Compared (2026) | HookSniff',
  description: 'Looking for Svix alternatives? Compare HookSniff, Hookdeck, Hook0, and Convoy. Features, pricing, and honest pros/cons for each.',
};

// pros/cons keys are in alternatives translations (hsPro1-6, svixPro1-6, etc.)
function getAlternatives(t: (key: string) => string) {
  return [
    {
      name: 'HookSniff',
      emoji: '🪝',
      taglineKey: 'bestForStartups',
      price: '$24/mo',
      pros: [t('hsPro1'), t('hsPro2'), t('hsPro3'), t('hsPro4'), t('hsPro5'), t('hsPro6')],
      cons: [t('hsCon1'), t('hsCon2'), t('hsCon3'), t('hsCon4')],
      bestForKey: 'bestForStartupsDesc',
    },
    {
      name: 'Svix',
      icon: <Building2 size={24} strokeWidth={1.75} />,
      taglineKey: 'bestForEnterprise',
      price: '$490/mo',
      pros: [t('svixPro1'), t('svixPro2'), t('svixPro3'), t('svixPro4'), t('svixPro5'), t('svixPro6')],
      cons: [t('svixCon1'), t('svixCon2'), t('svixCon3'), t('svixCon4'), t('svixCon5')],
      bestForKey: 'bestForEnterpriseDesc',
    },
    {
      name: 'Hookdeck',
      icon: <Link2 size={24} strokeWidth={1.75} />,
      taglineKey: 'bestForRouting',
      price: '$39/mo + usage',
      pros: [t('hdPro1'), t('hdPro2'), t('hdPro3'), t('hdPro4'), t('hdPro5')],
      cons: [t('hdCon1'), t('hdCon2'), t('hdCon3'), t('hdCon4')],
      bestForKey: 'bestForRoutingDesc',
    },
    {
      name: 'Hook0',
      emoji: '🪝',
      taglineKey: 'bestForEurope',
      price: 'Free (self-hosted)',
      pros: [t('h0Pro1'), t('h0Pro2'), t('h0Pro3'), t('h0Pro4')],
      cons: [t('h0Con1'), t('h0Con2'), t('h0Con3'), t('h0Con4')],
      bestForKey: 'bestForEuropeDesc',
    },
    {
      name: 'Convoy',
      icon: <Package size={24} strokeWidth={1.75} />,
      taglineKey: 'bestForGo',
      price: 'Free (self-hosted)',
      pros: [t('cvPro1'), t('cvPro2'), t('cvPro3')],
      cons: [t('cvCon1'), t('cvCon2'), t('cvCon3'), t('cvCon4')],
      bestForKey: 'bestForGoDesc',
    },
  ];
}

export default async function SvixAlternativesPage() {
  const t = await getTranslations('alternatives');
  const tc = await getTranslations('compare');
  const alternatives = getAlternatives(t);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <nav className="border-b border-gray-200/50 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="items-center gap-3 flex">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">🪝 HookSniff</Link>
            <span className="text-gray-500 dark:text-slate-500">/</span>
            <span className="text-gray-600 dark:text-slate-400">{tc("sdks")}</span>
            <span className="text-gray-500 dark:text-slate-500">/</span>
            <span className="text-gray-600 dark:text-slate-400">Svix</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('svixAlternativesTitle')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-3xl mx-auto">
            {t('svixAlternativesIntro')}
          </p>
        </div>

        {/* Quick Comparison */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-white">{t('service')}</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">{t('price')}</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">{t('sdks')}</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">{t('openSourceCol')}</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">{t('selfHostedCol')}</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">{t('soc2Col')}</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">{t('slaCol')}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Svix', price: '$490/mo', sdks: '6', oss: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, self: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, soc2: 'Type 2', sla: '99.99%', highlight: false },
                  { name: 'HookSniff', price: '$24/mo', sdks: '11', oss: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, self: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, soc2: t('ready'), sla: '99.9%', highlight: true },
                  { name: 'Hookdeck', price: '$39/mo+', sdks: '8', oss: <X size={14} strokeWidth={1.75} className="text-red-500" />, self: <X size={14} strokeWidth={1.75} className="text-red-500" />, soc2: 'Type 2', sla: '99.999%', highlight: false },
                  { name: 'Hook0', price: t('pricePro').includes('$') ? 'Free' : 'Ücretsiz', sdks: '4', oss: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, self: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, soc2: <X size={14} strokeWidth={1.75} className="text-red-500" />, sla: 'N/A', highlight: false },
                  { name: 'Convoy', price: t('pricePro').includes('$') ? 'Free' : 'Ücretsiz', sdks: '1 (Go)', oss: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, self: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, soc2: <X size={14} strokeWidth={1.75} className="text-red-500" />, sla: 'N/A', highlight: false },
                ].map((row) => (
                  <tr key={row.name} className={`border-b border-gray-100 dark:border-slate-700/50 last:border-0 ${row.highlight ? 'bg-brand-50/30 dark:bg-brand-500/5' : ''}`}>
                    <td className={`py-3 px-6 font-medium ${row.highlight ? 'text-brand-600 dark:text-brand-400' : 'text-gray-900 dark:text-white'}`}>{row.name}</td>
                    <td className="py-3 px-4 text-center text-gray-600 dark:text-slate-400">{row.price}</td>
                    <td className="py-3 px-4 text-center text-gray-600 dark:text-slate-400">{row.sdks}</td>
                    <td className="py-3 px-4 text-center text-gray-600 dark:text-slate-400">{row.oss}</td>
                    <td className="py-3 px-4 text-center text-gray-600 dark:text-slate-400">{row.self}</td>
                    <td className="py-3 px-4 text-center text-gray-600 dark:text-slate-400">{row.soc2}</td>
                    <td className="py-3 px-4 text-center text-gray-600 dark:text-slate-400">{row.sla}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Cards */}
        <div className="space-y-8 mb-16">
          {alternatives.map((alt) => (
            <div key={alt.name} className={`rounded-xl border overflow-hidden ${alt.name === 'HookSniff' ? 'border-brand-300 dark:border-brand-500/40 ring-1 ring-brand-300 dark:ring-brand-500/40' : 'border-gray-200 dark:border-slate-700'}`}>
              <div className={`p-6 ${alt.name === 'HookSniff' ? 'bg-brand-50 dark:bg-brand-500/10' : 'bg-white dark:bg-slate-800'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{alt.icon}</span>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{alt.name}</h2>
                  {alt.name === 'HookSniff' && <span className="px-2 py-0.5 bg-brand-600 text-white text-xs rounded-full">{t('recommended')}</span>}
                </div>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">{alt.price}</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2"><Check size={14} strokeWidth={1.75} className="inline-block align-text-bottom mr-1 text-emerald-500" /> {t('pros')}</p>
                    <ul className="space-y-1">
                      {alt.pros.map((pro) => (
                        <li key={pro} className="text-sm text-gray-600 dark:text-slate-400 flex items-start gap-2">
                          <svg className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider mb-2"><X size={14} strokeWidth={1.75} className="inline-block align-text-bottom mr-1 text-red-500" /> {t('cons')}</p>
                    <ul className="space-y-1">
                      {alt.cons.map((con) => (
                        <li key={con} className="text-sm text-gray-600 dark:text-slate-400 flex items-start gap-2">
                          <svg className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center p-8 bg-gray-900 dark:bg-slate-800 rounded-xl">
          <h2 className="text-2xl font-bold text-white mb-2">{t('readyToSwitch', { competitor: 'Svix' })}</h2>
          <p className="text-gray-400 dark:text-slate-400 mb-6">{t('switchCta')}</p>
          <Link href="/login" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">{t('tryFree')}</Link>
        </div>
      </main>
    </div>
  );
}
