import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Debug Failed Webhooks',
  description: 'How to investigate and fix failed webhook deliveries',
};

export default function DebugFailedWebhooksPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Debug Failed Webhooks</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        A webhook failed. Now what? Here&apos;s how to find out why and fix it.
      </p>

      {/* Step 1: Find the failed delivery */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Step 1: Find the Failed Delivery</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">Search for failed deliveries via the API:</p>
        <CodeBlock
          code={`curl "https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks?status=failed&per_page=10" \\
  -H "Authorization: Bearer hr_live_YOUR_KEY"`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4">Or use the dashboard: go to <strong>Deliveries</strong> → filter by <strong>Failed</strong> status.</p>
      </section>

      {/* Step 2: Check attempt details */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Step 2: Check Attempt Details</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">Each delivery has attempt details showing exactly what happened:</p>
        <CodeBlock
          code={`curl "https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks/wh_xyz789/attempts" \\
  -H "Authorization: Bearer hr_live_YOUR_KEY"`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4 mb-4">Look for:</p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>Status code</strong> — What HTTP status did your endpoint return?</li>
          <li><strong>Response body</strong> — Did your endpoint return an error message?</li>
          <li><strong>Duration</strong> — Did the request timeout (30s limit)?</li>
          <li><strong>Timestamp</strong> — When did each attempt happen?</li>
        </ul>
      </section>

      {/* Common failure patterns */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Common Failure Patterns</h2>

        <div className="space-y-6 not-prose">
          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">500 Internal Server Error</h4>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">Your endpoint has a bug. Check your server logs for the timestamp of the delivery attempt.</p>
            <p className="text-sm text-gray-500 dark:text-slate-500">Fix: Debug your endpoint code, fix the bug, then replay the delivery.</p>
          </div>

          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">401 Unauthorized</h4>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">Your endpoint is rejecting the request. Check if you&apos;re verifying the HookSniff signature correctly.</p>
            <p className="text-sm text-gray-500 dark:text-slate-500">Fix: Make sure you&apos;re using the correct signing secret and the verification code is correct.</p>
          </div>

          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">404 Not Found</h4>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">Your endpoint URL is wrong or the route doesn&apos;t exist.</p>
            <p className="text-sm text-gray-500 dark:text-slate-500">Fix: Check the endpoint URL. Make sure the path is correct and the server is running.</p>
          </div>

          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Connection Timeout</h4>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">Your endpoint took more than 30 seconds to respond.</p>
            <p className="text-sm text-gray-500 dark:text-slate-500">Fix: Return 200 immediately and process asynchronously. See Best Practices.</p>
          </div>

          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">DNS Failure</h4>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">The domain in your endpoint URL doesn&apos;t resolve.</p>
            <p className="text-sm text-gray-500 dark:text-slate-500">Fix: Check the URL spelling. Make sure DNS is configured correctly.</p>
          </div>
        </div>
      </section>

      {/* Step 3: Fix and replay */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Step 3: Fix and Replay</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">After fixing the issue on your endpoint, replay the failed delivery:</p>
        <CodeBlock
          code={`curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks/wh_xyz789/replay \\
  -H "Authorization: Bearer hr_live_YOUR_KEY"`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4">Or replay from the dashboard with one click. The delivery will be re-queued with a fresh retry schedule.</p>
      </section>
    </article>
  );
}
