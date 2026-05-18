import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Event Types',
  description: 'Define and manage webhook event types in HookSniff',
};

export default function EventTypesPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Event Types</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Event types let you categorize webhooks and route them to the right endpoints. Without them, every webhook goes everywhere.
      </p>

      {/* The Problem */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">The Problem</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          If your application sends different kinds of events — order updates, user signups, payment confirmations — you probably want different endpoints to handle them. Your order processing service shouldn&apos;t receive user signup events.
        </p>
        <p className="text-gray-600 dark:text-slate-400">
          Without event types, you&apos;d need to filter on the consumer side, wasting bandwidth and processing time.
        </p>
      </section>

      {/* The Solution */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How Event Types Work</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Event types are string identifiers that describe what happened. They follow a <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">resource.action</code> pattern:
        </p>
        <div className="grid grid-cols-2 gap-3 mb-4 not-prose">
          {[
            'order.created',
            'order.updated',
            'order.cancelled',
            'payment.succeeded',
            'payment.failed',
            'user.created',
            'user.updated',
            'invoice.paid',
          ].map((evt) => (
            <code key={evt} className="bg-gray-100 dark:bg-slate-800 px-3 py-2 rounded-lg text-sm text-center">
              {evt}
            </code>
          ))}
        </div>
        <p className="text-gray-600 dark:text-slate-400">
          You can use any string format, but <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">resource.action</code> is recommended for consistency.
        </p>
      </section>

      {/* Registering */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Registering Event Types</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Event types are automatically registered when you send a webhook. No pre-registration required:
        </p>
        <CodeBlock
          code={`curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "endpoint_id": "ep_abc123",
    "event": "order.created",
    "data": {"order_id": "12345"}
  }'`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          The event type <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">order.created</code> is now available for filtering and search.
        </p>
      </section>

      {/* Filtering */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Filtering by Event Type</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Configure endpoints to only receive specific event types using the <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">event_filter</code> field:
        </p>
        <CodeBlock
          code={`curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/endpoints \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://myapp.com/webhooks/orders",
    "description": "Order events only",
    "event_filter": "order.*"
  }'`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4 mb-4">Supported filter patterns:</p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">order.created</code> — Exact match</li>
          <li><code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">order.*</code> — Wildcard (all order events)</li>
          <li><code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">*</code> — All events (default)</li>
        </ul>
      </section>

      {/* Schema Validation */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Schema Validation</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Optionally define JSON schemas for event types to validate payloads before delivery:
        </p>
        <CodeBlock
          code={`{
  "event_type": "order.created",
  "schema": {
    "type": "object",
    "required": ["order_id", "total"],
    "properties": {
      "order_id": { "type": "string" },
      "total": { "type": "number", "minimum": 0 },
      "currency": { "type": "string", "default": "USD" }
    }
  }
}`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          When a schema is defined, payloads that don&apos;t match are rejected with a <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">400 Bad Request</code> error before they even enter the delivery pipeline.
        </p>
      </section>

      {/* Best Practices */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Best Practices</h2>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>Be specific:</strong> <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">invoice.payment_failed</code> is better than <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">invoice.error</code></li>
          <li><strong>Use dots as separators:</strong> <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">resource.action</code> format</li>
          <li><strong>Version when changing shapes:</strong> <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">order.created.v2</code></li>
          <li><strong>Use wildcards for grouping:</strong> <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">payment.*</code> catches all payment events</li>
          <li><strong>Document your event types:</strong> Keep a list of all event types your application emits</li>
        </ul>
      </section>
    </article>
  );
}
