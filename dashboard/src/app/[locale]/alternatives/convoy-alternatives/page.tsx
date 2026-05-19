import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

// Revalidate every hour for ISR
export const revalidate = 3600;


export const metadata = {
  title: 'Convoy Alternatives — Best Webhook Services Compared (2026) | HookSniff',
  description: 'Looking for Convoy alternatives? Convoy may be discontinued. Compare HookSniff, Svix, Hookdeck, and Hook0 as replacements.',
};

export default function ConvoyAlternativesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <nav className="border-b border-gray-200/50 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="items-center gap-3 flex">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">🪝 HookSniff</Link>
            <span className="text-gray-500 dark:text-slate-500">/</span>
            <Link href="/alternatives" className="text-gray-600 dark:text-slate-400">Alternatives</Link>
            <span className="text-gray-500 dark:text-slate-500">/</span>
            <span className="text-gray-600 dark:text-slate-400">Convoy</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Convoy Alternatives in 2026</h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-3xl mx-auto">Convoy is a solid Go-based webhook service, but it&apos;s Go-only and lacks a managed cloud. Here are the best alternatives.</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-200 dark:border-slate-700">
                <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-white">Service</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Price</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">SDKs</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Managed Cloud</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Open Source</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Portal</th>
              </tr></thead>
              <tbody>
                {[
                  { name: 'Convoy', price: 'Free', sdks: '1 (Go)', cloud: <X size={14} strokeWidth={1.75} className="text-red-500" />, oss: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, portal: 'Basic', hl: false },
                  { name: 'HookSniff', price: '$24/mo', sdks: '11', cloud: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, oss: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, portal: 'Full', hl: true },
                  { name: 'Svix', price: '$490/mo', sdks: '6', cloud: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, oss: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, portal: 'Full', hl: false },
                  { name: 'Hookdeck', price: '$39/mo+', sdks: '8', cloud: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, oss: <X size={14} strokeWidth={1.75} className="text-red-500" />, portal: 'Full', hl: false },
                  { name: 'Hook0', price: 'Free', sdks: '4', cloud: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, oss: <Check size={14} strokeWidth={1.75} className="text-emerald-500" />, portal: 'Basic', hl: false },
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
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">🪝 Why Choose HookSniff Over Convoy?</h2>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-slate-400">
            <li className="flex items-start gap-2"><svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><strong>11 SDKs:</strong> Node, Python, Go, Rust, Ruby, Java, Kotlin, PHP, C#, Elixir, Swift. Convoy is Go-only.</li>
            <li className="flex items-start gap-2"><svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><strong>Managed cloud:</strong> Deploy in minutes on GCP Cloud Run. Convoy requires self-hosting.</li>
            <li className="flex items-start gap-2"><svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><strong>Full portal:</strong> Embeddable webhook portal for your customers. Convoy has a basic UI.</li>
            <li className="flex items-start gap-2"><svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><strong>FIFO + CloudEvents:</strong> Ordered delivery and standard event format. Convoy has neither.</li>
          </ul>
        </div>

        <div className="text-center p-8 bg-gray-900 dark:bg-slate-800 rounded-xl">
          <h2 className="text-2xl font-bold text-white mb-2">Looking for a Convoy alternative with more SDKs?</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-6">HookSniff works with every major language. No Go required.</p>
          <Link href="/login" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">Try HookSniff free →</Link>
        </div>
      </main>
    </div>
  );
}
