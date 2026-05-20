'use client';


import { useState } from 'react';
import { useToast } from '@/components/Toast';
import { API_BASE } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { useEndpoints, useInboundConfigs, useCreateInboundConfig, useUpdateInboundConfig, useDeleteInboundConfig } from '@/hooks/useDashboardData';
import type { InboundConfigValidated } from '@/schemas/api';
import ConfirmDialog from '@/components/ConfirmDialog';
import { CreditCard, Download, FileText, Gamepad2, GitBranch, Inbox, Link2, MessageSquare, Pencil, ShoppingBag, Smartphone, Trash2, TriangleRight } from '@/components/icons';

const PROVIDERS = [
  { id: 'stripe', name: 'Stripe', icon: <CreditCard size={16} strokeWidth={1.75} />, docs: 'https://stripe.com/docs/webhooks', sig: 'HMAC-SHA256 (v1)' },
  { id: 'github', name: 'GitHub', icon: <GitBranch size={16} strokeWidth={1.75} />, docs: 'https://docs.github.com/en/webhooks', sig: 'HMAC-SHA256' },
  { id: 'shopify', name: 'Shopify', icon: <ShoppingBag size={16} strokeWidth={1.75} />, docs: 'https://shopify.dev/docs/api/admin-rest/resources/webhook', sig: 'HMAC-SHA256' },
  { id: 'slack', name: 'Slack', icon: <MessageSquare size={16} strokeWidth={1.75} />, docs: 'https://api.slack.com/apis/events-api', sig: 'HMAC-SHA256 (v0)' },
  { id: 'twilio', name: 'Twilio', icon: <Smartphone size={16} strokeWidth={1.75} />, docs: 'https://www.twilio.com/docs/usage/webhooks', sig: 'HMAC-SHA1' },
  { id: 'discord', name: 'Discord', icon: <Gamepad2 size={16} strokeWidth={1.75} />, docs: 'https://discord.com/developers/docs/interactions/receiving-and-responding', sig: 'Ed25519' },
  { id: 'linear', name: 'Linear', icon: <TriangleRight size={16} strokeWidth={1.75} />, docs: 'https://developers.linear.app/docs/notifications/webhooks', sig: 'HMAC-SHA256' },
  { id: 'notion', name: 'Notion', icon: <FileText size={16} strokeWidth={1.75} />, docs: 'https://developers.notion.com/docs/webhooks', sig: 'HMAC-SHA256' },
  { id: 'generic', name: 'Generic', icon: <Link2 size={16} strokeWidth={1.75} />, docs: '#', sig: 'HMAC-SHA256 (custom header)' },
];

