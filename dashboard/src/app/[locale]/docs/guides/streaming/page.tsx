import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';
import { Radio } from '@/components/icons';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Streaming & Rate Limiting — HookSniff Docs',
  description: 'Real-time SSE streaming and rate limiting configuration',
};

export default function StreamingPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2"><Radio size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> Streaming & Rate Limiting</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        HookSniff supports real-time delivery monitoring via SSE streaming, and per-endpoint rate limiting to protect your servers.
      </p>

      {/* SSE Streaming */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Real-Time Streaming (SSE)</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Stream delivery events in real-time using Server-Sent Events (SSE). Useful for live dashboards, monitoring, and debugging.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Connect to Stream</h3>
        <CodeBlock
          code={`curl -N https://hooksniff-api-1046140057667.europe-west1.run.app/v1/stream/deliveries \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Accept: text/event-stream"`}
        />

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 mt-6">Node.js SDK</h3>
        <CodeBlock
          code={`import { HookSniff } from 'hooksniff';

const hs = new HookSniff({ apiKey: 'hr_live_xxx' });

// Stream delivery events
const stream = hs.stream.subscribe({
  event_types: ['delivery.completed', 'delivery.failed'],
});

stream.on('event', (event) => {
  console.log(\`[\${event.event}] \${event.data.message_id}: \${event.data.status}\`);
});

stream.on('error', (err) => {
  console.error('Stream error:', err);
  // Auto-reconnects with backoff
});

// Close when done
// stream.close();`}
        />

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 mt-6">Event Types</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Event</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {[
                ['delivery.completed', 'Webhook delivered successfully (2xx)'],
                ['delivery.failed', 'Delivery failed (non-2xx or timeout)'],
                ['delivery.retrying', 'Delivery being retried'],
                ['endpoint.disabled', 'Endpoint auto-disabled after repeated failures'],
                ['endpoint.enabled', 'Endpoint re-enabled'],
              ].map(([event, desc]) => (
                <tr key={event as string}>
                  <td className="px-4 py-3 font-mono text-sm">{event as string}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{desc as string}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Rate Limiting */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Rate Limiting</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Protect your webhook endpoints from being overwhelmed. Configure per-endpoint rate limits using token bucket or sliding window algorithms.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Set Rate Limit</h3>
        <CodeBlock
          code={`curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/endpoints/EP_ID/rate-limit \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "algorithm": "token_bucket",
    "rate": 100,
    "period": 60
  }'
// → 100 requests per 60 seconds`}
        />

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 mt-6">Rate Limit Headers</h3>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Every API response includes rate limit headers:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Header</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {[
                ['X-RateLimit-Limit', 'Maximum requests per window'],
                ['X-RateLimit-Remaining', 'Requests remaining in current window'],
                ['X-RateLimit-Reset', 'Unix timestamp when window resets'],
                ['Retry-After', 'Seconds to wait (only on 429 responses)'],
              ].map(([header, desc]) => (
                <tr key={header as string}>
                  <td className="px-4 py-3 font-mono text-sm">{header as string}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{desc as string}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 mt-6">Handling 429</h3>
        <CodeBlock
          code={`// All SDKs handle 429 automatically with exponential backoff.
// But you can also handle it manually:

try {
  const endpoints = await hs.endpoint.list();
} catch (err) {
  if (err.statusCode === 429) {
    const retryAfter = parseInt(err.headers['retry-after']);
    console.log(\`Rate limited. Retry after \${retryAfter}s\`);
    await sleep(retryAfter * 1000);
    // Retry
  }
}`}
        />
      </section>

      {/* API Rate Limits by Plan */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">API Rate Limits by Plan</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Plan</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Requests/min</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Webhooks/day</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {[
                ['Developer (Free)', '100', '100'],
                ['Startup ($24/mo)', '500', '30,000'],
                ['Pro ($49/mo)', '1,000', '100,000'],
                ['Enterprise', 'Custom', 'Unlimited'],
              ].map(([plan, rpm, wpd]) => (
                <tr key={plan as string}>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{plan as string}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{rpm as string}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{wpd as string}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </article>
  );
}
