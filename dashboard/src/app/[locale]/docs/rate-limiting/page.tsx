import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Rate Limiting',
  description: 'Understand how HookSniff rate limits API requests and webhook deliveries',
};

export default async function RateLimitingPage() {
  const t = await getTranslations('docsRateLimiting');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('title')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        {t('subtitle')}
      </p>

      {/* How It Works */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('howItWorks')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('howItWorksDesc')}</p>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('howItWorksNote')}</p>
      </section>

      {/* Plan Limits */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('planLimits')}</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700 mb-4">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('plan')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('price')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('requestsMin')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('webhooksMonth')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('endpoints')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3 font-medium">Developer</td><td className="px-4 py-3">$0</td><td className="px-4 py-3">100</td><td className="px-4 py-3">1,000/gün</td><td className="px-4 py-3">5</td></tr>
              <tr><td className="px-4 py-3 font-medium">Startup</td><td className="px-4 py-3">$24/ay</td><td className="px-4 py-3">500</td><td className="px-4 py-3">30.000/gün</td><td className="px-4 py-3">50</td></tr>
              <tr><td className="px-4 py-3 font-medium">Pro</td><td className="px-4 py-3">$49/ay</td><td className="px-4 py-3">1,000</td><td className="px-4 py-3">100.000/gün</td><td className="px-4 py-3">500</td></tr>
              <tr><td className="px-4 py-3 font-medium">Enterprise</td><td className="px-4 py-3">$149/ay</td><td className="px-4 py-3">Özel</td><td className="px-4 py-3">Sınırsız</td><td className="px-4 py-3">Sınırsız</td></tr>
            </tbody>
          </table></div>
        </div>
        <p className="text-gray-600 dark:text-slate-400">{t('yearlyBilling')}</p>
      </section>

      {/* Response Headers */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('rateLimitHeaders')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('rateLimitHeadersDesc')}</p>
        <CodeBlock
          code={`X-RateLimit-Limit: 500          // Planınızın limiti
X-RateLimit-Remaining: 487      // Pencerede kalan istek
X-RateLimit-Reset: 1705312260   // Pencerenin sıfırlanacağı Unix zaman damgası`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4 mb-4">{t('whenRateLimited')}</p>
        <CodeBlock
          code={`HTTP/1.1 429 Too Many Requests
Retry-After: 30                 // Tekrar denemeden önce beklenecek saniye

{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 30 seconds."
  }
}`}
        />
      </section>

      {/* Handling 429 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('handlingRateLimits')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('handlingDesc')}</p>
        <ol className="space-y-3 text-gray-600 dark:text-slate-400 mb-4">
          <li><strong>1.</strong> {t('handlingStep1')}</li>
          <li><strong>2.</strong> {t('handlingStep2')}</li>
          <li><strong>3.</strong> {t('handlingStep3')}</li>
        </ol>
        <CodeBlock
          code={`async function sendWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url, options);

    if (response.status !== 429) return response;

    const retryAfter = parseInt(response.headers.get('Retry-After') || '30');
    console.log(\`Rate limited. Waiting \${retryAfter}s...\`);
    await new Promise(r => setTimeout(r, retryAfter * 1000));
  }
  throw new Error('Max retries exceeded');
}`}
        />
      </section>

      {/* Webhook Monthly Limits */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('monthlyLimits')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('monthlyLimitsDesc')}</p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400 mb-4">
          <li><strong>{t('developerPlan').split(':')[0]}:</strong>{t('developerPlan').split(':').slice(1).join(':')}</li>
          <li><strong>{t('startupPlan').split(':')[0]}:</strong>{t('startupPlan').split(':').slice(1).join(':')}</li>
          <li><strong>{t('proPlan').split(':')[0]}:</strong>{t('proPlan').split(':').slice(1).join(':')}</li>
          <li><strong>{t('enterprisePlan').split(':')[0]}:</strong>{t('enterprisePlan').split(':').slice(1).join(':')}</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400">{t('checkUsage')} <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">GET /v1/billing/usage</code></p>
      </section>

      {/* Per-Endpoint Throttling */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('perEndpoint')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('perEndpointDesc')}</p>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('perEndpointWhen')}</p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>{t('perEndpointWhen1')}</li>
          <li>{t('perEndpointWhen2')}</li>
          <li>{t('perEndpointWhen3')}</li>
        </ul>
      </section>
    </article>
  );
}
