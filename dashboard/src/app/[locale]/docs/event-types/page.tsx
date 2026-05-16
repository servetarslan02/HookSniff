import { useTranslations } from 'next-intl';
import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';

// Revalidate every hour for ISR
export const revalidate = 3600;


export const metadata: Metadata = {
  title: 'Event Types',
  description: 'Define and manage webhook event types in HookSniff',
};


export default function EventTypesPage() {
  const t = useTranslations('docs');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t("eventTypes")}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Organize and filter webhooks by event type. Route specific events to specific endpoints.
      </p>

      {/* What Are Event Types */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What Are Event Types?</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Event types are string identifiers that describe what happened. They follow a <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">resource.action</code> pattern:
        </p>
        <div className="grid grid-cols-2 gap-3 mb-4">
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

      {/* Registering Event Types */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("registeringEventTypes")}</h2>
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

      {/* Filtering by Event Type */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("filteringByEvent")}</h2>
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
        <p className="text-gray-600 dark:text-slate-400 mt-4 mb-4">
          Supported filter patterns:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">order.created</code> — Exact match</li>
          <li><code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">order.*</code> — Wildcard (all order events)</li>
          <li><code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">*</code> — All events (default)</li>
        </ul>
      </section>

      {/* Querying by Event Type */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("queryingByEvent")}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Filter delivery logs by event type:
        </p>
        <CodeBlock
          code={`curl "https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks?event=order.created" \\
  -H "Authorization: Bearer hr_live_YOUR_KEY"`}
        />
      </section>

      {/* Schema Validation */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("schemaValidation")}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Optionally define JSON schemas for event types to validate payloads:
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
          When a schema is defined, payloads that don't match are rejected with a <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">400 Bad Request</code> error.
        </p>
      </section>
    </article>
  );
}
