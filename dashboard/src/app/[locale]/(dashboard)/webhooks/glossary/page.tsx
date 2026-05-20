import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

// Revalidate every hour for ISR
export const revalidate = 3600;


export const metadata = {
  title: 'Webhook Glossary — Terms & Definitions | HookSniff',
  description: 'Comprehensive glossary of webhook and event-driven architecture terms. From HMAC signatures to dead letter queues, understand every concept.',
};

const glossary = [
  { term: 'Webhook', definition: 'An HTTP callback (usually POST) sent from one application to another when a specific event occurs. Unlike polling, webhooks push data in real-time.' },
  { term: 'Event', definition: 'A discrete occurrence in a system that triggers a webhook delivery. Examples: user.created, payment.completed, order.shipped.' },
  { term: 'Endpoint', definition: 'The URL that receives webhook deliveries. Also called a "consumer" or "subscriber" endpoint.' },
  { term: 'Payload', definition: 'The data sent in the webhook request body, typically JSON. Contains the event details and metadata.' },
  { term: 'HMAC (Hash-based Message Authentication Code)', definition: 'A cryptographic signature mechanism. HMAC-SHA256 is the standard for webhook signing — the sender hashes the payload with a secret, the receiver verifies it.' },
  { term: 'Signing Secret', definition: 'A shared secret key (typically prefixed with whsec_) used to generate and verify HMAC signatures. Must be kept confidential.' },
  { term: 'Standard Webhooks', definition: 'An open specification for webhook signing and verification. Defines headers: webhook-id, webhook-timestamp, webhook-signature. Used by HookSniff and Svix.' },
  { term: 'CloudEvents', definition: 'A CNCF specification (v1.0) for describing event data in a common way. Provides a standard envelope format with required attributes (specversion, type, source, id).' },
  { term: 'Retry Policy', definition: 'Rules governing how failed webhook deliveries are retried. Typically exponential backoff with jitter to avoid thundering herd problems.' },
  { term: 'Exponential Backoff', definition: 'A retry strategy where wait time between retries increases exponentially (e.g., 1s, 2s, 4s, 8s, 16s). Combined with jitter to spread load.' },
  { term: 'Jitter', definition: 'Random variation added to retry delays to prevent synchronized retries (thundering herd) when many endpoints fail simultaneously.' },
  { term: 'Dead Letter Queue (DLQ)', definition: 'A queue that stores webhook deliveries that have exhausted all retry attempts. Allows manual inspection and replay of failed events.' },
  { term: 'FIFO (First In, First Out)', definition: 'Ordered delivery guarantee — events are delivered in the exact order they were produced. Critical for sequential operations like order status updates.' },
  { term: 'Idempotency', definition: 'The property where processing the same webhook multiple times produces the same result. Essential because retries can cause duplicate deliveries.' },
  { term: 'At-Least-Once Delivery', definition: 'A delivery guarantee where each event is delivered at least once, but may be delivered multiple times. Most webhook systems use this model.' },
  { term: 'SSRF (Server-Side Request Forgery)', definition: 'An attack where an attacker tricks the server into making requests to internal/private IPs. Webhook endpoint URLs must be validated to prevent SSRF.' },
  { term: 'Schema Registry', definition: 'A system that stores and validates JSON schemas for webhook payloads. Ensures consumers know what to expect and catches breaking changes.' },
  { term: 'Transformations', definition: 'Code that modifies webhook payloads before delivery. Used to filter fields, reshape data, or adapt to consumer-specific formats.' },
  { term: 'Embeddable Portal', definition: 'A white-label UI that webhook providers embed in their dashboard. Lets end-users manage their own webhook subscriptions, view logs, and replay events.' },
  { term: 'Inbound Proxy', definition: 'A service that receives webhooks from third-party providers (Stripe, GitHub, Shopify) and forwards them to your application. Normalizes formats and handles verification.' },
  { term: 'Rate Limiting', definition: 'Controlling the number of webhook deliveries per second to protect consumer endpoints from being overwhelmed. Token bucket and sliding window are common algorithms.' },
  { term: 'Token Bucket', definition: 'A rate-limiting algorithm where tokens are added at a fixed rate. Each delivery consumes a token. When the bucket is empty, deliveries are queued.' },
  { term: 'Sliding Window', definition: 'A rate-limiting algorithm that tracks requests within a rolling time window. More accurate than fixed windows for handling bursts.' },
  { term: 'Backpressure', definition: 'A buildup of undelivered webhooks when consumers can\'t keep up with the delivery rate. Requires queue management and monitoring.' },
  { term: 'Payload Retention', definition: 'How long webhook payload data is stored after delivery. Ranges from 3 days (free tiers) to 90+ days (paid plans).' },
  { term: 'Replay', definition: 'Re-delivering previously sent webhooks. Useful when a consumer endpoint was down and needs to catch up on missed events.' },
  { term: 'Multi-Tenancy', definition: 'Isolating webhook traffic between different customers (tenants) within the same infrastructure. Each tenant has separate endpoints, secrets, and rate limits.' },
  { term: 'OpenTelemetry', definition: 'A CNCF observability framework for traces, metrics, and logs. Used to monitor webhook delivery performance and debug issues.' },
  { term: 'Webhook Playground', definition: 'A testing tool that generates webhook URLs and displays received payloads in real-time. Used by developers to test integrations without deploying code.' },
  { term: 'SOC 2', definition: 'A compliance framework for service organizations. SOC 2 Type 2 requires ongoing audits of security controls. Enterprise customers often require it.' },
  { term: 'GDPR', definition: 'EU General Data Protection Regulation. Requires data residency controls, right to erasure, data export, and explicit consent for data processing.' },
  { term: 'Webhook vs Polling', definition: 'Webhooks push events in real-time (efficient, instant). Polling repeatedly checks for changes (wasteful, delayed). Webhooks are preferred for event-driven architectures.' },
  { term: 'Webhook vs WebSocket', definition: 'Webhooks are one-way server-to-server HTTP calls (fire-and-forget). WebSockets are persistent bidirectional connections (real-time streaming). Different use cases.' },
  { term: 'Webhook vs Message Queue', definition: 'Webhooks are HTTP-based push notifications between services. Message queues (RabbitMQ, SQS) are decoupled async communication. Webhooks are simpler; queues offer more control.' },
];

