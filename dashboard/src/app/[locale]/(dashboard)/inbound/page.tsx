'use client';

import { useState } from 'react';
import { useToast } from '@/components/Toast';
import { API_BASE } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { useEndpoints, useInboundConfigs, useCreateInboundConfig } from '@/hooks/useDashboardData';

const PROVIDERS = [
  { id: 'stripe', name: 'Stripe', icon: '💳', docs: 'https://stripe.com/docs/webhooks' },
  { id: 'github', name: 'GitHub', icon: '🐙', docs: 'https://docs.github.com/en/webhooks' },
  { id: 'shopify', name: 'Shopify', icon: '🛒', docs: 'https://shopify.dev/docs/api/admin-rest/resources/webhook' },
  { id: 'generic', name: 'Generic', icon: '🔗', docs: '#' },
];

export default function InboundPage() {
  const { toast } = useToast();
  const t = useTranslations();

  const { data: endpoints = [] } = useEndpoints();
  const { data: configs = [] } = useInboundConfigs();
  const createMutation = useCreateInboundConfig();

  const [showCreate, setShowCreate] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedEndpoint, setSelectedEndpoint] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');

  const handleCreate = async () => {
    if (!selectedProvider) return;
    try {
      await createMutation.mutateAsync({
        provider: selectedProvider,
        endpoint_id: selectedEndpoint || null,
        secret: webhookSecret,
      });
      toast(t('configCreated'), 'success');
      setShowCreate(false);
    } catch {
      toast(t('configFailed'), 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">📨 {t('inbound.title')}</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('inbound.subtitle')}</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 transition">
          + {t('inbound.addProvider')}
        </button>
      </div>

      {/* How it works */}
      <div className="glass-card p-6 bg-linear-to-r from-brand-50 to-purple-50 dark:from-brand-500/5 dark:to-purple-500/5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{t('inbound.howItWorks')}</h3>
        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-400">
          <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 font-mono text-xs">{t('inbound.externalService')}</span>
          <span>→</span>
          <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 font-mono text-xs">POST /v1/inbound/:provider</span>
          <span>→</span>
          <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 font-mono text-xs">{t('inbound.verifySignature')}</span>
          <span>→</span>
          <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 font-mono text-xs">{t('inbound.yourEndpoint')}</span>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('inbound.addProvider')}</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PROVIDERS.map(p => (
              <button key={p.id} onClick={() => setSelectedProvider(p.id)}
                className={`p-4 rounded-xl border-2 text-center transition ${selectedProvider === p.id ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'}`}>
                <div className="text-2xl mb-1">{p.icon}</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">{p.name}</div>
              </button>
            ))}
          </div>

          {selectedProvider && (
            <>
              <div>
                <label htmlFor="inbound-webhook-secret" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('inbound.webhookSecret')}</label>
                <input id="inbound-webhook-secret" value={webhookSecret} onChange={e => setWebhookSecret(e.target.value)} placeholder="whsec_..." type="password" autoComplete="off"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono" />
                <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">{t('inbound.secretHint', { provider: selectedProvider })}</p>
              </div>

              <div>
                <label htmlFor="inbound-route-endpoint" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('inbound.routeToEndpoint')}</label>
                <select id="inbound-route-endpoint" value={selectedEndpoint} onChange={e => setSelectedEndpoint(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
                  <option value="">{t('inbound.selectEndpoint')}</option>
                  {endpoints.map(ep => <option key={ep.id} value={ep.id}>{ep.url}</option>)}
                </select>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCreate} disabled={createMutation.isPending} className="bg-brand-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 transition disabled:opacity-50">{t('inbound.save')}</button>
                <button onClick={() => setShowCreate(false)} className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition">{t('inbound.cancel')}</button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Inbound URL info */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{t('inbound.yourUrls')}</h3>
        <div className="space-y-2">
          {PROVIDERS.map(p => (
            <div key={p.id} className="flex items-center gap-3">
              <span className="text-lg">{p.icon}</span>
              <code className="flex-1 px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-950 text-xs font-mono text-gray-700 dark:text-slate-300">
                POST {API_BASE}/inbound/{p.id}
              </code>
              <button onClick={() => navigator.clipboard.writeText(`${API_BASE}/inbound/${p.id}`)} className="text-xs text-brand-600 dark:text-brand-400 hover:underline">{t('inbound.copy')}</button>
            </div>
          ))}
        </div>
      </div>

      {/* Existing configs */}
      {configs.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{t('inbound.activeConfigs')}</h3>
          <div className="space-y-3">
            {configs.map(cfg => {
              const provider = PROVIDERS.find(p => p.id === cfg.provider);
              const endpoint = endpoints.find(ep => ep.id === cfg.endpoint_id);
              return (
                <div key={cfg.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-950">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{provider?.icon || '🔗'}</span>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{provider?.name || cfg.provider}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">→ {endpoint?.url || t('inbound.notSet')}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.enabled ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-gray-100 text-gray-500'}`}>
                    {cfg.enabled ? t('active') : t('disabled')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
