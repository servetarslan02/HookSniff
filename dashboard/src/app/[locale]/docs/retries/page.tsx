import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Retry Strategies',
  description: 'Configure automatic retry policies for failed webhook deliveries',
};

export default function RetriesPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Retries & Retry Policy</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Failed deliveries shouldn&apos;t be lost. HookSniff retries them automatically with exponential backoff.
      </p>

      {/* The Problem */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">The Problem</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Webhook deliveries fail all the time. The receiver&apos;s server might be down, the network might be slow, or a deployment might be in progress. If you only try once, you lose the event.
        </p>
        <p className="text-gray-600 dark:text-slate-400">
          But retrying blindly is also bad — if you retry immediately and aggressively, you overwhelm a server that&apos;s already struggling.
        </p>
      </section>

      {/* The Solution */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How HookSniff Handles Retries</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          HookSniff uses <strong>exponential backoff with jitter</strong>:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400 mb-4">
          <li><strong>Exponential backoff</strong> — Each retry waits longer than the last (1s → 2s → 4s)</li>
          <li><strong>Jitter (0-25%)</strong> — Random variation prevents thundering herd when many deliveries fail simultaneously</li>
          <li><strong>Configurable</strong> — Customize per endpoint: max attempts, base delay, max delay, multiplier</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400 mb-4">Default schedule (3 attempts):</p>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700 mb-6">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Attempt</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Delay After Failure</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Cumulative Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3 font-medium">1</td><td className="px-4 py-3">~1 second</td><td className="px-4 py-3">~1s</td></tr>
              <tr><td className="px-4 py-3 font-medium">2</td><td className="px-4 py-3">~2 seconds</td><td className="px-4 py-3">~3s</td></tr>
              <tr><td className="px-4 py-3 font-medium">3</td><td className="px-4 py-3">~4 seconds</td><td className="px-4 py-3">~7s</td></tr>
            </tbody>
          </table></div>
        </div>
        <p className="text-gray-600 dark:text-slate-400">
          Platform default: 3 attempts. Configurable per endpoint from 1 to 100.
        </p>
      </section>

      {/* What Counts as a Failure */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What Counts as a Failure?</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Not all errors trigger retries. HookSniff distinguishes between retryable and non-retryable failures:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mb-4">
          <div className="p-4 border border-green-200 dark:border-green-900/30 rounded-xl bg-green-50/50 dark:bg-green-900/10">
            <h4 className="text-sm font-semibold text-green-800 dark:text-green-400 mb-2">✅ Retryable</h4>
            <ul className="space-y-1 text-sm text-green-700 dark:text-green-300">
              <li><code className="bg-green-100 dark:bg-green-900/30 px-1 py-0.5 rounded text-xs">5xx</code> Server errors</li>
              <li><code className="bg-green-100 dark:bg-green-900/30 px-1 py-0.5 rounded text-xs">429</code> Rate limited</li>
              <li><code className="bg-green-100 dark:bg-green-900/30 px-1 py-0.5 rounded text-xs">408</code> Request timeout</li>
              <li>Connection timeout (30s)</li>
              <li>DNS failure</li>
              <li>TLS handshake failure</li>
            </ul>
          </div>
          <div className="p-4 border border-red-200 dark:border-red-900/30 rounded-xl bg-red-50/50 dark:bg-red-900/10">
            <h4 className="text-sm font-semibold text-red-800 dark:text-red-400 mb-2">❌ Not Retried</h4>
            <ul className="space-y-1 text-sm text-red-700 dark:text-red-300">
              <li><code className="bg-red-100 dark:bg-red-900/30 px-1 py-0.5 rounded text-xs">400</code> Bad request</li>
              <li><code className="bg-red-100 dark:bg-red-900/30 px-1 py-0.5 rounded text-xs">401</code> Unauthorized</li>
              <li><code className="bg-red-100 dark:bg-red-900/30 px-1 py-0.5 rounded text-xs">403</code> Forbidden</li>
              <li><code className="bg-red-100 dark:bg-red-900/30 px-1 py-0.5 rounded text-xs">404</code> Not found</li>
              <li>Other <code className="bg-red-100 dark:bg-red-900/30 px-1 py-0.5 rounded text-xs">4xx</code> client errors</li>
            </ul>
          </div>
        </div>
        <p className="text-gray-600 dark:text-slate-400">
          Only <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">2xx</code> responses are considered successful. Client errors (4xx except 429/408) indicate a problem with the request itself — retrying won&apos;t help.
        </p>
      </section>

      {/* Custom Retry Policy */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Custom Retry Policy</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Different endpoints have different needs. A critical payment webhook might need more retries than a low-priority notification. Configure per endpoint:
        </p>
        <CodeBlock
          code={`curl -X PUT https://hooksniff-api-1046140057667.europe-west1.run.app/v1/endpoints/ep_abc123/retry-policy \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "max_attempts": 5,
    "base_delay_ms": 2000,
    "max_delay_ms": 600000,
    "multiplier": 2.0
  }'`}
        />
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700 mt-4">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Parameter</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Default</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3 font-mono text-sm">max_attempts</td><td className="px-4 py-3">3</td><td className="px-4 py-3">Max delivery attempts (1–100)</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">base_delay_ms</td><td className="px-4 py-3">1,000</td><td className="px-4 py-3">Base delay in milliseconds</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">max_delay_ms</td><td className="px-4 py-3">3,600,000</td><td className="px-4 py-3">Maximum delay cap (1 hour)</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">multiplier</td><td className="px-4 py-3">2.0</td><td className="px-4 py-3">Backoff multiplier (1.0 = linear, 2.0 = exponential)</td></tr>
            </tbody>
          </table></div>
        </div>
      </section>

      {/* Replay */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Replaying Failed Webhooks</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          After a delivery is moved to the DLQ, you can replay it. This resets the attempt counter and re-queues with a fresh retry schedule:
        </p>
        <CodeBlock
          code={`curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks/wh_xyz789/replay \\
  -H "Authorization: Bearer hr_live_YOUR_KEY"`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          You can also replay from the dashboard with one click. Use this after fixing the issue on the receiver&apos;s side.
        </p>
      </section>

      {/* When to Customize */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">When to Customize</h2>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>Payment webhooks</strong> — Increase max_attempts to 5-10, payments are critical</li>
          <li><strong>Analytics events</strong> — Decrease to 1-2, not worth retrying aggressively</li>
          <li><strong>Slow receivers</strong> — Increase base_delay_ms to give them more recovery time</li>
          <li><strong>High-volume endpoints</strong> — Use higher multiplier to space out retries</li>
        </ul>
      </section>
    </article>
  );
}
