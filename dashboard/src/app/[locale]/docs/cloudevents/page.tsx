import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'CloudEvents',
  description: 'Send webhooks in CloudEvents v1.0 format',
};

export default function CloudEventsPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">CloudEvents v1.0</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        CloudEvents is a standard format for event data. HookSniff supports it natively.
      </p>

      {/* The Problem */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Why CloudEvents?</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Every webhook provider uses a different payload format. CloudEvents standardizes the envelope structure so consumers can build generic event processors.
        </p>
      </section>

      {/* Standard vs CloudEvents */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Standard vs CloudEvents Format</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mb-4">
          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Standard HookSniff</h4>
            <pre className="text-xs font-mono text-gray-600 dark:text-slate-400 overflow-x-auto">
{`{
  "event": "order.created",
  "data": {
    "order_id": "12345",
    "total": 99.99
  },
  "timestamp": "2026-01-15T10:30:00Z"
}`}
            </pre>
          </div>
          <div className="p-4 border border-brand-200 dark:border-brand-900/30 rounded-xl bg-brand-50/50 dark:bg-brand-900/10">
            <h4 className="text-sm font-semibold text-brand-800 dark:text-brand-400 mb-2">CloudEvents v1.0</h4>
            <pre className="text-xs font-mono text-brand-700 dark:text-brand-300 overflow-x-auto">
{`{
  "specversion": "1.0",
  "type": "order.created",
  "source": "/hooksniff",
  "id": "wh_abc123",
  "time": "2026-01-15T10:30:00Z",
  "datacontenttype": "application/json",
  "data": {
    "order_id": "12345",
    "total": 99.99
  }
}`}
            </pre>
          </div>
        </div>
      </section>

      {/* Configuration */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Enable CloudEvents</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Set the webhook format in your environment:
        </p>
        <CodeBlock
          code={`# In .env or environment variable
WEBHOOK_FORMAT=cloudevents`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          All subsequent webhook deliveries will use the CloudEvents envelope format.
        </p>
      </section>

      {/* Benefits */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Benefits</h2>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>Standard format</strong> — Compatible with CloudEvents-aware tools and libraries</li>
          <li><strong>Rich metadata</strong> — Includes spec version, source, content type</li>
          <li><strong>Interoperability</strong> — Works with Knative, Argo Events, AWS EventBridge</li>
          <li><strong>Future-proof</strong> — CNCF standard, widely adopted</li>
        </ul>
      </section>
    </article>
  );
}
