import CodeBlock from '@/components/CodeBlock';
import Link from 'next/link';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Build Stripe-like Webhooks',
  description: 'Step-by-step guide to building a production-grade webhook system like Stripe',
};

export default function BuildStripeLikePage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Build Stripe-like Webhooks</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Stripe&apos;s webhook system is the gold standard. Here&apos;s how to build something similar with HookSniff.
      </p>

      {/* What Makes Stripe Webhooks Great */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What Makes Stripe Webhooks Great?</h2>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>Event types</strong> — Clear naming: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">payment_intent.succeeded</code></li>
          <li><strong>Idempotency</strong> — Events have unique IDs for deduplication</li>
          <li><strong>Signatures</strong> — HMAC-SHA256 verification with timestamp</li>
          <li><strong>Retries</strong> — Automatic retries with exponential backoff</li>
          <li><strong>Dashboard</strong> — Full delivery visibility with replay</li>
          <li><strong>API</strong> — Programmatic access to events and delivery status</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          HookSniff gives you all of this out of the box.
        </p>
      </section>

      {/* Step 1: Define Event Types */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Step 1: Define Event Types</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Use the <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">resource.action</code> pattern:
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Step 2: Create Endpoints for Customers</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          When a customer registers for webhooks, create an endpoint:
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
          The response includes a <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">signing_secret</code> — share this with your customer for signature verification.
        </p>
      </section>

      {/* Step 3: Send Events */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Step 3: Send Events</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          When something happens in your app, send an event:
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Step 4: Give Customers the Portal</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Embed the HookSniff portal so customers can manage their own webhooks:
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Step 5: Document for Customers</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Give your customers:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>Signing secret</strong> — For verifying webhook signatures</li>
          <li><strong>Event types list</strong> — What events you send</li>
          <li><strong>Payload format</strong> — What the data looks like</li>
          <li><strong>Verification code</strong> — Example code in their language</li>
          <li><strong>Portal link</strong> — Where they can manage endpoints and view deliveries</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          Copy the verification examples from <Link href="/docs/security" className="text-brand-600 hover:text-brand-700">Security</Link> for your docs.
        </p>
      </section>
    </article>
  );
}
