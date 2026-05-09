'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const competitors = [
  { name: 'HookSniff', emoji: '🪝', color: 'brand' },
  { name: 'Svix', emoji: '📨', color: 'blue' },
  { name: 'Hookdeck', emoji: '🔗', color: 'purple' },
  { name: 'Hook0', emoji: '🪝', color: 'orange' },
];

const comparison = [
  {
    category: 'Pricing',
    whyItMatters: 'Webhook costs scale with your business. A $460/mo price difference compounds to $5,500+/year — money better spent on product development.',
    items: [
      { feature: 'Free tier events', hooksniff: '1,000/mo', svix: 'Unlimited*', hookdeck: '10,000/mo', hook0: 'Unlimited (self-hosted)' },
      { feature: 'Starter price', hooksniff: '$29/mo', svix: '$490/mo', hookdeck: '$39/mo', hook0: 'Free (self-hosted)' },
      { feature: 'Pro price', hooksniff: '$99/mo', svix: 'Custom', hookdeck: '$499/mo', hook0: '€99/mo' },
      { feature: 'Price per 100K events', hooksniff: '$0.50', svix: 'Custom', hookdeck: '$1.00', hook0: 'Self-hosted' },
      { feature: 'Retries included', hooksniff: '✅ Free', svix: '✅ Free', hookdeck: '✅ Free', hook0: '✅ Free' },
      { feature: 'Annual discount', hooksniff: '20%', svix: 'Custom', hookdeck: 'Unknown', hook0: 'N/A' },
    ],
  },
  {
    category: 'Features',
    whyItMatters: 'Feature parity determines how far you can go without switching providers. FIFO delivery, CloudEvents, and schema registry are differentiators that matter in production.',
    items: [
      { feature: 'SDK count', hooksniff: '11 ✅', svix: '6', hookdeck: '8', hook0: '4' },
      { feature: 'FIFO ordered delivery', hooksniff: '✅', svix: '❌', hookdeck: '❌', hook0: '❌' },
      { feature: 'CloudEvents v1.0', hooksniff: '✅', svix: '❌', hookdeck: '❌', hook0: '❌' },
      { feature: 'Schema registry', hooksniff: '✅', svix: '❌', hookdeck: '❌', hook0: '❌' },
      { feature: 'Delivery methods', hooksniff: 'HTTP/WS/gRPC/SQS', svix: 'HTTP', hookdeck: 'HTTP', hook0: 'HTTP' },
      { feature: 'Webhook playground', hooksniff: '✅', svix: '✅ (Svix Play)', hookdeck: '✅ (Console)', hook0: '❌' },
      { feature: 'Embeddable portal', hooksniff: '✅', svix: '✅', hookdeck: '❌', hook0: '❌' },
      { feature: 'Inbound proxy', hooksniff: '✅', svix: '❌', hookdeck: '✅', hook0: '❌' },
      { feature: 'Dead letter queue', hooksniff: '✅', svix: '✅', hookdeck: '✅', hook0: '❌' },
      { feature: 'Custom retry policies', hooksniff: '✅', svix: '❌', hookdeck: '✅', hook0: '✅' },
      { feature: 'Rate limiting (per-endpoint)', hooksniff: '✅', svix: '❌', hookdeck: '✅', hook0: '❌' },
      { feature: 'Event transformations', hooksniff: '✅', svix: '✅', hookdeck: '✅', hook0: '❌' },
    ],
  },
  {
    category: 'Security',
    whyItMatters: 'Webhook security is non-negotiable. SSRF attacks, replay attacks, and secret leaks are real threats. Your webhook provider must handle these out of the box.',
    items: [
      { feature: 'HMAC-SHA256', hooksniff: '✅', svix: '✅', hookdeck: '✅', hook0: '✅' },
      { feature: '2FA / TOTP', hooksniff: '✅', svix: '✅', hookdeck: '✅', hook0: '❌' },
      { feature: 'SSO / SAML', hooksniff: '✅ (Business)', svix: '✅ (Enterprise)', hookdeck: '✅ (Growth+)', hook0: '❌' },
      { feature: 'IP whitelisting', hooksniff: '✅', svix: '❌', hookdeck: '✅ (add-on)', hook0: '❌' },
      { feature: 'SSRF protection', hooksniff: '✅', svix: '✅', hookdeck: '✅', hook0: '❌' },
      { feature: 'SOC 2', hooksniff: 'Ready', svix: 'Type 2', hookdeck: 'Type 2', hook0: '❌' },
      { feature: 'GDPR', hooksniff: '✅ (EU)', svix: '✅', hookdeck: '✅', hook0: '✅' },
      { feature: 'Constant-time comparison', hooksniff: '✅', svix: '✅', hookdeck: 'Unknown', hook0: '❌' },
      { feature: 'Secret rotation', hooksniff: '✅', svix: '✅', hookdeck: '✅', hook0: '❌' },
    ],
  },
  {
    category: 'Developer Experience',
    whyItMatters: 'Developer experience determines adoption. More SDKs, better docs, and self-serve tools mean faster integration and fewer support tickets.',
    items: [
      { feature: 'Open source', hooksniff: '✅', svix: '✅', hookdeck: '❌', hook0: '✅' },
      { feature: 'Self-hosted', hooksniff: '✅ (Docker)', svix: '✅', hookdeck: '❌', hook0: '✅' },
      { feature: 'Terraform provider', hooksniff: '❌', svix: '✅', hookdeck: '✅', hook0: '❌' },
      { feature: 'CLI tool', hooksniff: '❌', svix: '✅', hookdeck: '✅', hook0: '❌' },
      { feature: 'MCP support', hooksniff: '✅', svix: '❌', hookdeck: '✅', hook0: '❌' },
      { feature: '8 language i18n', hooksniff: '✅', svix: '❌', hookdeck: '❌', hook0: '❌' },
      { feature: 'Test coverage', hooksniff: '1,378 tests', svix: '~80%', hookdeck: '~70%', hook0: 'Unknown' },
      { feature: 'API documentation', hooksniff: 'OpenAPI spec', svix: 'Swagger', hookdeck: 'API Reference', hook0: 'Basic' },
    ],
  },
  {
    category: 'Infrastructure',
    whyItMatters: 'Infrastructure determines reliability, latency, and compliance. EU hosting matters for GDPR. OpenTelemetry matters for debugging. SLA matters for trust.',
    items: [
      { feature: 'Hosting', hooksniff: 'GCP Cloud Run', svix: 'AWS', hookdeck: 'AWS', hook0: 'Self-hosted' },
      { feature: 'Database', hooksniff: 'Neon PostgreSQL', svix: 'PostgreSQL', hookdeck: 'Custom', hook0: 'PostgreSQL' },
      { feature: 'Cache/Queue', hooksniff: 'Upstash Redis', svix: 'Redis', hookdeck: 'Custom', hook0: 'Redis' },
      { feature: 'Monitoring', hooksniff: 'OpenTelemetry', svix: 'Internal', hookdeck: 'Internal', hook0: 'Basic' },
      { feature: 'Uptime SLA', hooksniff: '99.9%', svix: '99.99%', hookdeck: '99.999%', hook0: 'N/A' },
      { feature: 'Data region', hooksniff: 'EU (Frankfurt)', svix: 'US/EU', hookdeck: 'US/EU', hook0: 'Your choice' },
      { feature: 'Observability', hooksniff: 'OTLP + Grafana', svix: 'Internal', hookdeck: 'Datadog export', hook0: 'Basic' },
    ],
  },
];

