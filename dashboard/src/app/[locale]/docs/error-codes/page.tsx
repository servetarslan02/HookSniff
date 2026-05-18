import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Error Codes',
  description: 'HookSniff API error codes reference',
};

export default async function ErrorCodesPage() {
  const t = await getTranslations('docsErrorCodes');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('title')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        {t('subtitle')}
      </p>

      {/* Error Format */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('errorFormat')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('errorFormatDesc')}
        </p>
        <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm font-mono overflow-x-auto">
{`{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid request body or parameters"
  }
}`}
        </pre>
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          {t('codeField')}
        </p>
      </section>

      {/* Error Codes Table */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('httpStatuses')}</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('status')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('code')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('meaning')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('commonCause')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3 font-mono">400</td><td className="px-4 py-3 font-mono">BAD_REQUEST</td><td className="px-4 py-3">{t('badRequest')}</td><td className="px-4 py-3">{t('badRequestCause')}</td></tr>
              <tr><td className="px-4 py-3 font-mono">401</td><td className="px-4 py-3 font-mono">UNAUTHORIZED</td><td className="px-4 py-3">{t('unauthorized')}</td><td className="px-4 py-3">{t('unauthorizedCause')}</td></tr>
              <tr><td className="px-4 py-3 font-mono">403</td><td className="px-4 py-3 font-mono">FORBIDDEN</td><td className="px-4 py-3">{t('forbidden')}</td><td className="px-4 py-3">{t('forbiddenCause')}</td></tr>
              <tr><td className="px-4 py-3 font-mono">404</td><td className="px-4 py-3 font-mono">NOT_FOUND</td><td className="px-4 py-3">{t('notFound')}</td><td className="px-4 py-3">{t('notFoundCause')}</td></tr>
              <tr><td className="px-4 py-3 font-mono">409</td><td className="px-4 py-3 font-mono">CONFLICT</td><td className="px-4 py-3">{t('conflict')}</td><td className="px-4 py-3">{t('conflictCause')}</td></tr>
              <tr><td className="px-4 py-3 font-mono">413</td><td className="px-4 py-3 font-mono">PAYLOAD_TOO_LARGE</td><td className="px-4 py-3">{t('payloadTooLarge')}</td><td className="px-4 py-3">{t('payloadTooLargeCause')}</td></tr>
              <tr><td className="px-4 py-3 font-mono">429</td><td className="px-4 py-3 font-mono">RATE_LIMIT_EXCEEDED</td><td className="px-4 py-3">{t('rateLimited')}</td><td className="px-4 py-3">{t('rateLimitedCause')}</td></tr>
              <tr><td className="px-4 py-3 font-mono">500</td><td className="px-4 py-3 font-mono">INTERNAL_ERROR</td><td className="px-4 py-3">{t('internalError')}</td><td className="px-4 py-3">{t('internalErrorCause')}</td></tr>
            </tbody>
          </table></div>
        </div>
      </section>

      {/* Common Errors */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('commonErrors')}</h2>

        <div className="space-y-6">
          <div className="p-5 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">401 UNAUTHORIZED</code>
            </h3>
            <p className="text-gray-600 dark:text-slate-400 mb-3">{t('unauthorizedDesc')}</p>
            <p className="text-sm text-gray-500 dark:text-slate-500">
              <strong>{t('fix')}:</strong> {t('unauthorizedFix')}
            </p>
          </div>

          <div className="p-5 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">400 BAD_REQUEST</code> — {t('badRequestEndpoint')}
            </h3>
            <p className="text-gray-600 dark:text-slate-400 mb-3">{t('badRequestEndpointDesc')}</p>
            <p className="text-sm text-gray-500 dark:text-slate-500">
              <strong>{t('fix')}:</strong> {t('badRequestEndpointFix')}
            </p>
          </div>

          <div className="p-5 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">429 RATE_LIMIT_EXCEEDED</code>
            </h3>
            <p className="text-gray-600 dark:text-slate-400 mb-3">{t('rateLimitedDesc')}</p>
            <p className="text-sm text-gray-500 dark:text-slate-500">
              <strong>{t('fix')}:</strong> {t('rateLimitedFix')}
            </p>
          </div>

          <div className="p-5 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">403 FORBIDDEN</code> — {t('forbiddenLimit')}
            </h3>
            <p className="text-gray-600 dark:text-slate-400 mb-3">{t('forbiddenLimitDesc')}</p>
            <p className="text-sm text-gray-500 dark:text-slate-500">
              <strong>{t('fix')}:</strong> {t('forbiddenLimitFix')}
            </p>
          </div>

          <div className="p-5 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">413 PAYLOAD_TOO_LARGE</code>
            </h3>
            <p className="text-gray-600 dark:text-slate-400 mb-3">{t('payloadTooLargeDesc')}</p>
            <p className="text-sm text-gray-500 dark:text-slate-500">
              <strong>{t('fix')}:</strong> {t('payloadTooLargeFix')}
            </p>
          </div>
        </div>
      </section>

      {/* Idempotency Errors */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('idempotencyErrors')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('idempotencyDesc')}
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>{t('idempotencyCached')}</li>
          <li>{t('idempotencyConflict')}</li>
          <li>{t('idempotencyExpire')}</li>
        </ul>
      </section>
    </article>
  );
}
