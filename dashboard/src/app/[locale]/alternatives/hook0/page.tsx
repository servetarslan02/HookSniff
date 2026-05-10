import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export const metadata = { title: 'HookSniff vs Hook0 — Why Choose HookSniff' };

export default function Hook0AlternativePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <nav className="border-b border-gray-200/50 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="items-center gap-3 flex">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">🪝 HookSniff</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 dark:text-slate-400">Alternatives / Hook0</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">HookSniff vs Hook0</h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">Both are open-source webhook services. Here&apos;s how they compare.</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden mb-12">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 dark:border-slate-800">
              <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-white">{t("compare.feature")}</th>
              <th className="text-center py-3 px-4 font-semibold text-brand-600 dark:text-brand-400 bg-brand-50/30">🪝 HookSniff</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Hook0</th>
            </tr></thead>
            <tbody>{[
              { feature: 'SDK count', hooksniff: '11', hook0: '4' },
              { feature: 'FIFO delivery', hooksniff: '✅', hook0: '❌' },
              { feature: 'CloudEvents', hooksniff: '✅', hook0: '❌' },
              { feature: 'Schema registry', hooksniff: '✅', hook0: '❌' },
              { feature: 'Managed hosting', hooksniff: '✅ (GCP)', hook0: '❌ (self-hosted only)' },
              { feature: 'Dashboard i18n', hooksniff: '8 languages', hook0: 'English only' },
              { feature: 'Open source', hooksniff: '✅', hook0: '✅' },
              { feature: 'Self-hosted', hooksniff: '✅', hook0: '✅' },
              { feature: 'Community', hooksniff: 'Growing', hook0: 'Small' },
            ].map((r) => (
              <tr key={r.feature} className="border-b border-gray-100 dark:border-slate-800/50 last:border-0">
                <td className="py-3 px-6 text-gray-700 dark:text-slate-300">{r.feature}</td>
                <td className="py-3 px-4 text-center font-medium text-emerald-600 dark:text-emerald-400 bg-brand-50/20">{r.hooksniff}</td>
                <td className="py-3 px-4 text-center text-gray-600 dark:text-slate-400">{r.hook0}</td>
              </tr>
            ))}</tbody>
          </table></div>
        </div>
        <div className="p-6 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/20 mb-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">💰 Bottom line</h2>
          <p className="text-sm text-gray-600 dark:text-slate-400">Hook0 is a solid open-source option if you want 100% self-hosted control. HookSniff offers more features (11 SDKs, FIFO, CloudEvents, schema registry) and managed hosting if you don&apos;t want to manage infrastructure.</p>
        </div>
        <div className="text-center"><Link href="/login" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">Try HookSniff free →</Link></div>
      </main>
    </div>
  );
}