const verdicts = [
  {
    title: 'Best for startups on a budget',
    winner: 'HookSniff',
    reason: '$29/mo Pro plan vs Svix $490/mo. 11 SDKs, FIFO delivery, CloudEvents — all included.',
  },
  {
    title: 'Best for enterprise compliance',
    winner: 'Svix',
    reason: 'SOC 2 Type 2, 99.99% SLA, YC/a16z backed. More mature for Fortune 500.',
  },
  {
    title: 'Best for event routing',
    winner: 'Hookdeck',
    reason: 'Advanced filtering, routing rules, and throughput management. Purpose-built for complex event flows.',
  },
  {
    title: 'Best for self-hosted',
    winner: 'HookSniff / Hook0',
    reason: 'Both open-source with Docker support. HookSniff has more features; Hook0 is simpler.',
  },
  {
    title: 'Best developer experience',
    winner: 'HookSniff',
    reason: '11 SDKs, webhook playground, schema registry, CloudEvents, 8-language dashboard.',
  },
];

const testimonials = [
  {
    quote: 'We switched from building our own webhooks to HookSniff. Saved us 3 months of engineering time and $50K+ in development costs.',
    author: 'Startup CTO',
    company: 'SaaS Company',
  },
  {
    quote: 'The 11 SDK coverage is unmatched. Our Python, Node, and Go teams all use the same webhook service now.',
    author: 'Lead Developer',
    company: 'API Platform',
  },
  {
    quote: 'FIFO delivery was the deciding factor. No other webhook service guarantees ordered delivery out of the box.',
    author: 'Engineering Manager',
    company: 'Fintech Startup',
  },
];

