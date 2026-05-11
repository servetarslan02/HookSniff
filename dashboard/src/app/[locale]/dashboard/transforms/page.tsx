'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { endpointsApi, transformsApi, type Endpoint, type TransformRule } from '@/lib/api';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function TransformsPage() {
  const t = useTranslations('transforms');
  const { token } = useAuth();
  const { toast } = useToast();
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState('');
  const [rules, setRules] = useState<TransformRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // New rule form
  const [filterInclude, setFilterInclude] = useState('');
  const [filterExclude, setFilterExclude] = useState('');
  const [mapSource, setMapSource] = useState('');
  const [mapTarget, setMapTarget] = useState('');
  const [enrichKey, setEnrichKey] = useState('');
  const [enrichValue, setEnrichValue] = useState('');

  useEffect(() => {
    if (!token) return;
    endpointsApi.list(token).then(setEndpoints).catch((err) => {
      setError(err instanceof Error ? err.message : 'Failed to load endpoints');
    });
  }, [token]);

  const loadRules = useCallback(async (endpointId: string) => {
    if (!token || !endpointId) return;
    try {
      setError(null);
      const data = await transformsApi.list(token, endpointId);
      setRules(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transforms');
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { if (selectedEndpoint) loadRules(selectedEndpoint); }, [selectedEndpoint, loadRules]);

  const handleCreate = async () => {
    if (!token || !selectedEndpoint) return;
    const rule: TransformRule['rule_json'] = {};

    if (filterInclude) rule.filter = { include: filterInclude.split(',').map(s => s.trim()) };
    if (filterExclude) rule.filter = { ...rule.filter, exclude: filterExclude.split(',').map(s => s.trim()) };
    if (mapSource && mapTarget) rule.mappings = [{ source: mapSource.trim(), target: mapTarget.trim() }];
    if (enrichKey && enrichValue) rule.enrich = { fields: { [enrichKey.trim()]: enrichValue.trim() } };

    try {
      await transformsApi.create(token, selectedEndpoint, { rule });
      toast(t('created'), 'success');
      loadRules(selectedEndpoint);
      setShowCreate(false);
      setFilterInclude(''); setFilterExclude('');
      setMapSource(''); setMapTarget('');
      setEnrichKey(''); setEnrichValue('');
    } catch { toast(t('createFailed'), 'error'); }
  };

  const handleDelete = async (ruleId: string) => {
    setDeleteTarget(ruleId);
  };

  const confirmDelete = async () => {
    if (!token || !selectedEndpoint || !deleteTarget) return;
    try {
      await transformsApi.delete(token, selectedEndpoint, deleteTarget);
      setRules(prev => prev.filter(r => r.id !== deleteTarget));
      toast(t('deleted'), 'info');
    } catch { toast(t('deleteFailed'), 'error'); }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 transition">
          {t('newRule')}
        </button>
      </div>

      {/* Endpoint selector */}
      <div className="glass-card p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('selectEndpoint')}</label>
        <select value={selectedEndpoint} onChange={e => setSelectedEndpoint(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
          <option value="">{t('chooseEndpoint')}</option>
          {endpoints.map(ep => <option key={ep.id} value={ep.id}>{ep.url}</option>)}
        </select>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('newTransformRule')}</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('filterInclude')}</label>
              <input value={filterInclude} onChange={e => setFilterInclude(e.target.value)} placeholder="order_id, amount" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('filterExclude')}</label>
              <input value={filterExclude} onChange={e => setFilterExclude(e.target.value)} placeholder="internal_secret" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('mapFrom')}</label>
                <input value={mapSource} onChange={e => setMapSource(e.target.value)} placeholder="data.order.id" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('mapTo')}</label>
                <input value={mapTarget} onChange={e => setMapTarget(e.target.value)} placeholder="order_id" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
              </div>
            </div>
          </div>

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('enrichKey')}</label>
              <input value={enrichKey} onChange={e => setEnrichKey(e.target.value)} placeholder="source" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('enrichValue')}</label>
              <input value={enrichValue} onChange={e => setEnrichValue(e.target.value)} placeholder="hooksniff" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
            </div>
            <button onClick={handleCreate} className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition">{t('create')}</button>
          </div>
        </div>
      )}

      {/* Rules list */}
      {!selectedEndpoint ? (
        <div className="glass-card p-12 text-center text-gray-400 dark:text-slate-500">{t('selectEndpointHint')}</div>
      ) : loading ? (
        <div className="glass-card p-6 animate-pulse"><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2" /></div>
      ) : rules.length === 0 ? (
        <div className="glass-card p-12 text-center text-gray-400 dark:text-slate-500">{t('empty')}</div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div key={rule.id} className="glass-card p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  {rule.rule_json.filter && (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-medium">{t('filterTag')}</span>
                      <code className="text-xs font-mono text-gray-600 dark:text-slate-400">
                        {rule.rule_json.filter.include && `include: ${rule.rule_json.filter.include.join(', ')}`}
                        {rule.rule_json.filter.exclude && `exclude: ${rule.rule_json.filter.exclude.join(', ')}`}
                      </code>
                    </div>
                  )}
                  {rule.rule_json.mappings?.map((m, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 text-xs font-medium">{t('mapTag')}</span>
                      <code className="text-xs font-mono text-gray-600 dark:text-slate-400">{m.source} → {m.target}</code>
                    </div>
                  ))}
                  {rule.rule_json.enrich && (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-medium">{t('enrichTag')}</span>
                      <code className="text-xs font-mono text-gray-600 dark:text-slate-400">{JSON.stringify(rule.rule_json.enrich.fields)}</code>
                    </div>
                  )}
                </div>
                <button onClick={() => handleDelete(rule.id)} aria-label={t("deleteTransform")} className="text-gray-400 hover:text-red-600 transition p-2">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* HS-043: Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title={t('deleteTransform')}
        message={t('deleteConfirm')}
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
