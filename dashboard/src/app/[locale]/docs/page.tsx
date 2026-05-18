import Link from 'next/link';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Documentation',
  description: 'Complete documentation for HookSniff webhook delivery service',
};

const sections = [
  {
    title: 'Getting Started',
    cards: [
      { title: '🚀 Quickstart', desc: 'Send your first webhook in under 5 minutes.', href: '/docs/quickstart' },
      { title: '🪝 What is HookSniff?', desc: 'The problem, how it works, and why to use it.', href: '/docs/what-is-hooksniff' },
      { title: '📐 Core Concepts', desc: 'Endpoints, deliveries, retries, DLQ, and more.', href: '/docs/concepts' },
      { title: '📦 SDKs', desc: 'Official SDKs for 11 languages.', href: '/docs/sdk-libraries' },
    ],
  },
  {
    title: 'How-To Guides',
    cards: [
      { title: '✅ Best Practices', desc: 'Production patterns for webhook integrations.', href: '/docs/best-practices' },
      { title: '🔒 Security', desc: 'HMAC-SHA256 verification, SSRF protection, TLS, 2FA.', href: '/docs/security' },
      { title: '🔄 Retries & DLQ', desc: 'Exponential backoff, replay failed webhooks.', href: '/docs/retries' },
      { title: '🔍 Debug Failed Webhooks', desc: 'How to investigate delivery failures.', href: '/docs/debug-failed-webhooks' },
      { title: '📊 Monitor Performance', desc: 'Metrics, alerts, and Grafana integration.', href: '/docs/monitor-performance' },
      { title: '🔌 Integrations', desc: 'GitHub, Shopify, and generic webhook guides.', href: '/docs/integrations' },
      { title: '📡 Inbound Webhooks', desc: 'Receive webhooks from Stripe, GitHub, Shopify.', href: '/docs/inbound-webhooks' },
      { title: '🔀 Smart Routing', desc: 'Round-robin, latency-based, failover routing.', href: '/docs/smart-routing' },
      { title: '🔄 Payload Transforms', desc: 'Reshape payloads before delivery.', href: '/docs/transforms' },
      { title: '📋 Templates', desc: 'Pre-built webhook configurations.', href: '/docs/templates' },
      { title: '🏢 Multi-Tenant', desc: 'Build multi-tenant webhook systems.', href: '/docs/multi-tenant' },
      { title: '🏗️ Build Stripe-like Webhooks', desc: 'Step-by-step guide to production webhooks.', href: '/docs/build-stripe-like' },
    ],
  },
  {
    title: 'Reference',
    cards: [
      { title: '📡 API Reference', desc: 'Complete REST API documentation.', href: '/docs/api-reference' },
      { title: '🐛 Error Codes', desc: 'API error codes and troubleshooting.', href: '/docs/error-codes' },
      { title: '⚡ Rate Limiting', desc: 'Request limits, throttling, and plan quotas.', href: '/docs/rate-limiting' },
      { title: '⚙️ Configuration', desc: 'All environment variables and config options.', href: '/docs/configuration' },
      { title: '📋 Event Types', desc: 'Define and manage webhook event types.', href: '/docs/event-types' },
      { title: '🔑 Idempotency', desc: 'Prevent duplicate deliveries.', href: '/docs/idempotency' },
      { title: '☁️ CloudEvents', desc: 'Send webhooks in CloudEvents v1.0 format.', href: '/docs/cloudevents' },
      { title: '🎮 Playground', desc: 'Test webhooks instantly.', href: '/docs/playground' },
      { title: '📝 Changelog', desc: 'Version history and release notes.', href: '/docs/changelog' },
    ],
  },
  {
    title: 'Explanation',
    cards: [
      { title: '📡 Event Processing', desc: 'How HookSniff processes events end-to-end.', href: '/docs/event-processing' },
      { title: '✅ Delivery Guarantees', desc: 'At-least-once delivery and idempotency.', href: '/docs/delivery-guarantees' },
      { title: '🔄 Webhook vs Polling', desc: 'When to use each approach.', href: '/docs/webhook-vs-polling' },
      { title: '🛡️ Error Handling', desc: 'Handle webhook errors gracefully.', href: '/docs/error-handling' },
      { title: '🏗️ Architecture', desc: 'System components and data flow.', href: '/docs/architecture' },
    ],
  },
  {
    title: 'Operations',
    cards: [
      { title: '🖥️ Dashboard', desc: 'Monitor deliveries, manage endpoints.', href: '/docs/dashboard' },
      { title: '🐳 Self-Hosting', desc: 'Run HookSniff on your own infrastructure.', href: '/docs/self-hosting' },
      { title: '🪟 Embeddable Portal', desc: 'Let customers manage their own webhooks.', href: '/docs/embed-portal' },
      { title: '🔧 Troubleshooting', desc: 'Common issues and how to fix them.', href: '/docs/troubleshooting' },
      { title: '💬 Support', desc: 'Get help from the HookSniff team.', href: '/docs/support' },
    ],
  },
];

export default function DocsPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Documentation</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        HookSniff is a webhook delivery and monitoring platform. Send webhooks with confidence — we handle delivery, retries, signature verification, and observability.
      </p>

      {sections.map((section) => (
        <div key={section.title} className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 not-prose">{section.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
            {section.cards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="block p-5 border border-gray-200 dark:border-slate-700 rounded-xl hover:border-brand-300 dark:hover:border-brand-600 hover:shadow-md transition group"
              >
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">{card.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {/* API Info */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">API Base URL</h2>
        <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm font-mono overflow-x-auto">
          {`https://hooksniff-api-1046140057667.europe-west1.run.app/v1`}
        </pre>
      </section>

      {/* Authentication Quick Reference */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Authentication</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-3">
          All API requests require a Bearer token with an <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">hr_live_</code> prefixed API key:
        </p>
        <pre className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 p-4 rounded-xl text-sm font-mono overflow-x-auto">
          {`Authorization: Bearer hr_live_abc123xyz789`}
        </pre>
      </section>

      {/* Rate Limits */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Rate Limits</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Plan</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Requests/min</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Events/day</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3">Developer ($0)</td><td className="px-4 py-3">100</td><td className="px-4 py-3">100</td></tr>
              <tr><td className="px-4 py-3">Startup ($24/mo)</td><td className="px-4 py-3">500</td><td className="px-4 py-3">30,000</td></tr>
              <tr><td className="px-4 py-3">Pro ($49/mo)</td><td className="px-4 py-3">1,000</td><td className="px-4 py-3">100,000</td></tr>
              <tr><td className="px-4 py-3">Enterprise ($149/mo)</td><td className="px-4 py-3">Custom</td><td className="px-4 py-3">Unlimited</td></tr>
            </tbody>
          </table></div>
        </div>
      </section>
    </article>
  );
}
