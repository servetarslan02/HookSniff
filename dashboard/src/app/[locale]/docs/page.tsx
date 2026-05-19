import Link from 'next/link';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Documentation — HookSniff',
  description: 'Complete documentation for HookSniff webhook delivery platform. Guides, API reference, SDKs, and more.',
};

/* ───────────────────────────────────────────────
   Data
   ─────────────────────────────────────────────── */

const quickLinks = [
  {
    title: 'Quickstart',
    description: 'Send your first webhook in under 5 minutes.',
    href: '/docs/quickstart',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    gradient: 'from-emerald-500 to-teal-600',
    bgGlow: 'bg-emerald-500/10',
  },
  {
    title: 'SDKs & Libraries',
    description: 'Official SDKs for 11 programming languages.',
    href: '/docs/sdk-libraries',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
    gradient: 'from-[#4c6ef5] to-[#7c3aed]',
    bgGlow: 'bg-[#4c6ef5]/10',
  },
  {
    title: 'API Reference',
    description: 'Complete REST API documentation with examples.',
    href: '/docs/api-reference',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    gradient: 'from-orange-500 to-rose-500',
    bgGlow: 'bg-orange-500/10',
  },
];

const sections = [
  {
    title: 'Getting Started',
    description: 'Everything you need to start building with HookSniff.',
    cards: [
      { title: 'What is HookSniff?', desc: 'The problem, how it works, and why developers choose it.', href: '/docs/what-is-hooksniff' },
      { title: 'Core Concepts', desc: 'Endpoints, deliveries, retries, DLQ, and the event lifecycle.', href: '/docs/concepts' },
      { title: 'Configuration', desc: 'Environment variables, plan limits, and config options.', href: '/docs/configuration' },
    ],
  },
  {
    title: 'How-To Guides',
    description: 'Step-by-step guides for common webhook patterns.',
    cards: [
      { title: 'Webhook Verification', desc: 'Verify HMAC-SHA256 signatures. Standard Webhooks compliant.', href: '/docs/guides/webhook-verification' },
      { title: 'Error Handling', desc: 'Handle API errors, 429s, and delivery failures gracefully.', href: '/docs/guides/error-handling' },
      { title: 'Pagination', desc: 'Cursor-based pagination with auto-paginate helpers.', href: '/docs/guides/pagination' },
      { title: 'Migration from Svix', desc: 'Step-by-step guide to migrate from Svix to HookSniff.', href: '/docs/guides/migration-from-svix' },
      { title: 'Build Stripe-like Webhooks', desc: 'Production patterns for webhook integrations.', href: '/docs/build-stripe-like' },
      { title: 'Security', desc: 'HMAC-SHA256, SSRF protection, TLS, and 2FA.', href: '/docs/security' },
      { title: 'Retries & DLQ', desc: 'Exponential backoff, jitter, and replay failed webhooks.', href: '/docs/retries' },
      { title: 'Smart Routing', desc: 'Round-robin, latency-based, and failover routing.', href: '/docs/smart-routing' },
      { title: 'Inbound Webhooks', desc: 'Receive webhooks from Stripe, GitHub, and Shopify.', href: '/docs/inbound-webhooks' },
      { title: 'Multi-Tenant', desc: 'Build multi-tenant webhook systems with isolation.', href: '/docs/multi-tenant' },
      { title: 'Real-World Examples', desc: 'E-commerce, CI/CD, notifications, and more.', href: '/docs/guides/real-world-examples' },
      { title: 'Streaming & Rate Limits', desc: 'Real-time SSE events and per-endpoint rate limits.', href: '/docs/guides/streaming' },
    ],
  },
  {
    title: 'Reference',
    description: 'Technical specifications and API details.',
    cards: [
      { title: 'Error Codes', desc: 'API error codes and troubleshooting guide.', href: '/docs/error-codes' },
      { title: 'Rate Limiting', desc: 'Request limits, throttling, and plan quotas.', href: '/docs/rate-limiting' },
      { title: 'Event Types', desc: 'Define and manage webhook event types.', href: '/docs/event-types' },
      { title: 'Idempotency', desc: 'Prevent duplicate deliveries with idempotency keys.', href: '/docs/idempotency' },
      { title: 'CloudEvents', desc: 'Send webhooks in CloudEvents v1.0 format.', href: '/docs/cloudevents' },
      { title: 'Playground', desc: 'Test webhooks instantly in your browser.', href: '/docs/playground' },
    ],
  },
  {
    title: 'Explanation',
    description: 'Understand how HookSniff works under the hood.',
    cards: [
      { title: 'Event Processing', desc: 'How HookSniff processes events end-to-end.', href: '/docs/event-processing' },
      { title: 'Delivery Guarantees', desc: 'At-least-once delivery and idempotency semantics.', href: '/docs/delivery-guarantees' },
      { title: 'Webhook vs Polling', desc: 'When to use each approach and the trade-offs.', href: '/docs/webhook-vs-polling' },
      { title: 'Architecture', desc: 'System components, data flow, and infrastructure.', href: '/docs/architecture' },
    ],
  },
  {
    title: 'Operations',
    description: 'Deploy, monitor, and manage HookSniff.',
    cards: [
      { title: 'Dashboard', desc: 'Monitor deliveries, manage endpoints, and view analytics.', href: '/docs/dashboard' },
      { title: 'Self-Hosting', desc: 'Run HookSniff on your own infrastructure.', href: '/docs/self-hosting' },
      { title: 'Embeddable Portal', desc: 'Let customers manage their own webhooks.', href: '/docs/embed-portal' },
      { title: 'Troubleshooting', desc: 'Common issues and how to fix them.', href: '/docs/troubleshooting' },
    ],
  },
];

