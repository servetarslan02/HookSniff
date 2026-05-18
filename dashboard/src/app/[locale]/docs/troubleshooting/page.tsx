import Link from 'next/link';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Troubleshooting',
  description: 'Common issues and solutions for HookSniff webhook deliveries',
};

export default function TroubleshootingPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Troubleshooting</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Something not working? Here are the most common issues and how to fix them.
      </p>

      {/* Webhooks not arriving */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Webhooks Not Arriving at Your Endpoint</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4"><strong>Symptoms:</strong> You send a webhook via API, but your endpoint never receives it.</p>
        <p className="text-gray-600 dark:text-slate-400 mb-4"><strong>Possible causes:</strong></p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400 mb-4">
          <li><strong>Endpoint is inactive</strong> — Check if the endpoint is enabled in the dashboard</li>
          <li><strong>Event filter mismatch</strong> — The webhook&apos;s event type doesn&apos;t match the endpoint&apos;s filter</li>
          <li><strong>SSRF protection</strong> — HookSniff blocks delivery to localhost, private IPs, and internal domains</li>
          <li><strong>Firewall blocking</strong> — Your server might be blocking HookSniff&apos;s outbound IPs</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400"><strong>Fix:</strong> Check delivery status with <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">GET /v1/webhooks</code> and look at the delivery details for error messages.</p>
      </section>

      {/* 401 Unauthorized */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">401 Unauthorized</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4"><strong>Symptoms:</strong> Every API request returns 401.</p>
        <p className="text-gray-600 dark:text-slate-400 mb-4"><strong>Possible causes:</strong></p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400 mb-4">
          <li>API key is missing or malformed — must be <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">Bearer hr_live_...</code></li>
          <li>API key was deleted or rotated</li>
          <li>Using a JWT token instead of an API key for programmatic access</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400"><strong>Fix:</strong> Create a new API key in the dashboard and update your environment variable.</p>
      </section>

      {/* Signature verification failing */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Signature Verification Failing</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4"><strong>Symptoms:</strong> Your endpoint rejects webhooks with &quot;Invalid signature&quot;.</p>
        <p className="text-gray-600 dark:text-slate-400 mb-4"><strong>Possible causes:</strong></p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400 mb-4">
          <li><strong>Wrong secret</strong> — Use the endpoint&apos;s current signing secret, not an old one</li>
          <li><strong>Body modification</strong> — Express.js body parser modifies the raw body. Use <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">express.raw()</code></li>
          <li><strong>Encoding mismatch</strong> — Verify against the raw request body, not JSON.stringify(parsed)</li>
          <li><strong>Secret rotation</strong> — Old secrets remain valid for 24 hours after rotation</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400"><strong>Fix:</strong> See <Link href="/docs/security" className="text-brand-600 hover:text-brand-700">Security</Link> for correct verification code.</p>
      </section>

      {/* Rate limited */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">429 Rate Limited</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4"><strong>Symptoms:</strong> API requests return 429 Too Many Requests.</p>
        <p className="text-gray-600 dark:text-slate-400 mb-4"><strong>Cause:</strong> You&apos;ve exceeded your plan&apos;s requests-per-minute limit.</p>
        <p className="text-gray-600 dark:text-slate-400"><strong>Fix:</strong> Wait for the <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">Retry-After</code> header duration, then retry with exponential backoff. See <Link href="/docs/rate-limiting" className="text-brand-600 hover:text-brand-700">Rate Limiting</Link> for details.</p>
      </section>

      {/* Deliveries stuck in pending */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Deliveries Stuck in Pending</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4"><strong>Symptoms:</strong> Webhooks show as &quot;pending&quot; for a long time.</p>
        <p className="text-gray-600 dark:text-slate-400 mb-4"><strong>Possible causes:</strong></p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400 mb-4">
          <li><strong>Worker is down</strong> — The delivery worker might not be running</li>
          <li><strong>Queue backlog</strong> — High volume might cause delays</li>
          <li><strong>Endpoint timeout</strong> — Your endpoint takes too long to respond (30s limit)</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400"><strong>Fix:</strong> Check worker status with <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">make status</code> (self-hosted) or check the dashboard health indicator (cloud).</p>
      </section>

      {/* High failure rate */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">High Failure Rate</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4"><strong>Symptoms:</strong> Many deliveries are failing.</p>
        <p className="text-gray-600 dark:text-slate-400 mb-4"><strong>Possible causes:</strong></p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400 mb-4">
          <li><strong>Endpoint returning 5xx</strong> — Your server has an issue</li>
          <li><strong>Endpoint returning 4xx</strong> — Your endpoint is rejecting requests (check auth)</li>
          <li><strong>DNS failure</strong> — Your endpoint URL is unreachable</li>
          <li><strong>TLS error</strong> — Certificate issue on your endpoint</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400"><strong>Fix:</strong> Check the delivery attempts in the dashboard for specific error messages. See <Link href="/docs/debug-failed-webhooks" className="text-brand-600 hover:text-brand-700">Debug Failed Webhooks</Link>.</p>
      </section>

      {/* Webhook limit reached */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Webhook Limit Reached</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4"><strong>Symptoms:</strong> API returns 403 with &quot;webhook limit exceeded&quot;.</p>
        <p className="text-gray-600 dark:text-slate-400 mb-4"><strong>Cause:</strong> You&apos;ve reached your plan&apos;s monthly webhook limit.</p>
        <p className="text-gray-600 dark:text-slate-400"><strong>Fix:</strong> Check usage with <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">GET /v1/billing/usage</code>. Upgrade your plan or wait for the next billing period.</p>
      </section>

      {/* Getting help */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Still Need Help?</h2>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>Check the <Link href="/docs/error-codes" className="text-brand-600 hover:text-brand-700">Error Codes</Link> reference</li>
          <li>Review <Link href="/docs/debug-failed-webhooks" className="text-brand-600 hover:text-brand-700">Debug Failed Webhooks</Link> guide</li>
          <li>Open an issue on <a href="https://github.com/servetarslan02/HookSniff" className="text-brand-600 hover:text-brand-700" target="_blank" rel="noopener noreferrer">GitHub</a></li>
        </ul>
      </section>
    </article>
  );
}
