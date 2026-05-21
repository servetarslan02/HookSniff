'use client';


import { useState } from 'react';
import { useAuth } from '@/lib/store';
import { connectorsApi } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ConfirmDialog from '@/components/ConfirmDialog';
import { CreditCard, FileText, Gamepad2, GitBranch, MessageSquare, Pencil, Phone, Plug, ShoppingBag, Trash2, TriangleRight } from '@/components/icons';

function formatDate(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleString();
}

const PROVIDER_ICONS: Record<string, React.ReactNode> = {
  stripe: <CreditCard size={16} strokeWidth={1.75} />, shopify: <ShoppingBag size={16} strokeWidth={1.75} />, github: <GitBranch size={16} strokeWidth={1.75} />, slack: <MessageSquare size={16} strokeWidth={1.75} />,
  twilio: <Phone size={16} strokeWidth={1.75} />, discord: <Gamepad2 size={16} strokeWidth={1.75} />, linear: <TriangleRight size={16} strokeWidth={1.75} />, notion: <FileText size={16} strokeWidth={1.75} />,
};

export function ConnectorsContent() {
  const t = useTranslations('connectors');
  const tc = useTranslations('common');
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);
  const [selectedConnector, setSelectedConnector] = useState('');
  const [configName, setConfigName] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data: connectors = [], isLoading: loadingConnectors } = useQuery({
    queryKey: ['connectors'],
    queryFn: () => connectorsApi.list(token!),
    enabled: !!token,
  });

  const { data: configs = [], isLoading: loadingConfigs } = useQuery({
    queryKey: ['connector-configs'],
    queryFn: () => connectorsApi.listConfigs(token!),
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: (data: { connector_id: string; name: string }) =>
      connectorsApi.createConfig(token!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connector-configs'] });
      setShowCreate(false); setConfigName(''); setSelectedConnector('');
      toast(t('connectorConfigured'), 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; is_active?: boolean } }) =>
      connectorsApi.updateConfig(token!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connector-configs'] });
      setEditTarget(null);
      toast(t('connectorUpdated'), 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => connectorsApi.deleteConfig(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connector-configs'] });
      if (selectedId) setSelectedId(null);
      toast(t('connectorRemoved'), 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const handleEdit = (cfg: { id: string; name: string }) => {
    setEditTarget(cfg.id);
    setEditName(cfg.name);
  };

  const handleUpdate = () => {
    if (!editTarget || !editName.trim()) return;
    updateMutation.mutate({ id: editTarget, data: { name: editName } });
  };

  const handleToggle = (cfg: { id: string; is_active: boolean }) => {
    updateMutation.mutate({ id: cfg.id, data: { is_active: !cfg.is_active } });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
        </div>
        <button onClick={() => { setShowCreate(true); setEditTarget(null); }}
          className="bg-brand-600 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 transition">
          + {t('addConnector')}
        </button>
      </div>


      {/* Available Connectors */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('availableConnectors')}</h2>
        {loadingConnectors ? (
          <div className="glass-card p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full mx-auto mb-4" />
            <p className="text-gray-500 dark:text-slate-400">{tc('loading')}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {connectors.map(c => (
              <div key={c.id} className="glass-card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{PROVIDER_ICONS[c.name] || <Plug size={20} strokeWidth={1.75} />}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{c.display_name}</h3>
                    <span className="text-xs text-gray-500 dark:text-slate-400 font-mono">{c.name}</span>
                  </div>
                </div>
                {c.description && <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">{c.description}</p>}
                {c.supported_events && c.supported_events.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {c.supported_events.slice(0, 3).map(ev => (
                      <span key={ev} className="px-1.5 py-0.5 text-xs bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 rounded font-mono">{ev}</span>
                    ))}
                    {c.supported_events.length > 3 && (
                      <span className="px-1.5 py-0.5 text-xs text-gray-400">+{c.supported_events.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Config Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => { setShowCreate(false); setConfigName(''); setSelectedConnector(''); }} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('addConfiguration')}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">{t('selectConnector')}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t('connector')}</label>
                <select value={selectedConnector} onChange={e => setSelectedConnector(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
                  <option value="">{t('selectConnector')}</option>
                  {connectors.map(c => <option key={c.id} value={c.id}>{c.display_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t('name')}</label>
                <input value={configName} onChange={e => setConfigName(e.target.value)} placeholder={t('namePlaceholder')}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => { setShowCreate(false); setConfigName(''); setSelectedConnector(''); }}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition">{tc('cancel')}</button>
              <button onClick={() => { if (selectedConnector && configName.trim()) createMutation.mutate({ connector_id: selectedConnector, name: configName }); }}
                disabled={createMutation.isPending || !selectedConnector || !configName.trim()}
                className="px-5 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition disabled:opacity-60">
                {createMutation.isPending ? tc('creating') : t('create')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Configured Connectors */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('yourConfigurations')} ({configs.length})</h2>
        {loadingConfigs ? (
          <div className="glass-card p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full mx-auto mb-4" />
            <p className="text-gray-500 dark:text-slate-400">{tc('loading')}</p>
          </div>
        ) : configs.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-5xl mb-4"><Plug size={18} strokeWidth={1.75} /></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('noConnectors')}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{t('noConnectorsDesc')}</p>
            <button onClick={() => setShowCreate(true)} className="bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 transition">
              + {t('addConnector')}
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {configs.map(cfg => {
              const isEditing = editTarget === cfg.id;
              return (
                <div key={cfg.id} className={`glass-card p-5 transition ${selectedId === cfg.id ? 'ring-2 ring-brand-500' : ''} ${isEditing ? 'ring-2 ring-brand-500' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{PROVIDER_ICONS[cfg.connector_name] || <Plug size={16} strokeWidth={1.75} />}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{cfg.name}</h3>
                        <span className="text-xs text-gray-500 dark:text-slate-400">{cfg.connector_display_name}</span>
                      </div>
                    </div>
                    <button onClick={() => handleToggle(cfg)}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.is_active ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                      {cfg.is_active ? t('active') : t('inactive')}
                    </button>
                  </div>

                  <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                    <span className="text-xs text-gray-500 dark:text-slate-400 flex-1">{formatDate(cfg.created_at)}</span>
                    <button onClick={() => handleEdit(cfg)} title={t('edit')} className="text-gray-500 dark:text-slate-400 hover:text-brand-600 transition p-1.5 text-sm"><Pencil size={18} strokeWidth={1.75} /></button>
                    <button onClick={() => setDeleteTarget(cfg.id)} title={t('delete')} className="text-gray-500 dark:text-slate-400 hover:text-red-600 transition p-1.5 text-sm"><Trash2 size={18} strokeWidth={1.75} /></button>
                  </div>

                  {/* Edit form inline */}
                  {isEditing && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">{t('name')}</label>
                        <input value={editName} onChange={e => setEditName(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleUpdate} disabled={updateMutation.isPending}
                          className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition disabled:opacity-50">{t('save')}</button>
                        <button onClick={() => setEditTarget(null)}
                          className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition">{tc('cancel')}</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title={t('deleteConfig')}
        message={t('deleteConfirm')}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
