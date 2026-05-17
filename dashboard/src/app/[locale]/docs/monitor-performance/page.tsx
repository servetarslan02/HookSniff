import Link from 'next/link';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Monitor Webhook Performance',
  description: 'Track delivery metrics, set up alerts, and monitor webhook health',
};

export default function MonitorPerformancePage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Monitor Webhook Performance</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        You can&apos;t fix what you can&apos;t see. Here&apos;s how to monitor your webhook infrastructure.
      </p>

      {/* The Problem */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Why Monitoring Matters</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Webhooks fail silently. If you don&apos;t monitor, you won&apos;t know until a customer complains. By then, you&apos;ve already lost data or revenue.
        </p>
      </section>

      {/* Key Metrics */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Key Metrics to Track</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Metric</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Target</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Alert When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3">Delivery success rate</td><td className="px-4 py-3">&gt;99.5%</td><td className="px-4 py-3">&lt;99%</td></tr>
              <tr><td className="px-4 py-3">P95 delivery latency</td><td className="px-4 py-3">&lt;2s</td><td className="px-4 py-3">&gt;5s</td></tr>
              <tr><td className="px-4 py-3">Consecutive failures per endpoint</td><td className="px-4 py-3">0</td><td className="px-4 py-3">&gt;5</td></tr>
              <tr><td className="px-4 py-3">DLQ depth</td><td className="px-4 py-3">0</td><td className="px-4 py-3">&gt;100</td></tr>
              <tr><td className="px-4 py-3">Retry rate</td><td className="px-4 py-3">&lt;5%</td><td className="px-4 py-3">&gt;10%</td></tr>
            </tbody>
          </table></div>
        </div>
      </section>

      {/* Built-in Monitoring */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Built-in Monitoring</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">HookSniff provides several monitoring tools out of the box:</p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>Dashboard analytics</strong> — Real-time delivery stats, success rate charts, latency graphs</li>
          <li><strong>Endpoint health</strong> — Per-endpoint health status with failure counts</li>
          <li><strong>Delivery logs</strong> — Searchable, filterable log of every delivery attempt</li>
          <li><strong>Alerts</strong> — Configure notifications for failure thresholds</li>
          <li><strong>API endpoint</strong> — <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">GET /v1/stats</code> for programmatic access</li>
        </ul>
      </section>

      {/* Grafana + OpenTelemetry */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Grafana + OpenTelemetry</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          For advanced monitoring, HookSniff exports OpenTelemetry traces and Prometheus metrics. Connect to Grafana Cloud for custom dashboards and alerts.
        </p>
        <p className="text-gray-600 dark:text-slate-400 mb-4">Available metrics:</p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">hooksniff_deliveries_total</code> — Total deliveries by status</li>
          <li><code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">hooksniff_delivery_duration_seconds</code> — Delivery latency histogram</li>
          <li><code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">hooksniff_retries_total</code> — Total retry attempts</li>
          <li><code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">hooksniff_dlq_depth</code> — Current DLQ size</li>
        </ul>
      </section>

      {/* Setting Up Alerts */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Setting Up Alerts</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">Configure alerts in the dashboard to get notified when things go wrong:</p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>Failure rate alert</strong> — Notify when success rate drops below 99%</li>
          <li><strong>Endpoint down alert</strong> — Notify when an endpoint has 5+ consecutive failures</li>
          <li><strong>DLQ alert</strong> — Notify when DLQ has 100+ unprocessed events</li>
          <li><strong>Latency alert</strong> — Notify when P95 latency exceeds 5 seconds</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400 mt-4">See <Link href="/docs/dashboard" className="text-brand-600 hover:text-brand-700">Dashboard Guide</Link> for alert configuration.</p>
      </section>
    </article>
  );
}
