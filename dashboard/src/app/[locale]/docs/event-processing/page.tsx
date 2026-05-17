import Link from 'next/link';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Event Processing',
  description: 'How HookSniff processes events from ingestion to delivery',
};

export default function EventProcessingPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Event Processing</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Understanding the event lifecycle helps you debug issues and optimize your integration.
      </p>

      {/* Lifecycle */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Event Lifecycle</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Every event goes through these stages:
        </p>
        <ol className="space-y-4 text-gray-600 dark:text-slate-400">
          <li>
            <strong>1. Ingestion</strong> — Your app sends a POST to <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">/v1/webhooks</code>. HookSniff validates the API key, checks rate limits, validates the payload, and stores the delivery.
          </li>
          <li>
            <strong>2. Queuing</strong> — The delivery is inserted into the PostgreSQL queue with status <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">pending</code>. The API returns immediately with the delivery ID.
          </li>
          <li>
            <strong>3. Dispatch</strong> — The worker picks up the delivery from the queue. It looks up the endpoint URL and signing secret.
          </li>
          <li>
            <strong>4. Delivery</strong> — The worker sends an HTTP POST to the endpoint with the signed payload. It waits up to 30 seconds for a response.
          </li>
          <li>
            <strong>5. Result</strong> — If the endpoint returns 2xx, the delivery is marked <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">delivered</code>. Otherwise, it&apos;s marked for retry.
          </li>
          <li>
            <strong>6. Retry (if needed)</strong> — Failed deliveries are re-queued with exponential backoff. After all retries are exhausted, the delivery moves to the DLQ.
          </li>
        </ol>
      </section>

      {/* Payload Signing */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Payload Signing</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Before delivery, HookSniff signs the payload using HMAC-SHA256:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>Signature: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">v1,{'{'}base64(hmac_sha256(secret, body)){'}'}</code></li>
          <li>Timestamp: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">X-HookSniff-Timestamp</code> (Unix seconds)</li>
          <li>Delivery ID: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">X-HookSniff-Delivery-Id</code></li>
        </ul>
      </section>

      {/* Fanout */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Fanout</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          One event can be delivered to multiple endpoints. If you have 5 endpoints listening to <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">order.created</code>, HookSniff creates 5 separate deliveries — each with its own signing secret, retry policy, and delivery tracking.
        </p>
      </section>

      {/* Ordering */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ordering</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          HookSniff delivers events in FIFO order per endpoint. Each delivery includes a sequence number. If a delivery fails and is retried, subsequent deliveries to the same endpoint are held until the retry completes.
        </p>
      </section>

      {/* Timeouts */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Timeouts</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Each delivery attempt has a 30-second timeout. If your endpoint doesn&apos;t respond within 30 seconds, the attempt is marked as failed and retried.
        </p>
        <p className="text-gray-600 dark:text-slate-400">
          <strong>Best practice:</strong> Return 200 immediately and process asynchronously. See <Link href="/docs/best-practices" className="text-brand-600 hover:text-brand-700">Best Practices</Link>.
        </p>
      </section>
    </article>
  );
}
