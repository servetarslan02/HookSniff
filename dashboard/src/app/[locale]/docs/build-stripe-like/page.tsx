import CodeBlock from '@/components/CodeBlock';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Build Stripe-like Webhooks',
  description: 'Step-by-step guide to building a production-grade webhook system like Stripe',
};

export default async function BuildStripeLikePage() {
  const t = await getTranslations('docsBuildStripeLike');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('title')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        {t('subtitle')}
      </p>

      {/* What Makes Stripe Webhooks Great */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('whatMakesStripeGreat')}</h2>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>{t('eventTypes')}</strong> — {t('eventTypesDesc')} <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">payment_intent.succeeded</code></li>
          <li><strong>{t('idempotency')}</strong> — {t('idempotencyDesc')}</li>
          <li><strong>{t('signatures')}</strong> — {t('signaturesDesc')}</li>
          <li><strong>{t('retries')}</strong> — {t('retriesDesc')}</li>
          <li><strong>{t('dashboard')}</strong> — {t('dashboardDesc')}</li>
          <li><strong>{t('api')}</strong> — {t('apiDesc')}</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          {t('hooksniffGivesAll')}
        </p>
      </section>

      {/* Step 1: Define Event Types */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('step1Title')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('step1Desc')}
        </p>
        <CodeBlock
          code={`order.created
order.updated
order.cancelled
payment.succeeded
payment.failed
user.created
user.updated
invoice.paid
invoice.overdue`}
        />
      </section>

      {/* Step 2: Create Endpoints */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('step2Title')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('step2Desc')}
        </p>
        <CodeBlock
          code={`curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/endpoints \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://customer.com/webhooks",
    "description": "Customer order notifications",
    "event_filter": "order.*"
  }'`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          {t('step2Note')}
        </p>
      </section>

      {/* Step 3: Send Events */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('step3Title')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('step3Desc')}
        </p>
        <CodeBlock
          code={`curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: order-12345-created" \\
  -d '{
    "endpoint_id": "ep_abc123",
    "event": "order.created",
    "data": {
      "id": "ord_12345",
      "customer_id": "cus_789",
      "total": 99.99,
      "currency": "USD",
      "items": [
        { "product_id": "prod_1", "quantity": 2, "price": 49.99 }
      ],
      "created_at": "2026-01-15T10:30:00Z"
    }
  }'`}
        />
      </section>

      {/* Step 4: Give Customers the Portal */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('step4Title')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('step4Desc')}
        </p>
        <CodeBlock
          code={`<script src="https://cdn.hooksniff.com/portal.js"></script>
<script>
  HookSniffPortal.init({
    apiKey: 'hr_live_CUSTOMER_KEY',
    containerId: 'webhook-portal',
    theme: 'light',
    branding: {
      logo: 'https://yourapp.com/logo.svg',
      primaryColor: '#6366f1',
    },
  });
</script>
<div id="webhook-portal"></div>`}
        />
      </section>

      {/* Step 5: Document for Customers */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('step5Title')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('step5Desc')}
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>{t('signingSecret')}</strong> — {t('signingSecretDesc')}</li>
          <li><strong>{t('eventTypesList')}</strong> — {t('eventTypesListDesc')}</li>
          <li><strong>{t('payloadFormat')}</strong> — {t('payloadFormatDesc')}</li>
          <li><strong>{t('verificationCode')}</strong> — {t('verificationCodeDesc')}</li>
          <li><strong>{t('portalLink')}</strong> — {t('portalLinkDesc')}</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          {t('copyVerification')} <Link href="/docs/security" className="text-brand-600 hover:text-brand-700">Security</Link>
        </p>
      </section>
    </article>
  );
}
