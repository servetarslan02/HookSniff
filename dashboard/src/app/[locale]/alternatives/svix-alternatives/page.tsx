import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export const metadata = {
  title: 'Svix Alternatives — Best Webhook Services Compared (2026) | HookSniff',
  description: 'Looking for Svix alternatives? Compare HookSniff, Hookdeck, Hook0, and Convoy. Features, pricing, and honest pros/cons for each.',
};

const alternatives = [
  {
    name: 'HookSniff',
    emoji: '🪝',
    tagline: 'Best Svix alternative for startups',
    price: '$29/mo',
    svixPrice: '$490/mo',
    pros: ['10x cheaper than Svix', 'FIFO ordered delivery', 'CloudEvents v1.0', 'Schema registry', 'Open source + self-hosted', '8-language dashboard', 'MCP support', 'CLI tool', 'Smart routing (round-robin, latency, failover)', 'Real-time SSE streaming'],
    cons: ['Newer (less enterprise trust)', 'SOC 2 ready (not Type 2 yet)', '99.9% SLA (vs Svix 99.99%)', 'No HIPAA/PCI-DSS yet', 'No components platform (Diom)'],
    bestFor: 'Startups and growing teams who want enterprise features at startup prices.',
  },
  {
    name: 'Hookdeck',
    emoji: '🔗',
    tagline: 'Best for complex event routing',
    price: '$39/mo + usage',
    svixPrice: '$490/mo',
    pros: ['Advanced event routing', 'Filtering and transformation', 'SOC 2 Type 2', '99.999% SLA', 'CLI for local dev'],
    cons: ['Not open source', 'No self-hosted option', 'Usage-based pricing (unpredictable)', 'Fewer SDKs (8)'],
    bestFor: 'Teams with complex routing needs who don\'t need self-hosted.',
  },
  {
    name: 'Hook0',
    emoji: '🪝',
    tagline: 'Best for self-hosted in Europe',
    price: 'Free (self-hosted)',
    svixPrice: '$490/mo',
    pros: ['100% open source', 'European company (GDPR native)', 'No VC funding (bootstrapped)', 'Self-hosted or cloud'],
    cons: ['Fewer features', 'Smaller community', 'Only 4 SDKs', 'No SOC 2'],
    bestFor: 'European teams who prioritize data sovereignty and self-hosting.',
  },
  {
    name: 'Convoy',
    emoji: '📦',
    tagline: 'Best for Go-native teams',
    price: 'Free (self-hosted)',
    svixPrice: '$490/mo',
    pros: ['Written in Go', 'Open source', 'Good documentation', 'Active community'],
    cons: ['Go-only SDK', 'Smaller ecosystem', 'No managed cloud offering', 'Less mature portal'],
    bestFor: 'Go teams who want a lightweight, self-hosted webhook solution.',
  },
];

export default function SvixAlternativesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <nav className="border-b border-gray-200/50 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="items-center gap-3 flex">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">🪝 HookSniff</Link>
            <span className="text-gray-400 dark:text-slate-500">/</span>
            <Link href="/alternatives" className="text-gray-600 dark:text-slate-400">Alternatives</Link>
            <span className="text-gray-400 dark:text-slate-500">/</span>
            <span className="text-gray-600 dark:text-slate-400">Svix</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Svix Alternatives in 2026
          </h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-3xl mx-auto">
            Looking for a webhook service but Svix is too expensive? Here are the best alternatives compared honestly — features, pricing, and trade-offs.
          </p>
        </div>

        {/* Quick Comparison */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-white">Service</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Price</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">SDKs</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Open Source</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Self-Hosted</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">SOC 2</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">SLA</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Svix', price: '$490/mo', sdks: '11', oss: '✅', self: '✅', soc2: 'Type 2', sla: '99.99%', highlight: false },
                  { name: 'HookSniff', price: '$29/mo', sdks: '11', oss: '✅', self: '✅', soc2: 'Ready', sla: '99.9%', highlight: true },
                  { name: 'Hookdeck', price: '$39/mo+', sdks: '8', oss: '❌', self: '❌', soc2: 'Type 2', sla: '99.999%', highlight: false },
                  { name: 'Hook0', price: 'Free', sdks: '4', oss: '✅', self: '✅', soc2: '❌', sla: 'N/A', highlight: false },
                  { name: 'Convoy', price: 'Free', sdks: '1 (Go)', oss: '✅', self: '✅', soc2: '❌', sla: 'N/A', highlight: false },
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
                  <span className="text-2xl">{alt.emoji}</span>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{alt.name}</h2>
                  {alt.name === 'HookSniff' && <span className="px-2 py-0.5 bg-brand-600 text-white text-xs rounded-full">Recommended</span>}
                </div>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">{alt.tagline}</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">✅ Pros</p>
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
                    <p className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider mb-2">❌ Cons</p>
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
                <p className="mt-4 text-sm"><span className="font-medium text-gray-900 dark:text-white">Best for:</span> <span className="text-gray-600 dark:text-slate-400">{alt.bestFor}</span></p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center p-8 bg-gray-900 dark:bg-slate-800 rounded-xl">
          <h2 className="text-2xl font-bold text-white mb-2">Ready to switch from Svix?</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-6">Get the same features at 10x lower cost. Start free, scale when ready.</p>
          <Link href="/login" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">Try HookSniff free →</Link>
        </div>
      </main>
    </div>
  );
}
