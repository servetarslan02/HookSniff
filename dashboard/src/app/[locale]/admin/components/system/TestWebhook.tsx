'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useTestWebhook } from '@/hooks/useAdminData';

export default function TestWebhook() {
  const t = useTranslations('admin');
  const testWebhookMutation = useTestWebhook();

  const [testUrl, setTestUrl] = useState('');
  const [testEvent, setTestEvent] = useState('test.ping');
  const [testPayload, setTestPayload] = useState('{\n  "message": "Hello from HookSniff"\n}');
  const [testResult, setTestResult] = useState<{ status_code: number; response_body: string; duration_ms: number } | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const handleTestWebhook = async () => {
    if (!testUrl) return;
    setTestError(null);
    setTestResult(null);
    try {
      let payload: Record<string, unknown>;
      try {
        payload = JSON.parse(testPayload);
      } catch {
        setTestError('Invalid JSON payload');
        return;
      }
      const result = await testWebhookMutation.mutateAsync({
        endpoint_url: testUrl,
        event_type: testEvent,
        payload,
      });
      setTestResult(result as { status_code: number; response_body: string; duration_ms: number });
    } catch (err) {
      setTestError(err instanceof Error ? err.message : t('testFailed'));
    }
  };

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('testWebhookTitle')}</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('testWebhookDesc')}</p>
      </div>
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="test-url" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              {t('endpointUrl')}
            </label>
            <input
              id="test-url"
              type="url"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="https://example.com/webhook"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-red-500 transition"
            />
          </div>
          <div>
            <label htmlFor="test-event" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              {t('eventType')}
            </label>
            <input
              id="test-event"
              type="text"
              value={testEvent}
              onChange={(e) => setTestEvent(e.target.value)}
              placeholder="test.ping"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-red-500 transition"
            />
          </div>
        </div>

        <div>
          <label htmlFor="test-payload" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            {t('payload')}
          </label>
          <textarea
            id="test-payload"
            value={testPayload}
            onChange={(e) => setTestPayload(e.target.value)}
            rows={4}
            spellCheck={false}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm font-mono placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-red-500 transition resize-y"
          />
        </div>

        <button
          type="button"
          onClick={handleTestWebhook}
          disabled={testWebhookMutation.isPending || !testUrl}
          className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {testWebhookMutation.isPending ? t('testSending') : `🚀 ${t('sendTest')}`}
        </button>

        {testError && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4">
            <span className="text-red-700 dark:text-red-400 text-sm">{testError}</span>
          </div>
        )}

        {testResult && (
          <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg" aria-hidden="true">✅</span>
              <span className="text-sm font-medium text-green-700 dark:text-green-400">{t('testSuccess')}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-500 dark:text-slate-400">{t('responseStatus')}</span>
                <p className={`text-lg font-bold ${
                  testResult.status_code < 400 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {testResult.status_code}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-slate-400">{t('responseTime')}</span>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {testResult.duration_ms}ms
                </p>
              </div>
            </div>
            <div>
              <span className="text-xs text-gray-500 dark:text-slate-400">{t('responseBody')}</span>
              <pre className="mt-1 text-xs font-mono text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-lg p-3 overflow-x-auto max-h-40 border border-gray-200 dark:border-slate-700">
                {testResult.response_body}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