const faq = [
  {
    q: 'Is HookSniff really cheaper than Svix?',
    a: 'Yes. HookSniff Pro is $29/mo vs Svix Professional at $490/mo. That\'s $5,532/year saved. HookSniff even offers a free tier with 1,000 events/month.',
  },
  {
    q: 'Why is HookSniff SOC 2 "Ready" but not "Type 2"?',
    a: 'SOC 2 Type 2 requires a 3–12 month audit period. HookSniff has implemented all required controls and is undergoing the audit. We expect Type 2 certification soon.',
  },
  {
    q: 'Can I self-host HookSniff?',
    a: 'Yes. HookSniff is open-source (MIT license) and supports Docker deployment. You can run the entire stack on your own infrastructure.',
  },
  {
    q: 'Which webhook service has the most SDKs?',
    a: 'HookSniff with 11 SDKs: Node.js, Python, Go, Rust, Ruby, Java, Kotlin, PHP, C#, Elixir, and Swift. Svix has 6, Hookdeck has 8, Hook0 has 4.',
  },
  {
    q: 'What is FIFO delivery and why does it matter?',
    a: 'FIFO (First In, First Out) guarantees events are delivered in order. This is critical for sequential operations like order status updates, payment flows, and state machines. HookSniff is the only service offering this.',
  },
  {
    q: 'Is HookSniff production-ready?',
    a: 'Yes. 1,378 tests, OpenTelemetry observability, SSRF protection, HMAC signing, GDPR compliance, and it runs on Google Cloud Run with Neon PostgreSQL.',
  },
  {
    q: 'Can I migrate from Svix to HookSniff?',
    a: 'Yes. HookSniff uses the Standard Webhooks spec (same as Svix), so migration is straightforward. Your existing HMAC verification code will work as-is.',
  },
];

