import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Idempotency',
  description: 'Ensure webhook deliveries are processed exactly once',
};

export default function IdempotencyPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Idempotency</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Network failures happen. Idempotency lets you safely retry without creating duplicates.
      </p>

      {/* The Problem */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">The Problem</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          You send a webhook to create an order. The request reaches HookSniff, but the response doesn&apos;t come back — maybe the connection dropped, maybe a timeout. Did it work? You don&apos;t know.
        </p>
        <p className="text-gray-600 dark:text-slate-400">
          If you retry, you might create a duplicate order. If you don&apos;t retry, you might lose the event. This is the classic &quot;at-least-once vs at-most-once&quot; dilemma.
        </p>
      </section>

      {/* The Solution */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How Idempotency Works</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Pass an <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">Idempotency-Key</code> header with your webhook requests. If you send the same key twice within 24 hours, HookSniff returns the cached response — no duplicate delivery is created.
        </p>
        <CodeBlock
          code={`curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: order-12345-created" \\
  -d '{
    "endpoint_id": "ep_abc123",
    "event": "order.created",
    "data": {"order_id": "12345", "total": 99.99}
  }'`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4 mb-4">What happens on retry:</p>
        <CodeBlock
          code={`// First request — creates a delivery
POST /v1/webhooks
Idempotency-Key: order-12345-created
→ 200 { "id": "wh_abc123", "status": "pending" }

// Second request with same key — returns cached response
POST /v1/webhooks
Idempotency-Key: order-12345-created
→ 200 { "id": "wh_abc123", "status": "pending" }  // Same response!

// Different key — creates a new delivery
POST /v1/webhooks
Idempotency-Key: order-12345-updated
→ 200 { "id": "wh_def456", "status": "pending" }`}
        />
      </section>

      {/* Key Design */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Designing Idempotency Keys</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          The key should be a unique string per logical operation. Use your business logic identifiers, not random UUIDs:
        </p>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700 mb-4">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Pattern</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Example</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">When to Use</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3 font-mono text-sm">{'{resource}-{id}-{action}'}</td><td className="px-4 py-3 font-mono text-sm">order-12345-created</td><td className="px-4 py-3">Order events</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">payment-{'{id}'}-succeeded</td><td className="px-4 py-3 font-mono text-sm">payment-pay_abc-succeeded</td><td className="px-4 py-3">Payment events</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">user-{'{id}'}-signup-{'{date}'}</td><td className="px-4 py-3 font-mono text-sm">user-456-signup-20260115</td><td className="px-4 py-3">User events</td></tr>
            </tbody>
          </table></div>
        </div>
        <p className="text-gray-600 dark:text-slate-400">
          Keys expire after 24 hours. After that, the same key can be reused safely.
        </p>
      </section>

      {/* Best Practices */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Best Practices</h2>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>Always use idempotency keys for critical webhooks</strong> — payments, orders, account changes</li>
          <li><strong>Generate keys from business logic</strong> — not random UUIDs (random keys defeat the purpose)</li>
          <li><strong>Include the event type in the key</strong> — <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">order-123-created</code> and <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">order-123-updated</code> are different events</li>
          <li><strong>Retry with the same key</strong> — if you don&apos;t get a response, retry with the exact same key</li>
          <li><strong>Keys expire after 24 hours</strong> — you can safely reuse them after that</li>
        </ul>
      </section>
    </article>
  );
}
