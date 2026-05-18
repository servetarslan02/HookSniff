import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Dashboard Guide',
  description: 'Learn how to use the HookSniff dashboard to manage webhooks',
};

export default function DashboardPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Dashboard Guide</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        The dashboard is your command center. Everything you need to manage webhooks is here — no CLI required.
      </p>

      {/* The Problem */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Why a Dashboard?</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          APIs are great for automation, but sometimes you need to:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>Quickly check if a webhook was delivered</li>
          <li>See why a delivery failed without writing code</li>
          <li>Replay a failed webhook with one click</li>
          <li>Monitor delivery health across all endpoints</li>
          <li>Manage team access without sharing API keys</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          The HookSniff dashboard gives you all of this through a web UI.
        </p>
      </section>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Overview</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          The dashboard provides a real-time view of your webhook infrastructure:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>Delivery stats</strong> — Total deliveries, success rate, pending count at a glance</li>
          <li><strong>Activity charts</strong> — Visualize delivery volume and failure rates over time</li>
          <li><strong>Recent deliveries</strong> — Quick access to the latest webhook events</li>
          <li><strong>Endpoint health</strong> — See which endpoints are healthy or experiencing issues</li>
        </ul>
      </section>

      {/* Endpoint Management */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Endpoint Management</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Create, configure, and manage your webhook endpoints:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>Create endpoints</strong> — Set URL, description, event filters, and retry policies</li>
          <li><strong>Rotate secrets</strong> — Generate new signing secrets; old secrets remain valid for 24 hours</li>
          <li><strong>Enable/Disable</strong> — Toggle endpoints without deleting them</li>
          <li><strong>Event filtering</strong> — Configure which event types are delivered to each endpoint</li>
          <li><strong>Custom retry policies</strong> — Set different retry behavior per endpoint</li>
        </ul>
      </section>

      {/* Delivery Monitoring */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Delivery Monitoring</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Inspect every webhook delivery with full detail:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>Delivery log</strong> — Search and filter by status, event type, endpoint, and date range</li>
          <li><strong>Attempt details</strong> — View each retry attempt with status code, response body, and timing</li>
          <li><strong>Replay</strong> — Re-queue failed deliveries with one click</li>
          <li><strong>Export</strong> — Download delivery logs as CSV for external analysis</li>
        </ul>
      </section>

      {/* Analytics */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Analytics</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Understand your webhook performance over time:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>Success rate</strong> — Track delivery success percentage per endpoint</li>
          <li><strong>Latency</strong> — Monitor response times and identify slow endpoints</li>
          <li><strong>Volume trends</strong> — See webhook volume patterns by hour, day, or month</li>
          <li><strong>Failure analysis</strong> — Breakdown of failure reasons and error codes</li>
        </ul>
      </section>

      {/* Team Collaboration */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Team Collaboration</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Work together with your team:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>Multiple API keys</strong> — Create keys per team member or service</li>
          <li><strong>Activity log</strong> — Track who created, modified, or deleted resources</li>
          <li><strong>Shared dashboard</strong> — All team members see the same webhook data</li>
          <li><strong>Role-based access</strong> — Admin, member, and viewer roles</li>
        </ul>
      </section>

      {/* Settings */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Settings</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Configure your account and preferences:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>API keys</strong> — Create, rotate, and revoke API keys</li>
          <li><strong>Billing</strong> — View usage, upgrade plan, manage subscription via Polar.sh</li>
          <li><strong>Alerts</strong> — Set up notifications for delivery failures or high error rates</li>
          <li><strong>Default retry policy</strong> — Set organization-wide retry defaults</li>
        </ul>
      </section>

      {/* Access */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access the Dashboard</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Cloud: <a href="https://hooksniff.vercel.app" className="text-brand-600 hover:text-brand-700" target="_blank" rel="noopener noreferrer">hooksniff.vercel.app</a>
        </p>
        <p className="text-gray-600 dark:text-slate-400">
          Self-hosted: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">http://localhost:3001</code> (default port)
        </p>
      </section>
    </article>
  );
}
