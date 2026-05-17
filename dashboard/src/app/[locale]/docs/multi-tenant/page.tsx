import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Multi-Tenant Architecture',
  description: 'Use HookSniff to build multi-tenant webhook systems',
};

export default function MultiTenantPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Multi-Tenant Architecture</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Building a SaaS platform? Use HookSniff to let each customer manage their own webhooks.
      </p>

      {/* The Problem */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">The Problem</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          If you&apos;re a SaaS platform, your customers need webhooks. But you don&apos;t want to build webhook management for each customer from scratch — endpoint creation, delivery tracking, retry logic, secret rotation.
        </p>
      </section>

      {/* The Solution */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How HookSniff Handles Multi-Tenancy</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          HookSniff supports multi-tenant webhook management through scoped API keys and the embeddable portal:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>Scoped API keys</strong> — Each customer gets their own API key, scoped to their endpoints and deliveries</li>
          <li><strong>Embeddable portal</strong> — Let customers manage their own webhooks through a white-labeled UI</li>
          <li><strong>Endpoint isolation</strong> — Customers can only see their own endpoints and deliveries</li>
          <li><strong>Per-customer limits</strong> — Set rate limits and webhook quotas per customer</li>
        </ul>
      </section>

      {/* Pattern */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Implementation Pattern</h2>
        <ol className="space-y-3 text-gray-600 dark:text-slate-400">
          <li><strong>1.</strong> When a customer signs up, create a scoped API key for them</li>
          <li><strong>2.</strong> Give them the embeddable portal to manage their endpoints</li>
          <li><strong>3.</strong> When events happen for that customer, send webhooks using their scoped key</li>
          <li><strong>4.</strong> The customer sees only their own deliveries in the portal</li>
        </ol>
      </section>

      {/* Benefits */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Benefits</h2>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>No custom code</strong> — Don&apos;t build webhook management from scratch</li>
          <li><strong>Self-service</strong> — Customers manage their own endpoints and debug failures</li>
          <li><strong>Isolation</strong> — Each customer&apos;s data is isolated</li>
          <li><strong>Scalable</strong> — Works the same with 10 or 10,000 customers</li>
        </ul>
      </section>
    </article>
  );
}
