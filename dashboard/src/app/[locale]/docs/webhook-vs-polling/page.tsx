import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Webhook vs Polling',
  description: 'Understand the difference between webhooks and polling, and when to use each',
};

export default function WebhookVsPollingPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Webhook vs Polling</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Two approaches to getting real-time data. Each has trade-offs.
      </p>

      {/* The Problem */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">The Problem</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Your application needs to know when something happens in another system — a payment succeeds, an order ships, a user signs up. How do you get that data?
        </p>
      </section>

      {/* Polling */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Polling</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Polling means asking the other system &quot;anything new?&quot; at regular intervals.
        </p>
        <p className="text-gray-600 dark:text-slate-400 mb-4"><strong>Pros:</strong></p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400 mb-4">
          <li>Simple to implement — just a cron job and HTTP GET</li>
          <li>No endpoint to expose — you&apos;re the client, not the server</li>
          <li>You control the timing</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400 mb-4"><strong>Cons:</strong></p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>Wasted requests — most polls return &quot;nothing new&quot;</li>
          <li>Latency — you only know about events when you poll</li>
          <li>Rate limits — the other system might throttle you</li>
          <li>Hard to scale — more systems = more polling jobs</li>
        </ul>
      </section>

      {/* Webhooks */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Webhooks</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Webhooks mean the other system pushes data to you when something happens.
        </p>
        <p className="text-gray-600 dark:text-slate-400 mb-4"><strong>Pros:</strong></p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400 mb-4">
          <li>Real-time — you get events within seconds</li>
          <li>Efficient — no wasted requests</li>
          <li>Scalable — works the same with 1 or 1000 event sources</li>
          <li>Event-driven — fits naturally into modern architectures</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400 mb-4"><strong>Cons:</strong></p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>You need to expose an endpoint — more attack surface</li>
          <li>You need to handle retries — what if your server is down?</li>
          <li>Security — you need to verify signatures</li>
          <li>Ordering — events might arrive out of order</li>
        </ul>
      </section>

      {/* Comparison */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Side-by-Side</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Aspect</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Polling</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Webhooks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3">Latency</td><td className="px-4 py-3">Minutes</td><td className="px-4 py-3">Seconds</td></tr>
              <tr><td className="px-4 py-3">Efficiency</td><td className="px-4 py-3">Low (wasted requests)</td><td className="px-4 py-3">High (push only)</td></tr>
              <tr><td className="px-4 py-3">Complexity</td><td className="px-4 py-3">Simple</td><td className="px-4 py-3">Medium</td></tr>
              <tr><td className="px-4 py-3">Scaling</td><td className="px-4 py-3">Hard</td><td className="px-4 py-3">Easy</td></tr>
              <tr><td className="px-4 py-3">Reliability</td><td className="px-4 py-3">You control timing</td><td className="px-4 py-3">Depends on sender</td></tr>
              <tr><td className="px-4 py-3">Rate limits</td><td className="px-4 py-3">You hit them</td><td className="px-4 py-3">Sender manages</td></tr>
            </tbody>
          </table></div>
        </div>
      </section>

      {/* When to Use Each */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">When to Use Each</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4"><strong>Use polling when:</strong></p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400 mb-4">
          <li>The other system doesn&apos;t support webhooks</li>
          <li>You need data at a fixed interval (daily reports)</li>
          <li>Latency doesn&apos;t matter (batch processing)</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400 mb-4"><strong>Use webhooks when:</strong></p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>You need real-time updates (payments, orders, user actions)</li>
          <li>You&apos;re building event-driven architecture</li>
          <li>You want to reduce API calls and costs</li>
          <li>You&apos;re integrating with modern SaaS platforms</li>
        </ul>
      </section>

      {/* How HookSniff Helps */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How HookSniff Helps</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          HookSniff solves the downsides of webhooks:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>Retries</strong> — Automatic retries with exponential backoff</li>
          <li><strong>Signatures</strong> — HMAC-SHA256 verification built in</li>
          <li><strong>Monitoring</strong> — Full delivery visibility</li>
          <li><strong>DLQ</strong> — Failed deliveries preserved for replay</li>
          <li><strong>FIFO</strong> — Ordered delivery per endpoint</li>
        </ul>
      </section>
    </article>
  );
}
