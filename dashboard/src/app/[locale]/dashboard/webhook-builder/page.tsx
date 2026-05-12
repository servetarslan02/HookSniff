'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { apiFetch } from '@/lib/api';

/* ─── Webhook Builder — Visual webhook creator ─── */
interface WebhookField {
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
}

const TEMPLATES = {
  'order.created': {
    fields: [
      { key: 'order_id', value: 'ord_123', type: 'string' as const },
      { key: 'total', value: '49.99', type: 'number' as const },
      { key: 'currency', value: 'USD', type: 'string' as const },
      { key: 'customer_id', value: 'cus_abc', type: 'string' as const },
    ],
  },
  'payment.completed': {
    fields: [
      { key: 'payment_id', value: 'pay_xyz', type: 'string' as const },
      { key: 'amount', value: '99.00', type: 'number' as const },
      { key: 'status', value: 'succeeded', type: 'string' as const },
      { key: 'method', value: 'card', type: 'string' as const },
    ],
  },
  'user.created': {
    fields: [
      { key: 'user_id', value: 'usr_456', type: 'string' as const },
      { key: 'email', value: 'user@example.com', type: 'string' as const },
      { key: 'plan', value: 'pro', type: 'string' as const },
    ],
  },
};

export default function WebhookBuilderPage() {
  const t = useTranslations('webhookBuilder');
  const tc = useTranslations('common');
  const { token } = useAuth();
  const { toast } = useToast();
  const [eventType, setEventType] = useState('order.created');
  const [fields, setFields] = useState<WebhookField[]>(TEMPLATES['order.created'].fields);
  const [endpointId, setEndpointId] = useState('');
  const [sending, setSending] = useState(false);
  const [preview, setPreview] = useState('');

  const updatePreview = () => {
    const payload: Record<string, unknown> = {};
    fields.forEach((f) => {
      if (f.key) {
        if (f.type === 'number') payload[f.key] = parseFloat(f.value) || 0;
        else if (f.type === 'boolean') payload[f.key] = f.value === 'true';
        else payload[f.key] = f.value;
      }
    });
    setPreview(JSON.stringify({ event: eventType, data: payload }, null, 2));
  };

  const loadTemplate = (name: string) => {
    const template = TEMPLATES[name as keyof typeof TEMPLATES];
    if (template) {
      setEventType(name);
      setFields([...template.fields]);
    }
  };

  const addField = () => {
    setFields([...fields, { key: '', value: '', type: 'string' }]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, patch: Partial<WebhookField>) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], ...patch };
    setFields(updated);
  };

  const handleSend = async () => {
    if (!token || !endpointId) {
      toast(t('selectEndpointFirst'), 'error');
      return;
    }
    setSending(true);
    try {
      const payload: Record<string, unknown> = {};
      fields.forEach((f) => {
        if (f.key) {
          if (f.type === 'number') payload[f.key] = parseFloat(f.value) || 0;
          else if (f.type === 'boolean') payload[f.key] = f.value === 'true';
          else payload[f.key] = f.value;
        }
      });
      await apiFetch('/webhooks', {
        method: 'POST',
        body: { endpoint_id: endpointId, event: eventType, data: payload },
        token: token || undefined,
      });
      toast(t('webhookSent'), 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : t('sendFailed'), 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          {t('subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Builder */}
        <div className="space-y-6">
          {/* Templates */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('templates')}</h2>
            <div className="flex gap-2">
              {Object.keys(TEMPLATES).map((name) => (
                <button
                  key={name}
                  onClick={() => loadTemplate(name)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-mono transition ${
                    eventType === name
                      ? 'bg-brand-600 text-white'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Event Type */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('eventType')}</h2>
            <input
              type="text"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              placeholder="order.created"
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm"
            />
          </div>

          {/* Fields */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('payloadFields')}</h2>
              <button type="button" onClick={addField} className="text-sm text-brand-600 dark:text-brand-400 hover:underline">{t('addField')}</button>
            </div>
            <div className="space-y-3">
              {fields.map((field, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <select
                    value={field.type}
                    onChange={(e) => updateField(i, { type: e.target.value as WebhookField['type'] })}
                    className="px-2 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white w-24"
                  >
                    <option value="string">{t('typeStr')}</option>
                    <option value="number">{t('typeNum')}</option>
                    <option value="boolean">{t('typeBool')}</option>
                  </select>
                  <input
                    type="text"
                    value={field.key}
                    onChange={(e) => updateField(i, { key: e.target.value })}
                    placeholder="field_name"
                    className="flex-1 px-3 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm"
                  />
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) => updateField(i, { value: e.target.value })}
                    placeholder="value"
                    className="flex-1 px-3 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm"
                  />
                  <button type="button"
                    onClick={() => removeField(i)}
                    aria-label={tc('delete')}
                    className="px-3 py-3 text-red-500 hover:text-red-700 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Send */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('sendTo')}</h2>
            <input
              type="text"
              value={endpointId}
              onChange={(e) => setEndpointId(e.target.value)}
              placeholder={t('endpointPlaceholder')}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm mb-3"
            />
            <button type="button"
              onClick={handleSend}
              disabled={sending || !endpointId}
              className="w-full px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition disabled:opacity-50"
            >
              {sending ? t('sending') : t('sendWebhook')}
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <div className="glass-card p-6 sticky top-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('preview')}</h2>
              <button type="button"
                onClick={updatePreview}
                className="text-sm text-brand-600 dark:text-brand-400 hover:underline"
              >
                {t('refresh')}
              </button>
            </div>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm font-mono overflow-x-auto min-h-[200px]">
              <code>{preview || t('previewHint')}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
