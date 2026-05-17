import { useTranslations } from 'next-intl';
import CodeBlock from '@/components/CodeBlock';
import Link from 'next/link';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Core Concepts',
  description: "Learn the core concepts behind HookSniff's webhook delivery system",
};

export default function ConceptsPage() {
  const t = useTranslations('docs');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Core Concepts</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Before diving into the API, understand the building blocks of HookSniff. These concepts are the foundation for everything else.
      </p>

      {/* The Problem */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Why These Concepts Matter</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Webhook systems look simple on the surface — just send an HTTP POST. But in production, you quickly run into questions:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>What happens when the receiver&apos;s server is down?</li>
          <li>How do you prove the webhook really came from you?</li>
          <li>How do you handle thousands of webhooks without overwhelming the receiver?</li>
          <li>How do you debug when something goes wrong?</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          HookSniff&apos;s core concepts solve each of these problems. Here&apos;s how they fit together.
        </p>
      </section>

      {/* Endpoints */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Endpoints</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          An <strong>endpoint</strong> is a URL where HookSniff delivers webhooks. Think of it as a &quot;mailing address&quot; for your webhooks.
        </p>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          <strong>Why endpoints matter:</strong> Instead of hardcoding URLs in your application, you register endpoints in HookSniff. This lets you change the destination without code changes, add event filters, and track delivery health per destination.
        </p>
        <p className="text-gray-600 dark:text-slate-400 mb-4">Each endpoint has:</p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400 mb-4">
          <li><strong>URL</strong> — The target that receives webhook POST requests</li>
          <li><strong>Signing secret</strong> — HMAC-SHA256 secret for payload verification (<code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">whsec_</code> prefix)</li>
          <li><strong>Event filter</strong> — Optional: only deliver specific event types (e.g., <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">order.*</code>)</li>
          <li><strong>Status</strong> — Active or inactive; inactive endpoints skip delivery</li>
          <li><strong>Retry policy</strong> — Custom retry behavior per endpoint</li>
        </ul>
        <CodeBlock
          code={`{
  "id": "ep_abc123",
  "url": "https://myapp.com/webhook",
  "description": "Order notifications",
  "signing_secret": "whsec_abc123xyz789...",
  "is_active": true,
  "event_filter": "order.*",
  "created_at": "2026-01-15T10:30:00Z"
}`}
        />
      </section>

      {/* Webhooks & Deliveries */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Webhooks & Deliveries</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          A <strong>webhook</strong> is an event you send via the API. A <strong>delivery</strong> is HookSniff&apos;s attempt to deliver that webhook to an endpoint.
        </p>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          <strong>The distinction matters:</strong> One webhook can have multiple deliveries (retries, multiple endpoints). Each delivery is tracked independently with its own status, attempts, and timing.
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400 mb-4">
          <li><strong>Event types</strong> — String identifiers like <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">order.created</code>, <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">user.updated</code></li>
          <li><strong>Payloads</strong> — JSON data sent as the request body</li>
          <li><strong>Delivery status</strong> — <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">pending</code>, <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">delivered</code>, or <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">failed</code></li>
          <li><strong>Attempt tracking</strong> — Each delivery attempt is recorded with status code, response body, and duration</li>
          <li><strong>Idempotency</strong> — Use the <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">Idempotency-Key</code> header to prevent duplicate deliveries</li>
        </ul>
        <CodeBlock
          code={`curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "endpoint_id": "ep_abc123",
    "event": "order.created",
    "data": { "order_id": "12345", "total": 99.99 }
  }'`}
        />
      </section>

      {/* Retries */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Retries</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          <strong>The problem:</strong> Servers go down, networks hiccup, deployments happen. If a webhook delivery fails, you don&apos;t want to lose the event.
        </p>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          <strong>The solution:</strong> HookSniff automatically retries failed deliveries using exponential backoff with jitter. Each retry waits longer than the last, preventing thundering herd problems.
        </p>
        <p className="text-gray-600 dark:text-slate-400 mb-4">Default schedule (3 attempts, configurable per endpoint):</p>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700 mb-4">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Attempt</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Delay</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Cumulative</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3">1</td><td className="px-4 py-3">~1 second</td><td className="px-4 py-3">~1s</td></tr>
              <tr><td className="px-4 py-3">2</td><td className="px-4 py-3">~2 seconds</td><td className="px-4 py-3">~3s</td></tr>
              <tr><td className="px-4 py-3">3</td><td className="px-4 py-3">~4 seconds</td><td className="px-4 py-3">~7s</td></tr>
            </tbody>
          </table></div>
        </div>
        <p className="text-gray-600 dark:text-slate-400">
          After all retries are exhausted, the delivery moves to the Dead Letter Queue. See <Link href="/docs/retries" className="text-brand-600 hover:text-brand-700">Retries & DLQ</Link> for details.
        </p>
      </section>

      {/* Dead Letter Queue */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Dead Letter Queue (DLQ)</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          <strong>The problem:</strong> After all retries fail, what happens to the event? Without a DLQ, it&apos;s silently lost.
        </p>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          <strong>The solution:</strong> Failed deliveries are preserved in the DLQ with full context — the original payload, every attempt&apos;s status code, response body, and timing. You can inspect them, understand what went wrong, and replay with one click.
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>Original payload preserved</li>
          <li>All attempt details (status codes, errors, timestamps)</li>
          <li>Ability to <strong>replay</strong> — re-queue the delivery for another attempt</li>
          <li>Retention based on plan (Developer: 7 days, Startup: 14 days, Pro: 180 days, Enterprise: 365 days)</li>
        </ul>
      </section>

      {/* API Keys */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">API Keys</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          <strong>The problem:</strong> How do you authenticate API requests without sharing your password?
        </p>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          <strong>The solution:</strong> API keys are long-lived tokens prefixed with <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">hr_live_</code>. You can create multiple keys (one per service or team member) and rotate them without downtime.
        </p>
        <CodeBlock
          code={`Authorization: Bearer hr_live_abc123xyz789`}
        />
        <ul className="space-y-2 text-gray-600 dark:text-slate-400 mt-4">
          <li>Keys are <strong>Argon2 hashed</strong> in the database — plaintext is never stored</li>
          <li>Multiple keys per account — rotate without downtime</li>
          <li>Scoped to your plan&apos;s rate limits</li>
          <li>Each key shows only its prefix in the dashboard — full key shown once at creation</li>
        </ul>
      </section>

      {/* FIFO Delivery */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">FIFO Delivery</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          <strong>The problem:</strong> If you send webhooks for order.created and order.updated in quick succession, the updated event might arrive before the created event. Your consumer processes them out of order.
        </p>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          <strong>The solution:</strong> HookSniff delivers webhooks in FIFO (first-in, first-out) order per endpoint. Each delivery includes a sequence number so consumers can detect gaps or reorder events.
        </p>
        <CodeBlock
          code={`{
  "delivery_id": "wh_xyz789",
  "sequence_number": 42,
  "event": "order.created",
  "data": { "order_id": "12345" },
  "timestamp": "2026-01-15T10:30:00Z"
}`}
        />
      </section>

      {/* How It All Fits Together */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How It All Fits Together</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Here&apos;s the complete flow:
        </p>
        <ol className="space-y-3 text-gray-600 dark:text-slate-400">
          <li><strong>1.</strong> You create an <strong>endpoint</strong> with a URL and signing secret</li>
          <li><strong>2.</strong> You send a <strong>webhook</strong> via API with an event type and payload</li>
          <li><strong>3.</strong> HookSniff creates a <strong>delivery</strong> and signs the payload with HMAC-SHA256</li>
          <li><strong>4.</strong> The worker delivers it to your endpoint in FIFO order</li>
          <li><strong>5.</strong> If it fails, <strong>retries</strong> kick in with exponential backoff</li>
          <li><strong>6.</strong> If all retries fail, the delivery goes to the <strong>DLQ</strong> for inspection</li>
          <li><strong>7.</strong> You can <strong>replay</strong> failed deliveries after fixing the issue</li>
        </ol>
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          All of this is visible in the <Link href="/docs/dashboard" className="text-brand-600 hover:text-brand-700">dashboard</Link> with real-time delivery tracking, analytics, and alerting.
        </p>
      </section>
    </article>
  );
}
