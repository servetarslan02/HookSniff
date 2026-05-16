'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/components/Toast';
import { useEndpoints, useTransformRules, useCreateTransformRule, useDeleteTransformRule } from '@/hooks/useDashboardData';
import type { TransformRuleValidated } from '@/schemas/api';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function TransformsPage() {
  const t = useTranslations('transforms');
  const { toast } = useToast();

  const { data: endpoints = [] } = useEndpoints();
  const [selectedEndpoint, setSelectedEndpoint] = useState('');
  const { data: rules = [], isLoading: loading } = useTransformRules(selectedEndpoint);
  const createMutation = useCreateTransformRule();
  const deleteMutation = useDeleteTransformRule();

  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // New rule form
  const [filterInclude, setFilterInclude] = useState('');
  const [filterExclude, setFilterExclude] = useState('');
  const [mapSource, setMapSource] = useState('');
  const [mapTarget, setMapTarget] = useState('');
  const [enrichKey, setEnrichKey] = useState('');
  const [enrichValue, setEnrichValue] = useState('');

  const handleCreate = async () => {
    if (!selectedEndpoint) return;
    const rule: TransformRuleValidated['rule_json'] = {};

    if (filterInclude) rule.filter = { include: filterInclude.split(',').map(s => s.trim()) };
    if (filterExclude) rule.filter = { ...rule.filter, exclude: filterExclude.split(',').map(s => s.trim()) };
    if (mapSource && mapTarget) rule.mappings = [{ source: mapSource.trim(), target: mapTarget.trim() }];
    if (enrichKey && enrichValue) rule.enrich = { fields: { [enrichKey.trim()]: enrichValue.trim() } };

    try {
      await createMutation.mutateAsync({ endpointId: selectedEndpoint, rule });
      toast(t('created'), 'success');
      setShowCreate(false);
      setFilterInclude(''); setFilterExclude('');
      setMapSource(''); setMapTarget('');
      setEnrichKey(''); setEnrichValue('');
    } catch {
      toast(t('createFailed'), 'error');
    }
  };

  const handleDelete = (ruleId: string) => {
    setDeleteTarget(ruleId);
  };

  const confirmDelete = async () => {
    if (!selectedEndpoint || !deleteTarget) return;
    try {
      await deleteMutation.mutateAsync({ endpointId: selectedEndpoint, ruleId: deleteTarget });
      toast(t('deleted'), 'info');
    } catch {
      toast(t('deleteFailed'), 'error');
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
        </div>
        <button type="button" onClick={() => setShowCreate(!showCreate)} className="bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 transition">
          {t('newRule')}
        </button>
      </div>

      {/* Endpoint selector */}
      <div className="glass-card p-4">
        <label htmlFor="transform-endpoint" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('selectEndpoint')}</label>
        <select id="transform-endpoint" value={selectedEndpoint} onChange={e => setSelectedEndpoint(e.target.value)}
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
              <label htmlFor="transform-filter-include" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('filterInclude')}</label>
              <input id="transform-filter-include" value={filterInclude} onChange={e => setFilterInclude(e.target.value)} placeholder="order_id, amount" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
            </div>
            <div>
              <label htmlFor="transform-filter-exclude" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('filterExclude')}</label>
              <input id="transform-filter-exclude" value={filterExclude} onChange={e => setFilterExclude(e.target.value)} placeholder="internal_secret" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label htmlFor="transform-map-from" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('mapFrom')}</label>
                <input id="transform-map-from" value={mapSource} onChange={e => setMapSource(e.target.value)} placeholder="data.order.id" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
              </div>
              <div className="flex-1">
                <label htmlFor="transform-map-to" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('mapTo')}</label>
                <input id="transform-map-to" value={mapTarget} onChange={e => setMapTarget(e.target.value)} placeholder="order_id" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
              </div>
            </div>
          </div>

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label htmlFor="transform-enrich-key" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('enrichKey')}</label>
              <input id="transform-enrich-key" value={enrichKey} onChange={e => setEnrichKey(e.target.value)} placeholder="source" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
            </div>
            <div className="flex-1">
              <label htmlFor="transform-enrich-value" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('enrichValue')}</label>
              <input id="transform-enrich-value" value={enrichValue} onChange={e => setEnrichValue(e.target.value)} placeholder="hooksniff" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
            </div>
            <button type="button" onClick={handleCreate} disabled={createMutation.isPending} className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition disabled:opacity-50">{t('create')}</button>
          </div>
        </div>
      )}

      {/* Rules list */}
      {!selectedEndpoint ? (
        <div className="glass-card p-12 text-center text-gray-500 dark:text-slate-400">{t('selectEndpointHint')}</div>
      ) : loading ? (
        <div className="glass-card p-6 animate-pulse"><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-sm w-1/2" /></div>
      ) : rules.length === 0 ? (
        <div className="glass-card p-12 text-center text-gray-500 dark:text-slate-400">{t('empty')}</div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div key={rule.id} className="glass-card p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  {rule.rule_json.filter && (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-sm bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-medium">{t('filterTag')}</span>
                      <code className="text-xs font-mono text-gray-600 dark:text-slate-400">
                        {rule.rule_json.filter.include && `include: ${rule.rule_json.filter.include.join(', ')}`}
                        {rule.rule_json.filter.exclude && `exclude: ${rule.rule_json.filter.exclude.join(', ')}`}
                      </code>
                    </div>
                  )}
                  {rule.rule_json.mappings?.map((m, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-sm bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 text-xs font-medium">{t('mapTag')}</span>
                      <code className="text-xs font-mono text-gray-600 dark:text-slate-400">{m.source} → {m.target}</code>
                    </div>
                  ))}
                  {rule.rule_json.enrich && (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-sm bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-medium">{t('enrichTag')}</span>
                      <code className="text-xs font-mono text-gray-600 dark:text-slate-400">{JSON.stringify(rule.rule_json.enrich.fields)}</code>
                    </div>
                  )}
                </div>
                <button type="button" onClick={() => handleDelete(rule.id)} aria-label={t("deleteTransform")} className="text-gray-500 dark:text-slate-400 hover:text-red-600 transition p-2">✕</button>
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
