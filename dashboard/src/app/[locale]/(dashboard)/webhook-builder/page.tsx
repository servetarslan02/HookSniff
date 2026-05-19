'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/components/Toast';
import { useEndpoints, useCreateWebhook } from '@/hooks/useDashboardData';
import { AlertTriangle, Check, ClipboardList, Eye, FileText, Rocket, Trash2, X, Zap } from 'lucide-react';

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
  const { toast } = useToast();
  const { data: endpoints = [], isLoading: loadingEndpoints } = useEndpoints();
  const createWebhook = useCreateWebhook();

  const [eventType, setEventType] = useState('order.created');
  const [fields, setFields] = useState<WebhookField[]>(TEMPLATES['order.created'].fields);
  const [endpointId, setEndpointId] = useState('');
  const [preview, setPreview] = useState('');
  const [lastSentPayload, setLastSentPayload] = useState<string | null>(null);

  /** Build payload object from fields */
  const buildPayload = useCallback(() => {
    const payload: Record<string, unknown> = {};
    fields.forEach((f) => {
      if (f.key.trim()) {
        if (f.type === 'number') payload[f.key] = parseFloat(f.value) || 0;
        else if (f.type === 'boolean') payload[f.key] = f.value === 'true';
        else payload[f.key] = f.value;
      }
    });
    return { event: eventType, data: payload };
  }, [fields, eventType]);

  /** Auto-update preview when fields or event type change */
  useEffect(() => {
    const payload = buildPayload();
    setPreview(JSON.stringify(payload, null, 2));
  }, [buildPayload]);

  const loadTemplate = (name: string) => {
    const template = TEMPLATES[name as keyof typeof TEMPLATES];
    if (template) {
      setEventType(name);
      setFields([...template.fields]);
      setLastSentPayload(null);
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

  const clearAll = useCallback(() => {
    setEventType('');
    setFields([{ key: '', value: '', type: 'string' }]);
    setEndpointId('');
    setPreview('');
    setLastSentPayload(null);
  }, []);

  const handleSend = () => {
    if (!endpointId) {
      toast(t('selectEndpointFirst'), 'error');
      return;
    }
    // Validate: at least one non-empty key
    const hasValidField = fields.some((f) => f.key.trim());
    if (!hasValidField) {
      toast(t('addFieldFirst'), 'error');
      return;
    }
    const payload = buildPayload();
    setLastSentPayload(JSON.stringify(payload, null, 2));
    createWebhook.mutate(
      { endpoint_id: endpointId, event: eventType, data: payload.data },
      {
        onSuccess: () => toast(t('webhookSent'), 'success'),
        onError: (err) => toast(err instanceof Error ? err.message : t('sendFailed'), 'error'),
      }
    );
  };

  /** Keyboard shortcut: Ctrl/Cmd + Enter to send */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (endpointId && !createWebhook.isPending) {
        handleSend();
      }
    }
  }, [endpointId, createWebhook.isPending]);

  return (
    <div className="space-y-8" onKeyDown={handleKeyDown}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500">
            <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-700 font-mono text-gray-500 dark:text-slate-400">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-700 font-mono text-gray-500 dark:text-slate-400">Enter</kbd>
            <span>{t('shortcutHint')}</span>
          </div>
          <button
            type="button"
            onClick={clearAll}
            disabled={!eventType && fields.length === 1 && !fields[0].key && !endpointId}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Trash2 size={16} strokeWidth={1.75} className="inline mr-1" /> {t('clearAll')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Builder */}
        <div className="space-y-6">
          {/* Templates */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center"><span className="text-base"><ClipboardList size={18} strokeWidth={1.75} /></span></div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{t('templates')}</h2>
            </div>
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
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center"><span className="text-base"><Zap size={18} strokeWidth={1.75} /></span></div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{t('eventType')}</h2>
            </div>
            <input
              type="text"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              placeholder="order.created"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition font-mono"
            />
          </div>

          {/* Fields */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center"><span className="text-base"><FileText size={18} strokeWidth={1.75} /></span></div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{t('payloadFields')}</h2>
              </div>
              <button type="button" onClick={addField} className="text-sm text-brand-600 dark:text-brand-400 hover:underline">{t('addField')}</button>
            </div>
            <div className="space-y-3">
              {fields.map((field, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <select
                    value={field.type}
                    onChange={(e) => updateField(i, { type: e.target.value as WebhookField['type'] })}
                    className="px-2.5 py-2.5 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition w-28"
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
                    <X size={16} strokeWidth={1.75} className="inline mr-1" /> </button>
                </div>
              ))}
            </div>
          </div>

          {/* Send */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center"><span className="text-base"><Rocket size={18} strokeWidth={1.75} /></span></div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{t('sendTo')}</h2>
            </div>
            {loadingEndpoints ? (
              <div className="flex items-center gap-2 py-3 text-gray-500 dark:text-slate-400 text-sm">
                <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                {t('loadingEndpoints')}
              </div>
            ) : endpoints.length === 0 ? (
              <div className="py-3 text-center">
                <p className="text-gray-500 dark:text-slate-400 text-sm mb-2">{t('noEndpoints')}</p>
                <a href="/core" className="text-sm text-brand-600 dark:text-brand-400 hover:underline">
                  {t('goToCore')}
                </a>
              </div>
            ) : (
              <select
                value={endpointId}
                onChange={(e) => setEndpointId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition font-mono mb-3"
              >
                <option value="">{t('selectEndpoint')}</option>
                {endpoints.map((ep) => (
                  <option key={ep.id} value={ep.id}>
                    {ep.description || ep.url} ({ep.id.slice(0, 8)}...)
                  </option>
                ))}
              </select>
            )}
            <button type="button"
              onClick={handleSend}
              disabled={createWebhook.isPending || !endpointId}
              className="w-full px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition disabled:opacity-50"
            >
              {createWebhook.isPending ? t('sending') : t('sendWebhook')}
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 sticky top-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center"><span className="text-base"><Eye size={18} strokeWidth={1.75} /></span></div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{t('preview')}</h2>
              </div>
              {lastSentPayload && (
                <span className="text-xs px-2 py-1 rounded-full bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 font-medium">
                  <Check size={16} strokeWidth={1.75} className="inline mr-1" /> {t('sent')}
                </span>
              )}
            </div>
            <pre className={`p-4 rounded-xl text-sm font-mono overflow-x-auto min-h-[200px] ${
              lastSentPayload
                ? 'bg-gray-900 border-2 border-green-500/30 text-green-400'
                : 'bg-gray-900 text-green-400'
            }`}>
              <code>{preview || t('previewHint')}</code>
            </pre>
            {lastSentPayload && lastSentPayload !== preview && (
              <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  <AlertTriangle size={16} strokeWidth={1.75} className="inline mr-1" /> {t('previewChanged')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