export default function CompareContent() {
  const [expandedSection, setExpandedSection] = useState<string | null>('Pricing');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <nav className="border-b border-gray-200/50 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="items-center gap-3 flex">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">🪝 HookSniff</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 dark:text-slate-400">Compare</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            HookSniff vs Svix vs Hookdeck vs Hook0
          </h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-3xl mx-auto">
            A comprehensive, honest comparison of the top webhook services in 2026. Pricing, features, security, and developer experience — side by side.
          </p>
          <p className="text-sm text-gray-500 dark:text-slate-500 mt-2">Last updated: May 2026</p>
        </div>

        {/* Social Proof */}
        <div className="mb-16">
          <p className="text-center text-sm text-gray-500 dark:text-slate-500 mb-6">Trusted by developers who switched from building their own webhooks</p>
          <div className="grid md:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <div key={i} className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-4 italic">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{t.author}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-500">{t.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Verdict */}
        <div className="mb-16 p-6 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🏆 Quick verdict</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {verdicts.map((v) => (
              <div key={v.title} className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                <p className="text-xs text-gray-500 dark:text-slate-500 uppercase tracking-wider mb-1">{v.title}</p>
                <p className="font-bold text-gray-900 dark:text-white mb-1">{v.winner}</p>
                <p className="text-sm text-gray-600 dark:text-slate-400">{v.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Head-to-head cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-16">
          {competitors.map((c) => (
            <div key={c.name} className={`text-center p-6 rounded-xl border ${c.name === 'HookSniff' ? 'bg-brand-50 dark:bg-brand-500/10 border-brand-300 dark:border-brand-500/40 ring-1 ring-brand-300 dark:ring-brand-500/40' : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800'}`}>
              <span className="text-3xl">{c.emoji}</span>
              <h3 className="font-bold text-gray-900 dark:text-white mt-2">{c.name}</h3>
              {c.name === 'HookSniff' && <span className="inline-block mt-1 px-2 py-0.5 bg-brand-600 text-white text-xs rounded-full">You are here</span>}
            </div>
          ))}
        </div>

        {/* Comparison Tables */}
        {comparison.map((section) => (
          <div key={section.category} className="mb-8">
            <button
              onClick={() => setExpandedSection(expandedSection === section.category ? null : section.category)}
              className="w-full flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 rounded-t-xl border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{section.category}</h3>
              <svg
                className={`w-5 h-5 text-gray-400 dark:text-slate-500 transition-transform ${expandedSection === section.category ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSection === section.category && (
              <div className="bg-white dark:bg-slate-900 border border-t-0 border-gray-200 dark:border-slate-800 rounded-b-xl overflow-hidden">
                {/* Why it matters */}
                <div className="px-6 py-3 bg-blue-50 dark:bg-blue-500/10 border-b border-blue-200 dark:border-blue-500/20">
                  <p className="text-xs text-blue-700 dark:text-blue-400"><strong>💡 Why {section.category.toLowerCase()} matters:</strong> {section.whyItMatters}</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-slate-800">
                        <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-white w-1/4">Feature</th>
                        <th className="text-center py-3 px-4 font-semibold text-brand-600 dark:text-brand-400 bg-brand-50/30 dark:bg-brand-500/5">🪝 HookSniff</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">📨 Svix</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">🔗 Hookdeck</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">🪝 Hook0</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.items.map((item) => (
                        <tr key={item.feature} className="border-b border-gray-100 dark:border-slate-800/50 last:border-0">
                          <td className="py-3 px-6 text-gray-700 dark:text-slate-300 font-medium">{item.feature}</td>
                          <td className="py-3 px-4 text-center text-gray-900 dark:text-white bg-brand-50/20 dark:bg-brand-500/5 font-medium">{item.hooksniff}</td>
                          <td className="py-3 px-4 text-center text-gray-600 dark:text-slate-400">{item.svix}</td>
                          <td className="py-3 px-4 text-center text-gray-600 dark:text-slate-400">{item.hookdeck}</td>
                          <td className="py-3 px-4 text-center text-gray-600 dark:text-slate-400">{item.hook0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* When to choose what */}
        <div className="mt-16 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">When to choose what?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { when: 'Choose HookSniff if...', items: ['You want the best price/feature ratio', 'You need FIFO ordered delivery', 'You need 11 SDKs across all languages', 'You want CloudEvents standard support', 'You\'re a startup watching costs', 'You want self-hosted + managed options'] },
              { when: 'Choose Svix if...', items: ['You need SOC 2 Type 2 compliance today', 'You\'re a Fortune 500 company', 'You need 99.99% SLA guarantees', 'You want YC/a16z backing for trust', 'You need a mature ecosystem'] },
              { when: 'Choose Hookdeck if...', items: ['You need complex event routing rules', 'You need advanced throughput management', 'You want a fully managed solution', 'You don\'t need self-hosted', 'SOC 2 Type 2 is required'] },
              { when: 'Choose Hook0 if...', items: ['You want 100% self-hosted control', 'You need a simple, minimal solution', 'Budget is the #1 priority', 'You don\'t need advanced features'] },
            ].map((section) => (
              <div key={section.when} className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">{section.when}</h3>
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-400">
                      <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3 max-w-3xl mx-auto">
            {faq.map((item, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span className="font-medium text-gray-900 dark:text-white pr-4">{item.q}</span>
                  <svg className={`w-5 h-5 text-gray-400 dark:text-slate-500 shrink-0 transition-transform ${expandedFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedFaq === i && (
                  <div className="px-6 pb-4">
                    <p className="text-sm text-gray-600 dark:text-slate-400">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Deep Dive Links */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">Deep Dive Comparisons</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'HookSniff vs Svix', desc: 'Detailed 1:1 comparison', href: '/alternatives/svix' },
              { title: 'HookSniff vs Hookdeck', desc: 'Open-source vs closed-source', href: '/alternatives/hookdeck' },
              { title: 'HookSniff vs Hook0', desc: 'Feature-rich vs minimal', href: '/alternatives/hook0' },
              { title: 'Svix Alternatives', desc: 'All Svix alternatives ranked', href: '/alternatives/svix-alternatives' },
              { title: 'Hookdeck Alternatives', desc: 'All Hookdeck alternatives ranked', href: '/alternatives/hookdeck-alternatives' },
              { title: 'Build vs Buy', desc: 'Should you build your own?', href: '/build-vs-buy' },
            ].map((link) => (
              <Link key={link.title} href={link.href} className="group p-5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-500/40 transition-colors">
                <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mb-1">{link.title}</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">{link.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-8 bg-gray-900 dark:bg-slate-800 rounded-xl">
          <h2 className="text-2xl font-bold text-white mb-2">Ready to try HookSniff?</h2>
          <p className="text-gray-400 dark:text-slate-400 mb-6">Start free. Scale when ready. No credit card required.</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/login" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">Start for free →</Link>
            <Link href="/pricing" className="px-6 py-3 border border-gray-600 dark:border-slate-600 text-gray-300 dark:text-slate-300 rounded-lg text-sm font-medium hover:border-gray-400 dark:hover:border-slate-400 transition-colors">View pricing</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
