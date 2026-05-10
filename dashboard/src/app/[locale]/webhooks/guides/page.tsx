import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export const metadata = {
  title: 'Webhook Guides — Everything You Need to Know | HookSniff',
  description: 'Comprehensive webhook guides covering implementation, security, best practices, and troubleshooting. From beginner to advanced.',
};

const guides = [
  {
    category: 'Fundamentals',
    items: [
      { title: 'What is a Webhook?', description: 'The complete guide to webhooks — how they work, when to use them, and how they compare to polling and WebSockets.', href: '/what-is-a-webhook' },
      { title: 'Webhook Glossary', description: '35+ terms defined: HMAC, dead letter queue, idempotency, CloudEvents, and more.', href: '/webhooks/glossary' },
      { title: 'Build vs Buy Webhooks', description: 'Should you build webhook infrastructure in-house or use a service? Cost, time, and complexity analysis.', href: '/build-vs-buy' },
    ],
  },
  {
    category: 'Implementation',
    items: [
      { title: 'Quickstart Guide', description: 'Send your first webhook in 5 minutes. Standard Webhooks format with HMAC-SHA256 signing.', href: '/docs/quickstart' },
      { title: 'Webhook Security Best Practices', description: 'HMAC verification, SSRF protection, secret rotation, replay prevention, and rate limiting.', href: '/docs/security' },
      { title: 'Node.js Webhook Integration', description: 'Complete guide to receiving and verifying webhooks in Node.js with the HookSniff SDK.', href: '/docs/quickstart' },
      { title: 'Python Webhook Integration', description: 'Receive, verify, and process webhooks in Python with Flask, FastAPI, or Django.', href: '/docs/quickstart' },
    ],
  },
  {
    category: 'Advanced',
    items: [
      { title: 'FIFO Ordered Delivery', description: 'How to guarantee webhook delivery order with sequence numbers. Critical for sequential state changes.', href: '/docs' },
      { title: 'CloudEvents Integration', description: 'Using the CNCF CloudEvents v1.0 specification with HookSniff for standardized event formats.', href: '/docs' },
      { title: 'Schema Registry', description: 'Define, validate, and version your webhook payloads with JSON Schema. Catch breaking changes before they ship.', href: '/docs' },
      { title: 'Dead Letter Queue Management', description: 'Handle permanently failed webhook deliveries. Inspect, debug, and replay failed events.', href: '/docs' },
    ],
  },
  {
    category: 'Providers',
    items: [
      { title: 'Stripe Webhook Setup', description: 'Receive and verify Stripe webhooks. Handle payment events, subscriptions, and disputes.', href: '/providers/stripe' },
      { title: 'GitHub Webhook Setup', description: 'Set up GitHub webhooks for push, pull request, issue, and deployment events.', href: '/providers/github' },
      { title: 'Shopify Webhook Setup', description: 'Integrate Shopify webhooks for orders, products, customers, and inventory updates.', href: '/providers/shopify' },
    ],
  },
];

export default function WebhookGuidesPage() {
  const t = useTranslations(\'webhooks\');
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <nav className="border-b border-gray-200/50 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="items-center gap-3 flex">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">🪝 HookSniff</Link>
            <span className="text-gray-400">/</span>
            <Link href="/webhooks" className="text-gray-600 dark:text-slate-400">Webhooks</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 dark:text-slate-400">{t("guides")}</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Webhook Guides
          </h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-3xl mx-auto">
            Everything you need to implement, secure, and scale webhooks. From first principles to advanced patterns.
          </p>
        </div>

        <div className="space-y-12">
          {guides.map((section) => (
            <div key={section.category}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{section.category}</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.items.map((guide) => (
                  <Link
                    key={guide.title}
                    href={guide.href}
                    className="group p-5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-500/40 transition-colors"
                  >
                    <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mb-2">{guide.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-slate-400">{guide.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center p-8 bg-gray-900 dark:bg-slate-800 rounded-xl">
          <h2 className="text-2xl font-bold text-white mb-2">Ready to build?</h2>
          <p className="text-gray-400 dark:text-slate-400 mb-6">Start sending webhooks in minutes with HookSniff.</p>
          <Link href="/login" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">Start for free →</Link>
        </div>
      </main>
    </div>
  );
}
