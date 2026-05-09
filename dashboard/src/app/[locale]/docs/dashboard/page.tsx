
export default function DashboardPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Dashboard Guide</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        The HookSniff dashboard is your command center for managing webhooks, monitoring deliveries, and configuring your account.
      </p>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Overview</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          The dashboard provides a real-time view of your webhook infrastructure:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>Delivery Stats</strong> — Total deliveries, success rate, pending count at a glance</li>
          <li><strong>Activity Charts</strong> — Visualize delivery volume and failure rates over time</li>
          <li><strong>Recent Deliveries</strong> — Quick access to the latest webhook events</li>
          <li><strong>Endpoint Health</strong> — See which endpoints are healthy or experiencing issues</li>
        </ul>
      </section>

      {/* Endpoint Management */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Endpoint Management</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Create, configure, and manage your webhook endpoints:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>Create Endpoints</strong> — Set URL, description, event filters, and retry policies</li>
          <li><strong>Rotate Secrets</strong> — Generate new signing secrets; old secrets remain valid for 24 hours</li>
          <li><strong>Enable/Disable</strong> — Toggle endpoints without deleting them</li>
          <li><strong>Custom Headers</strong> — Add custom HTTP headers to webhook deliveries</li>
          <li><strong>Event Filtering</strong> — Configure which event types are delivered to each endpoint</li>
        </ul>
      </section>

      {/* Delivery Monitoring */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Delivery Monitoring</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Inspect every webhook delivery with full detail:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>Delivery Log</strong> — Search and filter deliveries by status, event type, endpoint, and date range</li>
          <li><strong>Attempt Details</strong> — View each retry attempt with status code, response body, and timing</li>
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
          <li><strong>Success Rate</strong> — Track delivery success percentage per endpoint</li>
          <li><strong>Latency</strong> — Monitor response times and identify slow endpoints</li>
          <li><strong>Volume Trends</strong> — See webhook volume patterns by hour, day, or month</li>
          <li><strong>Failure Analysis</strong> — Breakdown of failure reasons and error codes</li>
        </ul>
      </section>

      {/* Team Collaboration */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Team Collaboration</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Work together with your team:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>Multiple API Keys</strong> — Create keys per team member or service</li>
          <li><strong>Activity Log</strong> — Track who created, modified, or deleted resources</li>
          <li><strong>Shared Dashboard</strong> — All team members see the same webhook data</li>
        </ul>
      </section>

      {/* Settings */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Settings</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Configure your account and preferences:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>API Keys</strong> — Create, rotate, and revoke API keys</li>
          <li><strong>Billing</strong> — View usage, upgrade plan, manage subscription via Stripe</li>
          <li><strong>Alerts</strong> — Set up notifications for delivery failures or high error rates</li>
          <li><strong>Default Retry Policy</strong> — Set organization-wide retry defaults</li>
          <li><strong>Webhook Payload Limits</strong> — Configure max payload size per plan</li>
        </ul>
      </section>
    </article>
  );
}
