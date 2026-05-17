import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Smart Routing',
  description: 'Route webhooks intelligently with round-robin, latency-based, and failover strategies',
};

export default function SmartRoutingPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Smart Routing</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Not all endpoints are equal. Smart routing distributes webhooks intelligently across multiple endpoints.
      </p>

      {/* The Problem */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">The Problem</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          If you have multiple servers receiving webhooks, you need to decide which one gets each delivery. Simple round-robin doesn&apos;t account for server health or response times.
        </p>
      </section>

      {/* The Solution */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Routing Strategies</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          HookSniff supports three routing strategies per endpoint:
        </p>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700 mb-4">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Strategy</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">How It Works</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Best For</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3 font-medium">Round-Robin</td><td className="px-4 py-3">Distributes evenly across endpoints</td><td className="px-4 py-3">Equal-capacity servers</td></tr>
              <tr><td className="px-4 py-3 font-medium">Latency-Based</td><td className="px-4 py-3">Routes to the fastest-responding endpoint</td><td className="px-4 py-3">Mixed-capacity servers</td></tr>
              <tr><td className="px-4 py-3 font-medium">Failover</td><td className="px-4 py-3">Primary endpoint first, fallback if it fails</td><td className="px-4 py-3">High availability</td></tr>
            </tbody>
          </table></div>
        </div>
      </section>

      {/* Configuration */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Configuration</h2>
        <CodeBlock
          code={`curl -X PUT https://hooksniff-api-1046140057667.europe-west1.run.app/v1/endpoints/ep_abc123/routing \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "strategy": "failover",
    "endpoints": [
      { "url": "https://primary.myapp.com/webhook", "priority": 1 },
      { "url": "https://backup.myapp.com/webhook", "priority": 2 }
    ]
  }'`}
        />
      </section>

      {/* Health Monitoring */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Health Monitoring</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          HookSniff monitors endpoint health automatically. Unhealthy endpoints are deprioritized or skipped:
        </p>
        <CodeBlock
          code={`curl https://hooksniff-api-1046140057667.europe-west1.run.app/v1/endpoints/ep_abc123/health \\
  -H "Authorization: Bearer hr_live_YOUR_KEY"`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          Health status includes success rate, average latency, and consecutive failure count.
        </p>
      </section>
    </article>
  );
}
