'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useEndpoints } from '@/hooks/useDashboardData';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { endpointsApi } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { Dice5, Pencil, RefreshCw, Scale, Shield, Shuffle } from 'lucide-react';

const STRATEGIES = [
  { value: 'round-robin', icon: <RefreshCw size={16} strokeWidth={1.75} />, descKey: 'roundRobinDesc' },
  { value: 'failover', icon: <Shield size={16} strokeWidth={1.75} />, descKey: 'failoverDesc' },
  { value: 'weighted', icon: <Scale size={16} strokeWidth={1.75} />, descKey: 'weightedDesc' },
  { value: 'random', icon: <Dice5 size={16} strokeWidth={1.75} />, descKey: 'randomDesc' },
];

export default function RoutingPage() {
  const t = useTranslations('routing');
  const tc = useTranslations('common');
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: endpoints = [], isLoading } = useEndpoints();

  const [editId, setEditId] = useState<string | null>(null);
  const [editStrategy, setEditStrategy] = useState('round-robin');
  const [editFallback, setEditFallback] = useState('');
  const [saving, setSaving] = useState(false);

  const handleEdit = (ep: { id: string; routing_strategy?: string | null; fallback_url?: string | null }) => {
    setEditId(ep.id);
    setEditStrategy(ep.routing_strategy || 'round-robin');
    setEditFallback(ep.fallback_url || '');
  };

  const handleSave = async () => {
    if (!editId || !token) return;
    setSaving(true);
    try {
      await endpointsApi.update(token, editId, {
        routing_strategy: editStrategy,
        fallback_url: editFallback || null,
      });
      await queryClient.invalidateQueries({ queryKey: ['endpoints'] });
      toast(t('routingUpdated') || 'Routing updated', 'success');
      setEditId(null);
    } catch (err) {
      toast(err instanceof Error ? err.message : tc('unknownError'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
      </div>

      {/* Strategy explanation cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STRATEGIES.map((s) => (
          <div key={s.value} className="glass-card p-4 text-center">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">{t(s.value) || s.value}</div>
            <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t(s.descKey) || ''}</div>
          </div>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500 dark:text-slate-400">{tc('loading')}</div>
        ) : endpoints.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3"><Shuffle size={18} strokeWidth={1.75} /></div>
            <p className="text-gray-500 dark:text-slate-400 mb-4">{t('noEndpoints')}</p>
            <a href="/webhooks" className="inline-block px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition">
              {t('createEndpoint') || 'Create Endpoint'}
            </a>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {endpoints.map((ep) => (
              <div key={ep.id} className="px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition">
                {editId === ep.id ? (
                  /* Edit mode */
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <code className="text-sm font-mono text-gray-700 dark:text-slate-300 flex-1 truncate">{ep.url}</code>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${ep.is_active ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'}`}>
                        {ep.is_active ? tc('active') : tc('inactive')}
                      </span>
                    </div>

                    {/* Strategy selector */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-2 uppercase tracking-wider">{t('strategy') || 'Routing Strategy'}</label>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                        {STRATEGIES.map((s) => (
                          <button
                            key={s.value}
                            type="button"
                            onClick={() => setEditStrategy(s.value)}
                            className={`p-3 rounded-xl border text-left transition ${
                              editStrategy === s.value
                                ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                                : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                            }`}
                          >
                            <span className="text-lg">{s.icon}</span>
                            <div className="text-sm font-medium text-gray-900 dark:text-white mt-1">{t(s.value) || s.value}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Fallback URL */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t('fallbackUrl') || 'Fallback URL'}</label>
                      <input
                        type="url"
                        value={editFallback}
                        onChange={(e) => setEditFallback(e.target.value)}
                        placeholder="https://backup.example.com/webhook"
                        className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm font-mono"
                      />
                      <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{t('fallbackHint') || 'Used when primary endpoint fails (failover strategy)'}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => setEditId(null)} className="px-4 py-2 text-sm text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200">
                        {tc('cancel')}
                      </button>
                      <button type="button" onClick={handleSave} disabled={saving} className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition disabled:opacity-60">
                        {saving ? tc('saving') : tc('save')}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Display mode */
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <a href={`/endpoints/${ep.id}`} className="text-sm font-mono text-gray-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:underline truncate block">
                        {ep.url}
                      </a>
                      {ep.description && <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{ep.description}</p>}
                      {ep.fallback_url && (
                        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                          <Shield size={16} strokeWidth={1.75} className="inline mr-1" /> {t('fallback') || 'Fallback'}: <code className="font-mono">{ep.fallback_url}</code>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4 shrink-0">
                      <span className="px-2 py-0.5 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 rounded-sm text-xs">
                        {ep.routing_strategy || 'round-robin'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${ep.is_active ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'}`}>
                        {ep.is_active ? tc('active') : tc('inactive')}
                      </span>
                      <button type="button" onClick={() => handleEdit(ep)} className="text-xs text-brand-600 dark:text-brand-400 hover:underline ml-2">
                        <Pencil size={16} strokeWidth={1.75} className="inline mr-1" /> {t('edit') || 'Edit'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