export function InboundContent() {
  const { toast } = useToast();
  const t = useTranslations();
  const tc = useTranslations('common');

  const { data: endpoints = [] } = useEndpoints();
  const { data: configs = [] } = useInboundConfigs();
  const createMutation = useCreateInboundConfig();
  const updateMutation = useUpdateInboundConfig();
  const deleteMutation = useDeleteInboundConfig();

  const [showCreate, setShowCreate] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedEndpoint, setSelectedEndpoint] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');

  const [editTarget, setEditTarget] = useState<string | null>(null);
  const [editSecret, setEditSecret] = useState('');
  const [editEndpoint, setEditEndpoint] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const resetForm = () => {
    setSelectedProvider('');
    setSelectedEndpoint('');
    setWebhookSecret('');
  };

  const handleCreate = async () => {
    if (!selectedProvider) return;
    try {
      await createMutation.mutateAsync({
        provider: selectedProvider,
        endpoint_id: selectedEndpoint || null,
        secret: webhookSecret,
      });
      toast(t('inbound.configCreated'), 'success');
      setShowCreate(false);
      resetForm();
    } catch {
      toast(t('inbound.configFailed'), 'error');
    }
  };

  const handleEdit = (cfg: InboundConfigValidated) => {
    setEditTarget(cfg.id);
    setEditSecret('');
    setEditEndpoint(cfg.endpoint_id ?? '');
  };

  const handleUpdate = async () => {
    if (!editTarget) return;
    try {
      const data: { secret?: string; endpoint_id?: string | null } = {};
      if (editSecret) data.secret = editSecret;
      if (editEndpoint !== undefined) data.endpoint_id = editEndpoint || null;
      await updateMutation.mutateAsync({ id: editTarget, data });
      toast(t('inbound.configUpdated'), 'success');
      setEditTarget(null);
    } catch {
      toast(t('inbound.updateFailed'), 'error');
    }
  };

  const handleToggle = async (cfg: InboundConfigValidated) => {
    try {
      await updateMutation.mutateAsync({ id: cfg.id, data: { enabled: !cfg.enabled } });
      toast(cfg.enabled ? t('inbound.disabled') : t('inbound.enabled'), 'success');
    } catch {
      toast(t('inbound.updateFailed'), 'error');
    }
  };

  const handleDelete = (id: string) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget);
      toast(t('inbound.configDeleted'), 'info');
    } catch {
      toast(t('inbound.deleteFailed'), 'error');
    }
    setDeleteTarget(null);
  };

  const copyUrl = (providerId: string, endpointId?: string) => {
    if (endpointId) {
      navigator.clipboard.writeText(`${API_BASE}/inbound/${providerId}/${endpointId}`);
    } else {
      navigator.clipboard.writeText(`${API_BASE}/inbound/${providerId}/{endpoint_id}`);
    }
    toast(t('inbound.copied'), 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white"><Inbox size={24} strokeWidth={1.75} className="inline mr-1" />{t('inbound.title')}</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('inbound.subtitle')}</p>
        </div>
        <button onClick={() => { setShowCreate(!showCreate); setEditTarget(null); resetForm(); }} className="bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 transition">
          + {t('inbound.addProvider')}
        </button>
      </div>


      {/* Create form */}
      {showCreate && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('inbound.addProvider')}</h3>

          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {PROVIDERS.map(p => (
              <button key={p.id} onClick={() => setSelectedProvider(p.id)}
                className={`p-4 rounded-xl border-2 text-center transition ${selectedProvider === p.id ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'}`}>
                <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center justify-center gap-1.5"><span className="text-2xl flex-shrink-0">{p.icon}</span>{p.name}</div>
                <div className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">{p.sig}</div>
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
                <button onClick={() => { setShowCreate(false); resetForm(); }} className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition">{t('inbound.cancel')}</button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Inbound URL info */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{t('inbound.yourUrls')}</h3>
        <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
          {t('inbound.urlExplanation')}
        </p>
        {configs.length > 0 ? (
          <div className="space-y-2">
            {configs.filter(c => c.enabled && c.endpoint_id).map(cfg => {
              const provider = PROVIDERS.find(p => p.id === cfg.provider);
              if (!provider) return null;
              return (
                <div key={cfg.id} className="flex items-center gap-3">
                  <span className="text-lg w-8 text-center">{provider.icon}</span>
                  <code className="flex-1 px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-950 text-xs font-mono text-gray-700 dark:text-slate-300 truncate">
                    POST {API_BASE}/inbound/{provider.id}/{cfg.endpoint_id}
                  </code>
                  <span className="text-[10px] text-gray-400 dark:text-slate-500 w-24 text-right">{provider.sig}</span>
                  <button onClick={() => copyUrl(provider.id, cfg.endpoint_id ?? undefined)} className="text-xs text-brand-600 dark:text-brand-400 hover:underline whitespace-nowrap">{t('inbound.copy')}</button>
                </div>
              );
            })}
            {configs.filter(c => c.enabled && c.endpoint_id).length === 0 && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                {t('inbound.noEndpointsConfigured')}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {PROVIDERS.filter(p => p.id !== 'generic').map(p => (
              <div key={p.id} className="flex items-center gap-3 opacity-50">
                <span className="text-lg w-8 text-center">{p.icon}</span>
                <code className="flex-1 px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-950 text-xs font-mono text-gray-700 dark:text-slate-300 truncate">
                  POST {API_BASE}/inbound/{p.id}/{'{endpoint_id}'}
                </code>
                <span className="text-[10px] text-gray-400 dark:text-slate-500 w-24 text-right">{p.sig}</span>
              </div>
            ))}
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
              {t('inbound.createConfigFirst')}
            </p>
          </div>
        )}
      </div>

      {/* Existing configs */}
      {configs.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{t('inbound.activeConfigs')} ({configs.length})</h3>
          <div className="space-y-3">
            {configs.map(cfg => {
              const provider = PROVIDERS.find(p => p.id === cfg.provider);
              const endpoint = endpoints.find(ep => ep.id === cfg.endpoint_id);
              const isEditing = editTarget === cfg.id;

              return (
                <div key={cfg.id} className={`p-4 rounded-xl border transition ${isEditing ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-500/5' : 'border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-950'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{provider?.icon || <Link2 size={16} strokeWidth={1.75} />}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{provider?.name || cfg.provider}</div>
                        <div className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-2">
                          <span>→ {endpoint?.url || t('inbound.notSet')}</span>
                          {provider?.sig && <span className="px-1.5 py-0.5 bg-gray-200 dark:bg-slate-700 rounded text-[10px]">{provider.sig}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleToggle(cfg)} title={cfg.enabled ? t('inbound.disable') : t('inbound.enable')}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${cfg.enabled ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                        {cfg.enabled ? t('inbound.active') : t('inbound.disabled')}
                      </button>
                      <button onClick={() => handleEdit(cfg)} title={t('inbound.edit')} className="text-gray-500 dark:text-slate-400 hover:text-brand-600 transition p-2"><Pencil size={18} strokeWidth={1.75} /></button>
                      <button onClick={() => handleDelete(cfg.id)} title={t('inbound.delete')} className="text-gray-500 dark:text-slate-400 hover:text-red-600 transition p-2"><Trash2 size={18} strokeWidth={1.75} /></button>
                    </div>
                  </div>

                  {/* Edit form inline */}
                  {isEditing && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">{t('inbound.newSecret')}</label>
                        <input value={editSecret} onChange={e => setEditSecret(e.target.value)} type="password" autoComplete="off" placeholder={t('inbound.leaveEmpty')}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">{t('inbound.routeToEndpoint')}</label>
                        <select value={editEndpoint} onChange={e => setEditEndpoint(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
                          <option value="">{t('inbound.selectEndpoint')}</option>
                          {endpoints.map(ep => <option key={ep.id} value={ep.id}>{ep.url}</option>)}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleUpdate} disabled={updateMutation.isPending} className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition disabled:opacity-50">{t('inbound.saveChanges')}</button>
                        <button onClick={() => setEditTarget(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition">{tc('cancel')}</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {configs.length === 0 && !showCreate && (
        <div className="glass-card p-12 text-center">
          <div className="text-5xl mb-4"><Download size={18} strokeWidth={1.75} /></div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('inbound.noConfigs')}</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{t('inbound.noConfigsDesc')}</p>
          <button onClick={() => setShowCreate(true)} className="bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 transition">
            + {t('inbound.addProvider')}
          </button>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title={t('inbound.deleteConfig')}
        message={t('inbound.deleteConfirm')}
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
