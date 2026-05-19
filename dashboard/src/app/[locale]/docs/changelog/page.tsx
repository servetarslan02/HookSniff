import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'HookSniff release history and version notes',
};

export default async function ChangelogPage() {
  const t = await getTranslations('docsChangelog');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('title')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        {t('subtitle')}
      </p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('sdkRelease')}</h2>
        <p className="text-sm text-gray-500 dark:text-slate-500 mb-4">2026-05-17</p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('addedSdks')}</h3>
        <ul className="space-y-1 text-gray-600 dark:text-slate-400 mb-4">
          <li>Node.js SDK v1.0.0</li>
          <li>Python SDK v1.0.0</li>
          <li>Go SDK v1.0.0</li>
          <li>Rust SDK v1.0.0</li>
          <li>Ruby SDK v1.0.0</li>
          <li>Java SDK v1.0.0</li>
          <li>Kotlin SDK v1.0.0</li>
          <li>PHP SDK v1.0.0</li>
          <li>C# SDK v1.0.0</li>
          <li>Swift SDK v1.0.0</li>
          <li>Elixir SDK v1.0.0</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400 mb-4">All SDKs include: auto-retry with exponential backoff, webhook verification (HMAC-SHA256), auto-idempotency key.</p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('addedPlatform')}</h3>
        <ul className="space-y-1 text-gray-600 dark:text-slate-400 mb-4">
          <li>GDPR endpoints: data export + account deletion</li>
          <li>HttpOnly cookie authentication for refresh tokens</li>
          <li>Environments system (dev/staging/prod)</li>
          <li>Environment variables per environment</li>
          <li>Service tokens for programmatic access</li>
          <li>Custom domains support</li>
          <li>SSO support</li>
          <li>Embeddable customer portal</li>
          <li>Inbound webhook proxy (Stripe, GitHub, Shopify)</li>
          <li>Smart routing (round-robin, latency-based, failover)</li>
          <li>Schema registry with JSON validation</li>
          <li>Webhook templates</li>
          <li>Payload transforms</li>
          <li>FIFO ordered delivery</li>
          <li>Per-endpoint throttling</li>
          <li>CloudEvents v1.0 support</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('addedCicd')}</h3>
        <ul className="space-y-1 text-gray-600 dark:text-slate-400 mb-4">
          <li>Local CI scripts</li>
          <li>GitHub Actions workflows (CI, SDK publish, deploy, security scan)</li>
          <li>SDK publish support for npm, PyPI, crates.io, RubyGems, Maven, NuGet, Hex, Packagist</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('fixed')}</h3>
        <ul className="space-y-1 text-gray-600 dark:text-slate-400">
          <li>Performance indexes for deliveries, delivery_attempts, dead_letters</li>
          <li>ON DELETE CASCADE for foreign keys</li>
          <li>Unbounded list queries capped with LIMIT</li>
          <li>OTLP exporter graceful fallback</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('earlier')}</h2>
        <p className="text-gray-600 dark:text-slate-400">
          {t('earlierDesc')} <a href="https://github.com/servetarslan02/HookSniff/blob/main/CHANGELOG.md" className="text-brand-600 hover:text-brand-700" target="_blank" rel="noopener noreferrer">GitHub</a>.
        </p>
      </section>
    </article>
  );
}
