import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Payload Transforms',
  description: 'Transform webhook payloads before delivery',
};

export default function TransformsPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Payload Transforms</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Reshape, filter, or enrich webhook payloads before they reach your endpoint.
      </p>

      {/* The Problem */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">The Problem</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Your internal event has 50 fields, but your customer only needs 5. Or the payload format doesn&apos;t match what their system expects. You could transform on your side, but that adds complexity.
        </p>
      </section>

      {/* The Solution */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How Transforms Work</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Transforms are rules that modify the payload before delivery. They run on HookSniff&apos;s side, so your endpoint receives exactly the data it needs.
        </p>
        <CodeBlock
          code={`curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/endpoints/ep_abc123/transforms \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Filter order fields",
    "rules": [
      { "action": "include", "field": "order_id" },
      { "action": "include", "field": "total" },
      { "action": "include", "field": "status" },
      { "action": "exclude", "field": "internal_notes" },
      { "action": "rename", "from": "total", "to": "amount" }
    ]
  }'`}
        />
      </section>

      {/* Test */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Test a Transform</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Test your transform before applying it:
        </p>
        <CodeBlock
          code={`curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/endpoints/ep_abc123/transforms/test \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "payload": { "order_id": "12345", "total": 99.99, "internal_notes": "..." },
    "rules": [
      { "action": "include", "field": "order_id" },
      { "action": "exclude", "field": "internal_notes" }
    ]
  }'`}
        />
      </section>

      {/* Use Cases */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Use Cases</h2>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>Field filtering</strong> — Remove internal fields before sending to customers</li>
          <li><strong>Field renaming</strong> — Match your customer&apos;s expected format</li>
          <li><strong>Data enrichment</strong> — Add computed fields</li>
          <li><strong>Payload reduction</strong> — Strip large fields to stay under size limits</li>
        </ul>
      </section>
    </article>
  );
}
