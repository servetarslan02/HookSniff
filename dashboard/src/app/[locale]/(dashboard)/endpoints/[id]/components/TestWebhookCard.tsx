'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { apiFetch } from '@/lib/api';

export function TestWebhookCard({
  endpointId,
  endpointUrl,
}: {
  endpointId: string;
  endpointUrl: string;
}) {
  const t = useTranslations('endpointSettings');
  const { token } = useAuth();
  const { toast } = useToast();
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const handleSendTestWebhook = async () => {
    if (!token || !endpointId) return;
    setTestSending(true);
    setTestResult(null);
    try {
      await apiFetch('/webhooks', {
        method: 'POST',
        body: {
          endpoint_id: endpointId,
          event: 'test.ping',
          data: {
            test: true,
            message: 'Hello from HookSniff! 🪝',
            timestamp: new Date().toISOString(),
            endpoint_url: endpointUrl,
          },
        },
        token,
      });
      setTestResult('success');
      toast(t('toastTestSent'), 'success');
    } catch (err: unknown) {
      setTestResult('error');
      const msg = err instanceof Error ? err.message : t('toastTestFailed');
      toast(msg, 'error');
    } finally {
      setTestSending(false);
    }
  };

  return (
    <div className="glass-card p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('testWebhookTitle')}</h2>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
        {t('testWebhookDesc')}
      </p>
      <div className="flex items-center gap-4">
        <button type="button"
          onClick={handleSendTestWebhook}
          disabled={testSending}
          className="px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition disabled:opacity-50 flex items-center gap-2"
        >
          {testSending ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {t('sending')}
            </>
          ) : (
            <>{t('sendTestWebhook')}</>
          )}
        </button>
        {testResult === 'success' && (
          <span className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-1">
            {t('testSent')}
          </span>
        )}
        {testResult === 'error' && (
          <span className="text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-1">
            {t('testFailed')}
          </span>
        )}
      </div>
      <div className="mt-3 text-xs text-gray-500 dark:text-slate-500">
        {t('payloadLabel')} <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm">{"{"}&quot;event&quot;: &quot;test.ping&quot;, &quot;data&quot;: {"{"}&quot;message&quot;: &quot;Hello from HookSniff! 🪝&quot;{"}"}{"}"}</code>
      </div>
    </div>
  );
}
