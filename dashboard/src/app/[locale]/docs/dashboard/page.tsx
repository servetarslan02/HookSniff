import { useTranslations } from 'next-intl';

export default function DashboardPage() {
  const t = useTranslations(\'docs\');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t("dashboardGuide")}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        The HookSniff dashboard is your command center for managing webhooks, monitoring deliveries, and configuring your account.
      </p>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("overview")}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          The dashboard provides a real-time view of your webhook infrastructure:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>{t("deliveryStats")}</strong> — Total deliveries, success rate, pending count at a glance</li>
          <li><strong>{t("activityCharts")}</strong> — Visualize delivery volume and failure rates over time</li>
          <li><strong>{t("recentDeliveries")}</strong> — Quick access to the latest webhook events</li>
          <li><strong>{t("endpointHealth")}</strong> — See which endpoints are healthy or experiencing issues</li>
        </ul>
      </section>

      {/* Endpoint Management */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("endpointManagement")}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Create, configure, and manage your webhook endpoints:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>{t("createEndpoints")}</strong> — Set URL, description, event filters, and retry policies</li>
          <li><strong>{t("rotateSecrets")}</strong> — Generate new signing secrets; old secrets remain valid for 24 hours</li>
          <li><strong>Enable/Disable</strong> — Toggle endpoints without deleting them</li>
          <li><strong>{t("customHeaders")}</strong> — Add custom HTTP headers to webhook deliveries</li>
          <li><strong>{t("eventFiltering")}</strong> — Configure which event types are delivered to each endpoint</li>
        </ul>
      </section>

      {/* Delivery Monitoring */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("deliveryMonitoring")}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Inspect every webhook delivery with full detail:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>{t("deliveryLog")}</strong> — Search and filter deliveries by status, event type, endpoint, and date range</li>
          <li><strong>{t("attemptDetails")}</strong> — View each retry attempt with status code, response body, and timing</li>
          <li><strong>{t("replay")}</strong> — Re-queue failed deliveries with one click</li>
          <li><strong>{t("export")}</strong> — Download delivery logs as CSV for external analysis</li>
        </ul>
      </section>

      {/* Analytics */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("analytics")}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Understand your webhook performance over time:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>{t("successRate")}</strong> — Track delivery success percentage per endpoint</li>
          <li><strong>{t("latency")}</strong> — Monitor response times and identify slow endpoints</li>
          <li><strong>{t("volumeTrends")}</strong> — See webhook volume patterns by hour, day, or month</li>
          <li><strong>{t("failureAnalysis")}</strong> — Breakdown of failure reasons and error codes</li>
        </ul>
      </section>

      {/* Team Collaboration */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("teamCollaboration")}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Work together with your team:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>{t("multipleApiKeys")}</strong> — Create keys per team member or service</li>
          <li><strong>{t("activityLog")}</strong> — Track who created, modified, or deleted resources</li>
          <li><strong>{t("sharedDashboard")}</strong> — All team members see the same webhook data</li>
        </ul>
      </section>

      {/* Settings */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("settings")}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Configure your account and preferences:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>{t("apiKeys")}</strong> — Create, rotate, and revoke API keys</li>
          <li><strong>{t("billing")}</strong> — View usage, upgrade plan, manage subscription via Stripe</li>
          <li><strong>{t("alerts")}</strong> — Set up notifications for delivery failures or high error rates</li>
          <li><strong>{t("defaultRetryPolicy")}</strong> — Set organization-wide retry defaults</li>
          <li><strong>{t("payloadLimits")}</strong> — Configure max payload size per plan</li>
        </ul>
      </section>
    </article>
  );
}
