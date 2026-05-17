import { useTranslations } from 'next-intl';
import type { Metadata } from 'next';

// Revalidate every hour for ISR
export const revalidate = 3600;


export const metadata: Metadata = {
  title: 'Architecture',
  description: "Understand HookSniff's system architecture and design decisions",
};


export default function ArchitecturePage() {
  const t = useTranslations('docs');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t("architecture")}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-4">
        Understanding the architecture helps you debug issues, plan capacity, and make informed decisions about self-hosting.
      </p>
      <p className="text-gray-600 dark:text-slate-400 mb-8">
        HookSniff is built with Rust for performance and reliability. The API handles ingestion, the worker handles delivery, and PostgreSQL handles both storage and queuing.
      </p>

      {/* System Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("systemOverview")}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          HookSniff consists of four main components:
        </p>
        <pre className="bg-gray-900 text-green-400 p-6 rounded-xl text-sm font-mono overflow-x-auto">
{`                            ┌─────────────────┐
                            │    Internet      │
                            └────────┬────────┘
                                     │
                            ┌────────▼────────┐
                            │   TLS Proxy     │
                            │   (Fly.io)      │
                            └────────┬────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
           ┌────────▼───────┐ ┌─────▼─────┐ ┌───────▼───────┐
           │   API Server   │ │ Dashboard │ │  Healthcheck  │
           │   (Axum/Rust)  │ │ (Next.js) │ │   (internal)  │
           └──┬──┬──┬───────┘ └─────┬─────┘ └───────────────┘
              │  │  │               │
              │  │  └───────────────┼────► PostgreSQL (Neon)
              │  │                  │
              └──┼──────────────────┼────► Redis
                 │                  │
                 └──────────────────┼────► PostgreSQL Queue
                                    │
                                    ▼
                              ┌───────────┐
                              │  Worker   │
                              │  (Rust)   │
                              └─────┬─────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
              ┌──────────┐   ┌──────────┐
              │  HTTP    │   │WebSocket │
              │ Delivery │   │ Delivery │
              └──────────┘   └──────────┘`}
        </pre>
      </section>

      {/* Components */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("components")}</h2>

        <div className="space-y-6">
          <div className="p-5 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t("apiServer")}</h3>
            <p className="text-gray-600 dark:text-slate-400 mb-3">
              Async REST API built with <strong>Axum (Rust)</strong>. Handles authentication, webhook ingestion, rate limiting, and idempotency.
            </p>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-slate-400">
              <li>• PostgreSQL via SQLx (Neon in production)</li>
              <li>• PostgreSQL-based queue (<code className="bg-gray-100 dark:bg-slate-800 px-1 py-0.5 rounded-sm text-xs">webhook_queue</code> table)</li>
              <li>• API keys (<code className="bg-gray-100 dark:bg-slate-800 px-1 py-0.5 rounded-sm text-xs">hr_live_*</code>) + JWT auth</li>
              <li>• SSRF protection, payload validation</li>
              <li>• Prometheus metrics at <code className="bg-gray-100 dark:bg-slate-800 px-1 py-0.5 rounded-sm text-xs">/metrics</code></li>
            </ul>
          </div>

          <div className="p-5 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t("worker")}</h3>
            <p className="text-gray-600 dark:text-slate-400 mb-3">
              Webhook delivery engine built with <strong>Rust + Tokio</strong>. Polls the queue and executes deliveries.
            </p>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-slate-400">
              <li>• HTTP and WebSocket delivery backends</li>
              <li>• HMAC-SHA256 payload signing (Standard Webhooks)</li>
              <li>• Fanout: one event → multiple endpoints</li>
              <li>• Exponential backoff retry with jitter</li>
              <li>• Retry scheduler: polls DB every 30s</li>
            </ul>
          </div>

          <div className="p-5 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t("dashboard")}</h3>
            <p className="text-gray-600 dark:text-slate-400 mb-3">
              Web UI built with <strong>Next.js 14 (App Router)</strong>, Tailwind CSS, Radix UI, and Tremor.
            </p>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-slate-400">
              <li>• Endpoint management and monitoring</li>
              <li>• Delivery logs with search and filtering</li>
              <li>• Analytics and charts</li>
              <li>• API key management and billing</li>
            </ul>
          </div>

          <div className="p-5 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Database & Queue</h3>
            <p className="text-gray-600 dark:text-slate-400 mb-3">
              <strong>PostgreSQL</strong> (Neon) serves as both the primary database and message queue.
            </p>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-slate-400">
              <li>• Customers, endpoints, deliveries, attempts</li>
              <li>• <code className="bg-gray-100 dark:bg-slate-800 px-1 py-0.5 rounded-sm text-xs">webhook_queue</code> table for async delivery</li>
              <li>• SSL required (<code className="bg-gray-100 dark:bg-slate-800 px-1 py-0.5 rounded-sm text-xs">sslmode=require</code>)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("technologyStack")}</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t("layer")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t("technology")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t("purpose")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3">API</td><td className="px-4 py-3">Rust, Axum, SQLx</td><td className="px-4 py-3">{t("asyncRestApi")}</td></tr>
              <tr><td className="px-4 py-3">{t("worker")}</td><td className="px-4 py-3">Rust, Tokio</td><td className="px-4 py-3">{t("deliveryEngine")}</td></tr>
              <tr><td className="px-4 py-3">{t("dashboard")}</td><td className="px-4 py-3">Next.js 14, Tailwind CSS</td><td className="px-4 py-3">{t("webui")}</td></tr>
              <tr><td className="px-4 py-3">Database</td><td className="px-4 py-3">PostgreSQL (Neon)</td><td className="px-4 py-3">{t("persistentStorage")}</td></tr>
              <tr><td className="px-4 py-3">Queue</td><td className="px-4 py-3">PostgreSQL</td><td className="px-4 py-3">{t("asyncMessage")}</td></tr>
              <tr><td className="px-4 py-3">{t("auth")}</td><td className="px-4 py-3">JWT + Argon2 + HMAC</td><td className="px-4 py-3">Multi-layer auth</td></tr>
              <tr><td className="px-4 py-3">{t("billing")}</td><td className="px-4 py-3">Stripe</td><td className="px-4 py-3">{t("payments")}</td></tr>
              <tr><td className="px-4 py-3">Deploy</td><td className="px-4 py-3">Fly.io</td><td className="px-4 py-3">{t("productionHosting")}</td></tr>
            </tbody>
          </table></div>
        </div>
      </section>

      {/* Data Flow */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("dataFlow")}</h2>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">1. Webhook Ingestion</h3>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          When you send a webhook via <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">POST /v1/webhooks</code>:
        </p>
        <ol className="space-y-2 text-gray-600 dark:text-slate-400 mb-6">
          <li>1. Authenticate (API key → customer lookup)</li>
          <li>2. Check idempotency key (return cached response if duplicate)</li>
          <li>3. Validate event type format and JSON payload depth</li>
          <li>4. Check payload size (≤ 1 MB) and rate limits</li>
          <li>5. Verify endpoint exists, is active, matches event filter</li>
          <li>6. Insert into <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">deliveries</code> table (status: pending)</li>
          <li>7. Insert into <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">webhook_queue</code> for async processing</li>
          <li>8. Return 200 with delivery ID</li>
        </ol>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">2. Webhook Delivery</h3>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          The Worker polls the queue and delivers webhooks:
        </p>
        <ol className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>1. Poll <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">webhook_queue</code> for pending deliveries</li>
          <li>2. Look up endpoint URL + signing secret</li>
          <li>3. Build HTTP request with Standard Webhooks headers</li>
          <li>4. Send with 30s timeout</li>
          <li>5. On 2xx: mark as delivered, record attempt</li>
          <li>6. On failure: record attempt, schedule retry or mark as failed</li>
        </ol>
      </section>
    </article>
  );
}
