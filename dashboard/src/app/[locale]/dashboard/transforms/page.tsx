'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { endpointsApi, type Endpoint } from '@/lib/api';
import { useTranslations } from 'next-intl';

interface TransformRule {
  id: string;
  endpoint_id: string;
  rule_json: {
    filter?: { include?: string[]; exclude?: string[] };
    mappings?: { source: string; target: string }[];
    enrich?: { fields: Record<string, unknown> };
  };
  created_at: string;
}

export default function TransformsPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const t = useTranslations('transforms');
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState('');
  const [rules, setRules] = useState<TransformRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  // New rule form
  const [filterInclude, setFilterInclude] = useState('');
  const [filterExclude, setFilterExclude] = useState('');
  const [mapSource, setMapSource] = useState('');
  const [mapTarget, setMapTarget] = useState('');
  const [enrichKey, setEnrichKey] = useState('');
  const [enrichValue, setEnrichValue] = useState('');

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';

  useEffect(() => {
    if (!token) return;
    endpointsApi.list(token).then(setEndpoints).catch(() => {});
  }, [token]);

  const loadRules = useCallback(async (endpointId: string) => {
    if (!token || !endpointId) return;
    try {
      const res = await fetch(`${API}/endpoints/${endpointId}/transforms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setRules(await res.json());
    } catch {} finally { setLoading(false); }
  }, [token, API]);

  useEffect(() => { if (selectedEndpoint) loadRules(selectedEndpoint); }, [selectedEndpoint, loadRules]);

  const handleCreate = async () => {
    if (!token || !selectedEndpoint) return;
    const rule: TransformRule['rule_json'] = {};

    if (filterInclude) rule.filter = { include: filterInclude.split(',').map(s => s.trim()) };
    if (filterExclude) rule.filter = { ...rule.filter, exclude: filterExclude.split(',').map(s => s.trim()) };
    if (mapSource && mapTarget) rule.mappings = [{ source: mapSource.trim(), target: mapTarget.trim() }];
    if (enrichKey && enrichValue) rule.enrich = { fields: { [enrichKey.trim()]: enrichValue.trim() } };

    try {
      const res = await fetch(`${API}/endpoints/${selectedEndpoint}/transforms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rule }),
      });
      if (res.ok) {
        toast('Transform rule created!', 'success');
        loadRules(selectedEndpoint);
        setShowCreate(false);
        setFilterInclude(''); setFilterExclude('');
        setMapSource(''); setMapTarget('');
        setEnrichKey(''); setEnrichValue('');
      }
    } catch { toast('Failed to create rule', 'error'); }
  };

  const handleDelete = async (ruleId: string) => {
    if (!token || !selectedEndpoint) return;
    try {
      await fetch(`${API}/endpoints/${selectedEndpoint}/transforms/${ruleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setRules(prev => prev.filter(r => r.id !== ruleId));
      toast('Rule deleted', 'info');
    } catch { toast('Failed to delete', 'error'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">🔄 Webhook Transforms</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Filter, map, and enrich webhook payloads before delivery</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 transition">
          + New Rule
        </button>
      </div>

      {/* Endpoint selector */}
      <div className="glass-card p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Select Endpoint</label>
        <select value={selectedEndpoint} onChange={e => setSelectedEndpoint(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
          <option value="">Choose an endpoint...</option>
          {endpoints.map(ep => <option key={ep.id} value={ep.id}>{ep.url}</option>)}
        </select>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">New Transform Rule</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Filter (include fields)</label>
              <input value={filterInclude} onChange={e => setFilterInclude(e.target.value)} placeholder="order_id, amount" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Filter (exclude fields)</label>
              <input value={filterExclude} onChange={e => setFilterExclude(e.target.value)} placeholder="internal_secret" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Map from</label>
                <input value={mapSource} onChange={e => setMapSource(e.target.value)} placeholder="data.order.id" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Map to</label>
                <input value={mapTarget} onChange={e => setMapTarget(e.target.value)} placeholder="order_id" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
              </div>
            </div>
          </div>

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Enrich key</label>
              <input value={enrichKey} onChange={e => setEnrichKey(e.target.value)} placeholder="source" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Enrich value</label>
              <input value={enrichValue} onChange={e => setEnrichValue(e.target.value)} placeholder="hooksniff" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
            </div>
            <button onClick={handleCreate} className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition">Create</button>
          </div>
        </div>
      )}

      {/* Rules list */}
      {!selectedEndpoint ? (
        <div className="glass-card p-12 text-center text-gray-400 dark:text-slate-500">Select an endpoint to manage transforms</div>
      ) : loading ? (
        <div className="glass-card p-6 animate-pulse"><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2" /></div>
      ) : rules.length === 0 ? (
        <div className="glass-card p-12 text-center text-gray-400 dark:text-slate-500">No transform rules. Create one to start transforming payloads.</div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div key={rule.id} className="glass-card p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  {rule.rule_json.filter && (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-medium">Filter</span>
                      <code className="text-xs font-mono text-gray-600 dark:text-slate-400">
                        {rule.rule_json.filter.include && `include: ${rule.rule_json.filter.include.join(', ')}`}
                        {rule.rule_json.filter.exclude && `exclude: ${rule.rule_json.filter.exclude.join(', ')}`}
                      </code>
                    </div>
                  )}
                  {rule.rule_json.mappings?.map((m, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 text-xs font-medium">Map</span>
                      <code className="text-xs font-mono text-gray-600 dark:text-slate-400">{m.source} → {m.target}</code>
                    </div>
                  ))}
                  {rule.rule_json.enrich && (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-medium">Enrich</span>
                      <code className="text-xs font-mono text-gray-600 dark:text-slate-400">{JSON.stringify(rule.rule_json.enrich.fields)}</code>
                    </div>
                  )}
                </div>
                <button onClick={() => handleDelete(rule.id)} className="text-gray-400 hover:text-red-600 transition p-2">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
