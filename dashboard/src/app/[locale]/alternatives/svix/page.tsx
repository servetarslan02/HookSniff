import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { getTranslations } from 'next-intl/server';

export const metadata = { title: 'HookSniff vs Svix — Why Choose HookSniff' };

const rows = [
  { feature: 'Price (Pro)', hooksniff: '$29/mo', svix: '$490/mo', winner: 'hooksniff' },
  { feature: 'Free tier', hooksniff: '10,000 events', svix: 'Unlimited*', winner: 'svix' },
  { feature: 'SDK count', hooksniff: '11', svix: '6', winner: 'hooksniff' },
  { feature: 'FIFO delivery', hooksniff: '✅', svix: '❌', winner: 'hooksniff' },
  { feature: 'CloudEvents', hooksniff: '✅', svix: '❌', winner: 'hooksniff' },
  { feature: 'Schema registry', hooksniff: '✅', svix: '❌', winner: 'hooksniff' },
  { feature: 'Delivery methods', hooksniff: 'HTTP/WS/gRPC/SQS', svix: 'HTTP only', winner: 'hooksniff' },
  { feature: 'Self-hosted', hooksniff: '✅', svix: '✅', winner: 'tie' },
  { feature: 'SOC 2', hooksniff: 'Ready', svix: 'Type 2', winner: 'svix' },
  { feature: 'Uptime SLA', hooksniff: '99.9%', svix: '99.99%', winner: 'svix' },
  { feature: 'Open source', hooksniff: '✅', svix: '✅', winner: 'tie' },
  { feature: '8-language i18n', hooksniff: '✅', svix: '❌', winner: 'hooksniff' },
];

export default async function SvixAlternativePage() {
  const t = await getTranslations('compare');
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <nav className="border-b border-gray-200/50 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="items-center gap-3 flex">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">🪝 HookSniff</Link>
            <span className="text-gray-400 dark:text-slate-500">/</span>
            <Link href="/alternatives/svix" className="text-gray-600 dark:text-slate-400">Alternatives</Link>
            <span className="text-gray-400 dark:text-slate-500">/</span>
            <span className="text-gray-600 dark:text-slate-400">Svix</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">HookSniff vs Svix</h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">Looking for a Svix alternative? HookSniff offers similar features at 10x lower cost, with more SDKs and unique features like FIFO delivery.</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden mb-12">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 dark:border-slate-700">
              <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-white">{t("feature")}</th>
              <th className="text-center py-3 px-4 font-semibold text-brand-600 dark:text-brand-400 bg-brand-50/30">🪝 HookSniff</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">{t("sdks")}</th>
            </tr></thead>
            <tbody>{rows.map((r) => (
              <tr key={r.feature} className="border-b border-gray-100 dark:border-slate-700/50 last:border-0">
                <td className="py-3 px-6 text-gray-700 dark:text-slate-300">{r.feature}</td>
                <td className={`py-3 px-4 text-center font-medium ${r.winner === 'hooksniff' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'} bg-brand-50/20`}>{r.hooksniff}</td>
                <td className={`py-3 px-4 text-center ${r.winner === 'svix' ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-gray-600 dark:text-slate-400'}`}>{r.svix}</td>
              </tr>
            ))}</tbody>
          </table></div>
        </div>
        <div className="p-6 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/20 mb-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">💰 Bottom line</h2>
          <p className="text-sm text-gray-600 dark:text-slate-400">HookSniff Pro at <strong>$29/mo</strong> vs Svix Professional at <strong>$490/mo</strong>. That&apos;s <strong>$5,532/year saved</strong> — with more features. If you don&apos;t need SOC 2 Type 2 or 99.99% SLA, HookSniff is the clear winner for startups and growing teams.</p>
        </div>
        <div className="text-center"><Link href="/login" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">Try HookSniff free →</Link></div>
      </main>
    </div>
  );
}
