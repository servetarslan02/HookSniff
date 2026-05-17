import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Playground',
  description: 'Test webhooks instantly with the HookSniff playground',
};

export default function PlaygroundPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Playground</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Test webhooks without writing code. Send a test event and see what happens.
      </p>

      {/* The Problem */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">The Problem</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          You want to test your webhook endpoint before going live. But setting up a real event source just for testing is tedious.
        </p>
      </section>

      {/* The Solution */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">The Playground</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          The Playground lets you send test webhooks from the dashboard or API. No real event source needed.
        </p>
        <CodeBlock
          code={`curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/playground/test \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "endpoint_id": "ep_abc123",
    "event": "test.ping",
    "data": { "message": "Hello from the playground!" }
  }'`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          The test webhook goes through the full delivery pipeline — signing, delivery, retry logic — just like a real event.
        </p>
      </section>

      {/* Simulator */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Simulator</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          The Simulator generates realistic webhook traffic for load testing:
        </p>
        <CodeBlock
          code={`curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/simulator \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "endpoint_id": "ep_abc123",
    "count": 100,
    "event": "order.created",
    "interval_ms": 100
  }'`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          Sends 100 test events with 100ms intervals. Use this to test your endpoint&apos;s throughput and your retry configuration.
        </p>
      </section>

      {/* Dashboard */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Dashboard Playground</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Access the Playground from the dashboard sidebar. It provides a UI for:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>Sending test webhooks with custom payloads</li>
          <li>Viewing delivery results in real-time</li>
          <li>Inspecting request/response details</li>
          <li>Testing signature verification</li>
        </ul>
      </section>
    </article>
  );
}
