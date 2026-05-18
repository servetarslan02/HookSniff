'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/store';
import { connectorsApi } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

function formatDate(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleString();
}

const PROVIDER_ICONS: Record<string, string> = {
  stripe: '💳',
  shopify: '🛒',
  github: '🐙',
  slack: '💬',
  twilio: '📞',
  discord: '🎮',
  linear: '📐',
  notion: '📝',
};

export default function ConnectorsPage() {
  const t = useTranslations('connectors');
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedConnector, setSelectedConnector] = useState<string>('');
  const [configName, setConfigName] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  const deleteMutation = useMutation({
    mutationFn: (id: string) => connectorsApi.deleteConfig(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connector-configs'] });
      if (selectedId) setSelectedId(null);
      toast(t('connectorRemoved'), 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          {t('addConnector')}
        </button>
      </div>

      {/* Available Connectors */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('availableConnectors')}</h2>
        {loadingConnectors ? (
          <div className="text-center py-8 text-gray-500">{t('loading')}</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {connectors.map(c => (
              <div key={c.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{PROVIDER_ICONS[c.name] || '🔌'}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{c.display_name}</h3>
                    <span className="text-xs text-gray-500 font-mono">{c.name}</span>
                  </div>
                </div>
                {c.description && <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{c.description}</p>}
                {c.supported_events && c.supported_events.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {c.supported_events.slice(0, 3).map(ev => (
                      <span key={ev} className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">{ev}</span>
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

      {/* Create Config */}
      {showCreate && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">{t('addConfiguration')}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('connector')}</label>
              <select
                value={selectedConnector}
                onChange={e => setSelectedConnector(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">{t('selectConnector')}</option>
                {connectors.map(c => (
                  <option key={c.id} value={c.id}>{PROVIDER_ICONS[c.name] || '🔌'} {c.display_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('name')}</label>
              <input
                value={configName}
                onChange={e => setConfigName(e.target.value)}
                placeholder={t('namePlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (selectedConnector && configName.trim()) {
                  createMutation.mutate({ connector_id: selectedConnector, name: configName });
                }
              }}
              disabled={createMutation.isPending || !selectedConnector || !configName.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {createMutation.isPending ? t('creating') : t('create')}
            </button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800">{t('cancel')}</button>
          </div>
        </div>
      )}

      {/* Configured Connectors */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('yourConfigurations')}</h2>
        {loadingConfigs ? (
          <div className="text-center py-8 text-gray-500">{t('loading')}</div>
        ) : configs.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🔌</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('noConnectors')}</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{t('noConnectorsDesc')}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {configs.map(cfg => (
              <div
                key={cfg.id}
                className={`bg-white dark:bg-gray-800 rounded-xl border p-5 cursor-pointer hover:shadow-md transition ${selectedId === cfg.id ? 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-800' : 'border-gray-200 dark:border-gray-700'}`}
                onClick={() => setSelectedId(selectedId === cfg.id ? null : cfg.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{PROVIDER_ICONS[cfg.connector_name] || '🔌'}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{cfg.name}</h3>
                      <span className="text-xs text-gray-500">{cfg.connector_display_name}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${cfg.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                    {cfg.is_active ? t('active') : t('inactive')}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-xs text-gray-500">{formatDate(cfg.created_at)}</span>
                  <button
                    onClick={e => { e.stopPropagation(); deleteMutation.mutate(cfg.id); }}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    {t('delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
