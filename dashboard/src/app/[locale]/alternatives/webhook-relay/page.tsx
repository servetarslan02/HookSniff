import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { getTranslations } from 'next-intl/server';

export const metadata = { title: 'HookSniff vs Webhook Relay — Alternative' };

export default async function WebhookRelayAlternativePage() {
  const t = await getTranslations('compare');
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <nav className="border-b border-gray-200/50 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="items-center gap-3 flex">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">🪝 HookSniff</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 dark:text-slate-400">Alternatives / Webhook Relay</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">HookSniff vs Webhook Relay</h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">Webhook Relay focuses on webhook routing and transformation. HookSniff is a full webhook delivery platform.</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden mb-12">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 dark:border-slate-800">
              <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-white">{t("feature")}</th>
              <th className="text-center py-3 px-4 font-semibold text-brand-600 dark:text-brand-400 bg-brand-50/30">🪝 HookSniff</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Webhook Relay</th>
            </tr></thead>
            <tbody>{[
              { feature: 'SDK count', hooksniff: '11', relay: '0' },
              { feature: 'FIFO delivery', hooksniff: '✅', relay: '❌' },
              { feature: 'CloudEvents', hooksniff: '✅', relay: '❌' },
              { feature: 'Schema registry', hooksniff: '✅', relay: '❌' },
              { feature: 'Dashboard', hooksniff: '✅ (8 languages)', relay: 'Basic' },
              { feature: 'Managed hosting', hooksniff: '✅', relay: '✅' },
              { feature: 'Webhook routing', hooksniff: 'Basic', relay: 'Advanced' },
              { feature: 'Open source', hooksniff: '✅', relay: '❌' },
              { feature: 'Free tier', hooksniff: '10,000 events', relay: 'Limited' },
            ].map((r) => (
              <tr key={r.feature} className="border-b border-gray-100 dark:border-slate-800/50 last:border-0">
                <td className="py-3 px-6 text-gray-700 dark:text-slate-300">{r.feature}</td>
                <td className="py-3 px-4 text-center font-medium text-emerald-600 dark:text-emerald-400 bg-brand-50/20">{r.hooksniff}</td>
                <td className="py-3 px-4 text-center text-gray-600 dark:text-slate-400">{r.relay}</td>
              </tr>
            ))}</tbody>
          </table></div>
        </div>
        <div className="p-6 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/20 mb-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">💰 Bottom line</h2>
          <p className="text-sm text-gray-600 dark:text-slate-400">Webhook Relay is good for simple routing. HookSniff is a complete webhook delivery platform with SDKs, FIFO, CloudEvents, schema registry, and a full dashboard. If you need more than just routing, HookSniff is the better choice.</p>
        </div>
        <div className="text-center"><Link href="/login" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">Try HookSniff free →</Link></div>
      </main>
    </div>
  );
}
