import { useTranslations } from 'next-intl';
import Link from 'next/link';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'What is HookSniff?',
  description: 'Understand what HookSniff is, the problem it solves, and how it works',
};

export default function WhatIsHookSniffPage() {
  const t = useTranslations('docs');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">What is HookSniff?</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        HookSniff is a webhook delivery platform. You send events via API, HookSniff delivers them to your endpoints with retries, signatures, and full observability.
      </p>

      {/* The Problem */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">The Problem</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          When your application needs to send webhooks, you end up building:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>Retry logic</strong> — What happens when the receiving server is down?</li>
          <li><strong>Queue management</strong> — How do you handle thousands of concurrent deliveries?</li>
          <li><strong>Signature verification</strong> — How does the receiver know the webhook is really from you?</li>
          <li><strong>Monitoring</strong> — How do you debug failed deliveries?</li>
          <li><strong>Rate limiting</strong> — How do you protect your customers&apos; servers from being overwhelmed?</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          Building this yourself takes weeks. HookSniff handles all of it out of the box.
        </p>
      </section>

      {/* Before and After */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Before and After HookSniff</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
          <div className="p-5 border border-red-200 dark:border-red-900/30 rounded-xl bg-red-50/50 dark:bg-red-900/10">
            <h3 className="text-base font-semibold text-red-800 dark:text-red-400 mb-3">Without HookSniff</h3>
            <ul className="space-y-2 text-sm text-red-700 dark:text-red-300">
              <li>❌ Webhook code scattered across your application</li>
              <li>❌ No centralized visibility on delivery status</li>
              <li>❌ Retry and failure logic you maintain yourself</li>
              <li>❌ Hard to debug when webhooks fail</li>
              <li>❌ No signature standard — each integration is different</li>
            </ul>
          </div>
          <div className="p-5 border border-green-200 dark:border-green-900/30 rounded-xl bg-green-50/50 dark:bg-green-900/10">
            <h3 className="text-base font-semibold text-green-800 dark:text-green-400 mb-3">With HookSniff</h3>
            <ul className="space-y-2 text-sm text-green-700 dark:text-green-300">
              <li>✅ One API call to send any webhook</li>
              <li>✅ Dashboard shows every delivery with full details</li>
              <li>✅ Automatic retries with exponential backoff</li>
              <li>✅ Dead Letter Queue for failed deliveries</li>
              <li>✅ Standard Webhooks HMAC-SHA256 signatures</li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How HookSniff Works</h2>
        <ol className="space-y-3 text-gray-600 dark:text-slate-400">
          <li><strong>1.</strong> Your application sends an event to HookSniff via REST API</li>
          <li><strong>2.</strong> HookSniff validates the payload, checks rate limits, and stores the delivery</li>
          <li><strong>3.</strong> The worker picks up the delivery and sends an HTTP POST to your endpoint</li>
          <li><strong>4.</strong> The payload is signed with HMAC-SHA256 using your endpoint&apos;s signing secret</li>
          <li><strong>5.</strong> If the delivery fails, it&apos;s automatically retried (default: 3 attempts with exponential backoff)</li>
          <li><strong>6.</strong> After all retries are exhausted, the delivery moves to the Dead Letter Queue</li>
          <li><strong>7.</strong> Every attempt is logged with status code, response body, and timing — visible in the dashboard</li>
        </ol>
      </section>

      {/* Core Concepts */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Core Concepts</h2>
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Endpoint</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">A URL where webhooks are delivered. Each endpoint has a signing secret and optional event filters.</p>
          </div>
          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Webhook (Delivery)</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">An event you send via the API. HookSniff delivers it to the target endpoint and tracks every attempt.</p>
          </div>
          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Event Type</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">A string identifier like <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-xs">order.created</code> that describes what happened. Used for filtering and routing.</p>
          </div>
          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Retry Policy</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">Configurable per endpoint. Default: 3 attempts with exponential backoff (1s, 2s, 4s). After exhaustion, delivery goes to DLQ.</p>
          </div>
          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Dead Letter Queue (DLQ)</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">Where failed deliveries go after all retries are exhausted. You can inspect them and replay with one click.</p>
          </div>
        </div>
      </section>

      {/* Why HookSniff */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Why HookSniff?</h2>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>Rust-powered</strong> — API and worker built with Axum/Tokio for high performance</li>
          <li><strong>11 SDKs</strong> — Node.js, Python, Go, Rust, Ruby, Java, Kotlin, PHP, C#, Elixir, Swift</li>
          <li><strong>Standard Webhooks</strong> — HMAC-SHA256 signatures, industry-standard format</li>
          <li><strong>Smart routing</strong> — Round-robin, latency-based, failover with fallback URLs</li>
          <li><strong>FIFO delivery</strong> — Ordered delivery with sequence numbers per endpoint</li>
          <li><strong>Per-endpoint throttling</strong> — Token bucket / sliding window to protect customer servers</li>
          <li><strong>Inbound proxy</strong> — Receive webhooks from Stripe, GitHub, Shopify through HookSniff</li>
          <li><strong>Embeddable portal</strong> — Let your customers manage their own webhook endpoints</li>
          <li><strong>Free tier friendly</strong> — Runs entirely on free services ($0/month)</li>
        </ul>
      </section>

      {/* Use Cases */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Use Cases</h2>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>SaaS platforms</strong> — Let customers receive webhook notifications from your product</li>
          <li><strong>E-commerce</strong> — Send order updates, payment confirmations, shipping notifications</li>
          <li><strong>CI/CD pipelines</strong> — Notify teams about build results, deployments, failures</li>
          <li><strong>Microservices</strong> — Decouple services with async event delivery</li>
          <li><strong>Third-party integrations</strong> — Connect to Slack, Discord, PagerDuty, or any HTTP endpoint</li>
          <li><strong>Audit and compliance</strong> — Track all events and their delivery status for compliance</li>
        </ul>
      </section>

      {/* Next Steps */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Next Steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
          <Link href="/docs/quickstart" className="block p-4 border border-gray-200 dark:border-slate-700 rounded-xl hover:border-brand-300 dark:hover:border-brand-600 hover:shadow-md transition">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">🚀 Quickstart</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">Send your first webhook in 5 minutes.</p>
          </Link>
          <Link href="/docs/concepts" className="block p-4 border border-gray-200 dark:border-slate-700 rounded-xl hover:border-brand-300 dark:hover:border-brand-600 hover:shadow-md transition">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">📐 Core Concepts</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">Endpoints, deliveries, retries, and more.</p>
          </Link>
          <Link href="/docs/best-practices" className="block p-4 border border-gray-200 dark:border-slate-700 rounded-xl hover:border-brand-300 dark:hover:border-brand-600 hover:shadow-md transition">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">✅ Best Practices</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">Production patterns for webhook integrations.</p>
          </Link>
          <Link href="/docs/architecture" className="block p-4 border border-gray-200 dark:border-slate-700 rounded-xl hover:border-brand-300 dark:hover:border-brand-600 hover:shadow-md transition">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">🏗️ Architecture</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">How HookSniff works under the hood.</p>
          </Link>
        </div>
      </section>
    </article>
  );
}
