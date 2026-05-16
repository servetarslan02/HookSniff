import { useTranslations } from 'next-intl';
import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';

// Revalidate every hour for ISR
export const revalidate = 3600;


export const metadata: Metadata = {
  title: 'Idempotency',
  description: 'Ensure webhook deliveries are processed exactly once',
};


export default function IdempotencyPage() {
  const t = useTranslations('docs');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t("idempotency")}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Safely retry webhook requests without creating duplicates.
      </p>

      {/* What is Idempotency */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What is Idempotency?</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          An <strong>idempotent</strong> operation produces the same result whether it's executed once or multiple times. For webhooks, this means if you accidentally send the same webhook twice, only one delivery is created.
        </p>
        <p className="text-gray-600 dark:text-slate-400">
          This is critical for handling network failures — if you don't receive a response, you can safely retry without worrying about duplicate deliveries.
        </p>
      </section>

      {/* Idempotency Keys */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("idempotencyKeys")}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Pass an <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">Idempotency-Key</code> header with your webhook requests:
        </p>
        <CodeBlock
          code={`curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: unique-order-12345-created" \\
  -d '{
    "endpoint_id": "ep_abc123",
    "event": "order.created",
    "data": {"order_id": "12345", "total": 99.99}
  }'`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          The key should be a unique string per logical operation. Common patterns:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">order-{`{id}`}-created</code> — For order events</li>
          <li><code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">payment-{`{id}`}-succeeded</code> — For payment events</li>
          <li><code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">user-{`{id}`}-signup-{`{timestamp}`}</code> — For user events</li>
        </ul>
      </section>

      {/* How HookSniff Handles Duplicates */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("howDuplicates")}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          When you include an idempotency key:
        </p>
        <ol className="space-y-3 text-gray-600 dark:text-slate-400">
          <li><strong>1.</strong> HookSniff checks if a webhook with the same key was already processed</li>
          <li><strong>2.</strong> If found, the cached response is returned immediately (same delivery ID)</li>
          <li><strong>3.</strong> If not found, the webhook is processed normally and the key is stored</li>
          <li><strong>4.</strong> Keys are retained for <strong>24 hours</strong> after the initial request</li>
        </ol>
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

      {/* Best Practices */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("bestPractices")}</h2>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>Always use idempotency keys for critical webhooks (payments, orders)</li>
          <li>Generate keys from your business logic, not random UUIDs</li>
          <li>{t("includeEventType")}</li>
          <li>{t("retrySameKey")}</li>
          <li>Keys expire after 24 hours — you can safely reuse them after that</li>
        </ul>
      </section>
    </article>
  );
}
