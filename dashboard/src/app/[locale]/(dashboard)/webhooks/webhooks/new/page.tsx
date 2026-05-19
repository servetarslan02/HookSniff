'use client';

import { getErrorMessage } from '@/lib/errors';

import { useState } from 'react';
import { useToast } from '@/components/Toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useTranslations } from 'next-intl';
import { useEndpoints, useCreateWebhook } from '@/hooks/useDashboardData';
import { AlertTriangle, Radio } from 'lucide-react';

export default function SendWebhookPage() {
  const { toast } = useToast();
  const { data: endpoints = [] } = useEndpoints();
  const createWebhook = useCreateWebhook();
  const [endpointId, setEndpointId] = useState('');
  const [eventType, setEventType] = useState('');
  const [payload, setPayload] = useState('{\n  "message": "Hello from HookSniff!"\n}');
  const [response, setResponse] = useState<unknown>(null);
  const [jsonError, setJsonError] = useState('');
  const t = useTranslations('webhooks');
  const tc = useTranslations('common');

  const validateJson = (val: string) => {
    try {
      JSON.parse(val);
      setJsonError('');
    } catch (e: unknown) {
      setJsonError(getErrorMessage(e, tc('unknownError')));
    }
  };

  const handleSend = () => {
    if (!endpointId) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(payload);
    } catch {
      toast(t('invalidJson'), 'error');
      return;
    }
    setResponse(null);
    createWebhook.mutate(
      { endpoint_id: endpointId, event: eventType || undefined, data: parsed },
      {
        onSuccess: (res) => {
          setResponse(res);
          toast(t('sendSuccess'), 'success');
        },
        onError: (err: unknown) => {
          setResponse({ error: getErrorMessage(err, tc('unknownError')) });
          toast(t('sendFailed'), 'error');
        },
      }
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('configuration')}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('endpointLabel')}</label>
              <select
                value={endpointId}
                onChange={(e) => setEndpointId(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-brand-500"
              >
                <option value="">{t('selectEndpoint')}</option>
                {endpoints.map((ep) => (
                  <option key={ep.id} value={ep.id}>{ep.url}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('eventTypeLabel')}</label>
              <input
                type="text"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                placeholder={t('eventTypePlaceholder')}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('payloadJson')}</label>
              <textarea
                value={payload}
                onChange={(e) => { setPayload(e.target.value); validateJson(e.target.value); }}
                rows={10}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl font-mono text-sm focus:ring-2 focus:ring-brand-500 resize-none"
                spellCheck={false}
              />
              {jsonError && <p className="text-xs text-red-600 mt-1"><AlertTriangle size={16} strokeWidth={1.75} className="inline mr-1" /> {jsonError}</p>}
            </div>
            <button type="button"
              onClick={handleSend}
              disabled={createWebhook.isPending || !endpointId || !!jsonError}
              className="w-full bg-brand-600 dark:bg-brand-500 text-white py-3 rounded-xl font-semibold hover:bg-brand-700 dark:hover:bg-brand-600 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {createWebhook.isPending ? <><LoadingSpinner size="sm" /> {tc('sending')}</> : t('sendWebhook')}
            </button>
          </div>
        </div>

        {/* Response */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('responseTitle')}</h2>
          {response ? (
            <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm font-mono overflow-auto max-h-[500px]">
              {JSON.stringify(response, null, 2)}
            </pre>
          ) : (
            <div className="text-center text-gray-500 dark:text-slate-500 py-12">
              <div className="text-4xl mb-3"><Radio size={18} strokeWidth={1.75} /></div>
              <p>{t('sendToSeeResponse')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