/* ───────────────────────────────────────────────
   Page
   ─────────────────────────────────────────────── */

export default function DocsPage() {
  return (
    <div className="space-y-16">
      {/* ─── Hero ─── */}
      <section className="relative">
        {/* Subtle glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#4c6ef5]/[0.07] dark:bg-[#4c6ef5]/[0.04] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-12 right-0 w-64 h-64 bg-[#7c3aed]/[0.05] dark:bg-[#7c3aed]/[0.03] rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
            Documentation
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Everything you need to integrate HookSniff into your application.
            Send webhooks with confidence — we handle delivery, retries, and observability.
          </p>

          {/* Search-like CTA */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/docs/quickstart"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#4c6ef5] to-[#7c3aed] rounded-xl shadow-lg shadow-[#4c6ef5]/20 hover:shadow-[#4c6ef5]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Get Started
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              href="/docs/api-reference"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.08] hover:border-gray-300 dark:hover:border-white/[0.12] transition-all duration-200"
            >
              API Reference
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Quick Links ─── */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative flex items-start gap-4 p-5 rounded-2xl border border-gray-200/60 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] hover:border-gray-300 dark:hover:border-white/[0.1] hover:shadow-lg dark:hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              {/* Hover glow */}
              <div className={`absolute -top-8 -right-8 w-32 h-32 ${link.bgGlow} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${link.gradient} text-white shadow-lg shrink-0`}>
                {link.icon}
              </div>
              <div className="relative">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#4c6ef5] dark:group-hover:text-[#748ffc] transition-colors">
                  {link.title}
                </h3>
                <p className="mt-1 text-[13px] text-gray-500 dark:text-slate-500 leading-relaxed">
                  {link.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── API Info Bar ─── */}
      <section className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 rounded-xl border border-gray-200/60 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.02] p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-500">API Base URL</span>
          </div>
          <code className="text-sm font-mono text-gray-800 dark:text-slate-300 break-all">
            https://hooksniff-api-1046140057667.europe-west1.run.app/v1
          </code>
        </div>
        <div className="flex-1 rounded-xl border border-gray-200/60 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.02] p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-[#4c6ef5]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-500">Authentication</span>
          </div>
          <code className="text-sm font-mono text-gray-800 dark:text-slate-300">
            Authorization: Bearer hr_live_...
          </code>
        </div>
      </section>

      {/* ─── Content Sections ─── */}
      {sections.map((section) => (
        <section key={section.title}>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              {section.title}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-500">
              {section.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {section.cards.map((card, cardIdx) => (
              <Link
                key={card.href}
                href={card.href}
                className="group relative flex items-start gap-3 p-4 rounded-xl border border-gray-100 dark:border-white/[0.04] bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-white/[0.02] hover:border-gray-200 dark:hover:border-white/[0.08] transition-all duration-200"
                style={{ animationDelay: `${cardIdx * 40}ms` }}
              >
                {/* Arrow */}
                <svg
                  className="w-4 h-4 mt-0.5 text-gray-300 dark:text-slate-700 group-hover:text-[#4c6ef5] dark:group-hover:text-[#748ffc] group-hover:translate-x-0.5 transition-all duration-200 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>

                <div>
                  <h3 className="text-[14px] font-semibold text-gray-800 dark:text-slate-200 group-hover:text-[#4c6ef5] dark:group-hover:text-[#748ffc] transition-colors duration-200">
                    {card.title}
                  </h3>
                  <p className="mt-0.5 text-[13px] text-gray-500 dark:text-slate-500 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {/* ─── Rate Limits Table ─── */}
      <section>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            Rate Limits
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-500">
            Request limits and quotas by plan.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200/60 dark:border-white/[0.06] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-white/[0.02]">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-500">Plan</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-500">Requests/min</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-500">Events/day</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                {[
                  { plan: 'Developer', price: '$0', rpm: '100', events: '100', highlight: false },
                  { plan: 'Startup', price: '$24/mo', rpm: '500', events: '30,000', highlight: false },
                  { plan: 'Pro', price: '$49/mo', rpm: '1,000', events: '100,000', highlight: true },
                  { plan: 'Enterprise', price: '$149/mo', rpm: 'Custom', events: 'Unlimited', highlight: false },
                ].map((row) => (
                  <tr
                    key={row.plan}
                    className={clsx(
                      'transition-colors',
                      row.highlight
                        ? 'bg-[#4c6ef5]/[0.03] dark:bg-[#4c6ef5]/[0.05]'
                        : 'hover:bg-gray-50 dark:hover:bg-white/[0.02]'
                    )}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">{row.plan}</span>
                        <span className="text-xs text-gray-400 dark:text-slate-600">{row.price}</span>
                        {row.highlight && (
                          <span className="ml-1 px-1.5 py-0.5 text-[10px] font-semibold bg-[#4c6ef5]/10 text-[#4c6ef5] dark:text-[#748ffc] rounded-md">
                            Popular
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-gray-700 dark:text-slate-300">{row.rpm}</td>
                    <td className="px-5 py-4 font-mono text-gray-700 dark:text-slate-300">{row.events}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA ─── */}
      <section className="relative overflow-hidden rounded-2xl border border-gray-200/60 dark:border-white/[0.06] bg-gradient-to-br from-gray-50 to-white dark:from-white/[0.02] dark:to-transparent p-8 sm:p-10">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#4c6ef5]/[0.06] rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Ready to build?
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-slate-400 max-w-lg">
            Pick your language, install the SDK, and send your first webhook in minutes.
            HookSniff handles the rest — delivery, retries, signatures, and observability.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/docs/quickstart"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#4c6ef5] to-[#7c3aed] rounded-xl shadow-lg shadow-[#4c6ef5]/20 hover:shadow-[#4c6ef5]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Start Building
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <a
              href="https://github.com/servetarslan02/HookSniff"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.08] transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              View on GitHub
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── Helper (inline to avoid import issues with server component) ─── */
function clsx(...args: (string | boolean | undefined | null)[]) {
  return args.filter(Boolean).join(' ');
}
