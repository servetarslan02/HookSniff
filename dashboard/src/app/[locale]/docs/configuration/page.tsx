import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Configuration Reference',
  description: 'All environment variables and configuration options for HookSniff',
};

export default function ConfigurationPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Configuration Reference</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        All environment variables and configuration options for self-hosting HookSniff.
      </p>

      {/* Database */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Database</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Variable</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Default</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3 font-mono text-sm">DATABASE_URL</td><td className="px-4 py-3">—</td><td className="px-4 py-3">PostgreSQL connection string (required)</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">REDIS_URL</td><td className="px-4 py-3">—</td><td className="px-4 py-3">Redis connection string (optional, for rate limiting)</td></tr>
            </tbody>
          </table></div>
        </div>
      </section>

      {/* Server */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Server</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Variable</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Default</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3 font-mono text-sm">PORT</td><td className="px-4 py-3">3000</td><td className="px-4 py-3">API server port</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">APP_ENV</td><td className="px-4 py-3">development</td><td className="px-4 py-3">Environment: development, staging, production</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">RUST_LOG</td><td className="px-4 py-3">info</td><td className="px-4 py-3">Log level: trace, debug, info, warn, error</td></tr>
            </tbody>
          </table></div>
        </div>
      </section>

      {/* Security */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Security</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Variable</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Default</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3 font-mono text-sm">JWT_SECRET</td><td className="px-4 py-3">—</td><td className="px-4 py-3">Secret for JWT token signing (required, 64+ chars)</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">HMAC_SECRET</td><td className="px-4 py-3">—</td><td className="px-4 py-3">Global HMAC secret for webhook signing (required)</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">MASTER_API_KEY</td><td className="px-4 py-3">—</td><td className="px-4 py-3">Admin API key for platform management (optional)</td></tr>
            </tbody>
          </table></div>
        </div>
      </section>

      {/* Webhooks */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Webhook Delivery</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Variable</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Default</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3 font-mono text-sm">MAX_PAYLOAD_BYTES</td><td className="px-4 py-3">1048576</td><td className="px-4 py-3">Max webhook payload size (1 MB)</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">DELIVERY_TIMEOUT_SECS</td><td className="px-4 py-3">30</td><td className="px-4 py-3">HTTP delivery timeout</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">MAX_RETRY_ATTEMPTS</td><td className="px-4 py-3">3</td><td className="px-4 py-3">Default max retry attempts</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">WEBHOOK_FORMAT</td><td className="px-4 py-3">standard</td><td className="px-4 py-3">Webhook format: standard, cloudevents</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">WEBHOOK_TIMESTAMP_TOLERANCE_SECS</td><td className="px-4 py-3">300</td><td className="px-4 py-3">Signature timestamp tolerance (5 min)</td></tr>
            </tbody>
          </table></div>
        </div>
      </section>

      {/* Retention */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Data Retention</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Variable</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Default</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3 font-mono text-sm">RETENTION_DAYS</td><td className="px-4 py-3">30</td><td className="px-4 py-3">Days to keep delivered events</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">DLQ_RETENTION_DAYS</td><td className="px-4 py-3">30</td><td className="px-4 py-3">Days to keep DLQ entries</td></tr>
            </tbody>
          </table></div>
        </div>
      </section>

      {/* URLs */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">URLs</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Variable</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Default</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3 font-mono text-sm">API_BASE_URL</td><td className="px-4 py-3">http://localhost:3000</td><td className="px-4 py-3">API server base URL</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">DASHBOARD_URL</td><td className="px-4 py-3">http://localhost:3001</td><td className="px-4 py-3">Dashboard URL</td></tr>
            </tbody>
          </table></div>
        </div>
      </section>

      {/* Example .env */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Example .env</h2>
        <CodeBlock
          code={`# Database
DATABASE_URL=postgresql://hooksniff:hooksniff@postgres:5432/hooksniff
REDIS_URL=redis://redis:6379

# Server
PORT=3000
APP_ENV=production
RUST_LOG=info

# Security (CHANGE THESE!)
JWT_SECRET=your-64-char-random-hex-string
HMAC_SECRET=your-64-char-random-hex-string

# Webhooks
MAX_PAYLOAD_BYTES=1048576
DELIVERY_TIMEOUT_SECS=30
MAX_RETRY_ATTEMPTS=3

# URLs
API_BASE_URL=https://api.hooksniff.com
DASHBOARD_URL=https://hooksniff.com`}
        />
      </section>
    </article>
  );
}
