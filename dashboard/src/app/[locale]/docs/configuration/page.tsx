import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Configuration Reference',
  description: 'All environment variables and configuration options for HookSniff',
};

export default async function ConfigurationPage() {
  const t = await getTranslations('docsConfiguration');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('title')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        {t('subtitle')}
      </p>

      {/* Database */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('database')}</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('variable')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('default')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('description')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3 font-mono text-sm">DATABASE_URL</td><td className="px-4 py-3">—</td><td className="px-4 py-3">{t('dbUrl')}</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">REDIS_URL</td><td className="px-4 py-3">—</td><td className="px-4 py-3">{t('redisUrl')}</td></tr>
            </tbody>
          </table></div>
        </div>
      </section>

      {/* Server */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('server')}</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('variable')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('default')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('description')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3 font-mono text-sm">PORT</td><td className="px-4 py-3">3000</td><td className="px-4 py-3">{t('port')}</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">APP_ENV</td><td className="px-4 py-3">development</td><td className="px-4 py-3">{t('appEnv')}</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">RUST_LOG</td><td className="px-4 py-3">info</td><td className="px-4 py-3">{t('rustLog')}</td></tr>
            </tbody>
          </table></div>
        </div>
      </section>

      {/* Security */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('security')}</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('variable')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('default')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('description')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3 font-mono text-sm">JWT_SECRET</td><td className="px-4 py-3">—</td><td className="px-4 py-3">{t('jwtSecret')}</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">HMAC_SECRET</td><td className="px-4 py-3">—</td><td className="px-4 py-3">{t('hmacSecret')}</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">MASTER_API_KEY</td><td className="px-4 py-3">—</td><td className="px-4 py-3">{t('masterApiKey')}</td></tr>
            </tbody>
          </table></div>
        </div>
      </section>

      {/* Webhooks */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('webhookDelivery')}</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('variable')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('default')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('description')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3 font-mono text-sm">MAX_PAYLOAD_BYTES</td><td className="px-4 py-3">1048576</td><td className="px-4 py-3">{t('maxPayload')}</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">DELIVERY_TIMEOUT_SECS</td><td className="px-4 py-3">30</td><td className="px-4 py-3">{t('deliveryTimeout')}</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">MAX_RETRY_ATTEMPTS</td><td className="px-4 py-3">3</td><td className="px-4 py-3">{t('maxRetry')}</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">WEBHOOK_FORMAT</td><td className="px-4 py-3">standard</td><td className="px-4 py-3">{t('webhookFormat')}</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">WEBHOOK_TIMESTAMP_TOLERANCE_SECS</td><td className="px-4 py-3">300</td><td className="px-4 py-3">{t('timestampTolerance')}</td></tr>
            </tbody>
          </table></div>
        </div>
      </section>

      {/* Retention */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('dataRetention')}</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('variable')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('default')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('description')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3 font-mono text-sm">RETENTION_DAYS</td><td className="px-4 py-3">30</td><td className="px-4 py-3">{t('retentionDays')}</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">DLQ_RETENTION_DAYS</td><td className="px-4 py-3">30</td><td className="px-4 py-3">{t('dlqRetention')}</td></tr>
            </tbody>
          </table></div>
        </div>
      </section>

      {/* URLs */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('urls')}</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('variable')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('default')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('description')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3 font-mono text-sm">API_BASE_URL</td><td className="px-4 py-3">http://localhost:3000</td><td className="px-4 py-3">{t('apiBaseUrl')}</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">DASHBOARD_URL</td><td className="px-4 py-3">http://localhost:3001</td><td className="px-4 py-3">{t('dashboardUrl')}</td></tr>
            </tbody>
          </table></div>
        </div>
      </section>

      {/* Example .env */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('exampleEnv')}</h2>
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