export default function GlossaryPage() {
  const t = useTranslations('webhooks');
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <nav className="border-b border-gray-200/50 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="items-center gap-3 flex">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">🪝 HookSniff</Link>
            <span className="text-gray-500 dark:text-slate-500">/</span>
            <Link href="/webhooks" className="text-gray-600 dark:text-slate-400">{t("title")}</Link>
            <span className="text-gray-500 dark:text-slate-500">/</span>
            <span className="text-gray-600 dark:text-slate-400">{t("glossary")}</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Webhook Glossary
          </h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-3xl mx-auto">
            A comprehensive reference of webhook and event-driven architecture terms. Whether you&apos;re new to webhooks or an experienced developer, this glossary covers everything you need to know.
          </p>
        </div>

        {/* Quick Nav */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {glossary.map((item) => (
            <a
              key={item.term}
              href={`#${item.term.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')}`}
              className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full text-gray-600 dark:text-slate-400 hover:border-brand-300 dark:hover:border-brand-500/40 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              {item.term.split(' (')[0]}
            </a>
          ))}
        </div>

        {/* Glossary Items */}
        <div className="space-y-4">
          {glossary.map((item) => {
            const slug = item.term.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
            return (
              <div key={item.term} id={slug} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 scroll-mt-24">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.term}</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">{item.definition}</p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center p-8 bg-gray-900 dark:bg-slate-800 rounded-xl">
          <h2 className="text-2xl font-bold text-white mb-2">{t('readyTitle')}</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-6">{t('readyDesc')}</p>
          <Link href="/login" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">{t('startFree')}</Link>
        </div>
      </main>
    </div>
  );
}
