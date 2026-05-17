import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Inbound Webhooks',
  description: 'Receive webhooks from external providers through HookSniff',
};

export default function InboundWebhooksPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Inbound Webhooks</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Receive webhooks from Stripe, GitHub, Shopify and other providers — all through HookSniff.
      </p>

      {/* The Problem */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">The Problem</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          You use Stripe for payments, GitHub for code, Shopify for orders. Each sends webhooks in different formats, with different signature schemes. You need a separate handler for each one.
        </p>
      </section>

      {/* The Solution */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How Inbound Webhooks Work</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          HookSniff acts as a proxy: external providers send webhooks to HookSniff, HookSniff normalizes them and delivers to your endpoint with a consistent format and signature.
        </p>
        <ol className="space-y-3 text-gray-600 dark:text-slate-400">
          <li><strong>1.</strong> Create an inbound config for the provider</li>
          <li><strong>2.</strong> Give the provider HookSniff&apos;s inbound URL</li>
          <li><strong>3.</strong> Provider sends webhooks to HookSniff</li>
          <li><strong>4.</strong> HookSniff normalizes and forwards to your endpoint</li>
        </ol>
      </section>

      {/* Configuration */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Create Inbound Config</h2>
        <CodeBlock
          code={`curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/inbound/configs \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "provider": "stripe",
    "endpoint_id": "ep_abc123",
    "secret": "whsec_stripe_secret_from_dashboard"
  }'`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          Response includes the inbound URL to give to Stripe:
        </p>
        <CodeBlock
          code={`{
  "id": "inbound_abc123",
  "provider": "stripe",
  "inbound_url": "https://hooksniff-api.../v1/inbound/stripe",
  "endpoint_id": "ep_abc123"
}`}
        />
      </section>

      {/* Supported Providers */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Supported Providers</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Provider</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Signature Header</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Auto-Detection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3 font-medium">Stripe</td><td className="px-4 py-3 font-mono text-sm">stripe-signature</td><td className="px-4 py-3">✅</td></tr>
              <tr><td className="px-4 py-3 font-medium">GitHub</td><td className="px-4 py-3 font-mono text-sm">x-hub-signature-256</td><td className="px-4 py-3">✅</td></tr>
              <tr><td className="px-4 py-3 font-medium">Shopify</td><td className="px-4 py-3 font-mono text-sm">x-shopify-hmac-sha256</td><td className="px-4 py-3">✅</td></tr>
              <tr><td className="px-4 py-3 font-medium">Custom</td><td className="px-4 py-3 font-mono text-sm">Configurable</td><td className="px-4 py-3">—</td></tr>
            </tbody>
          </table></div>
        </div>
      </section>

      {/* Benefits */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Benefits</h2>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>One endpoint</strong> — Receive from all providers through a single URL</li>
          <li><strong>Consistent format</strong> — All webhooks delivered in the same format</li>
          <li><strong>Unified monitoring</strong> — See all inbound webhooks in one dashboard</li>
          <li><strong>Automatic retries</strong> — Failed deliveries are retried like any other webhook</li>
          <li><strong>Signature verification</strong> — Provider signatures verified before forwarding</li>
        </ul>
      </section>
    </article>
  );
}
