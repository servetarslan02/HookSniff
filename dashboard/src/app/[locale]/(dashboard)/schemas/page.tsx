'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { api } from '@/lib/api';
import { Check, ClipboardList, X } from 'lucide-react';

interface Schema {
  id: string;
  name: string;
  description?: string | null;
  schema: unknown;
  version: number;
  created_at: string;
}

export default function SchemasPage() {
  const t = useTranslations('schemas');
  const tc = useTranslations('common');
  const { token } = useAuth();
  const { toast } = useToast();
  

  const [schemas, setSchemas] = useState<Schema[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [viewSchema, setViewSchema] = useState<Schema | null>(null);
  
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [validationPayload, setValidationPayload] = useState('');
  const [validationResult, setValidationResult] = useState<{ valid: boolean; errors: Array<{ path: string; message: string }> } | null>(null);

  // Create form
  const [newName, setNewName] = useState('');
  const [newSchema, setNewSchema] = useState('{\n  "type": "object",\n  "properties": {},\n  "required": []\n}');
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  // Load schemas
  const loadSchemas = async () => {
    if (!token) return;
    try {
      const data = await api.getSchemas(token);
      setSchemas(data.schemas ?? []);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  // Load on mount
  useState(() => { loadSchemas(); });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newName.trim()) return;
    setCreateError('');
    setCreating(true);
    try {
      const parsed = JSON.parse(newSchema);
      await api.createSchema(token, { name: newName.trim(), schema: parsed });
      toast(t('created') || 'Schema created!', 'success');
      setNewName('');
      setNewSchema('{\n  "type": "object",\n  "properties": {},\n  "required": []\n}');
      setShowCreate(false);
      loadSchemas();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : tc('error'));
    } finally {
      setCreating(false);
    }
  };

  const handleValidate = async () => {
    if (!token || !validatingId || !validationPayload.trim()) return;
    try {
      const parsed = JSON.parse(validationPayload);
      const result = await api.validateSchema(token, validatingId, parsed);
      setValidationResult(result);
    } catch (err) {
      setValidationResult({ valid: false, errors: [{ path: '/', message: err instanceof Error ? err.message : 'Invalid JSON' }] });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-xl hover:bg-brand-700 transition"
        >
          + {t('createSchema')}
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('createSchema')}</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t('schemaName')}</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="order.created"
                required
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">JSON Schema</label>
              <textarea
                value={newSchema}
                onChange={(e) => setNewSchema(e.target.value)}
                rows={8}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
            {createError && (
              <p className="text-sm text-red-600 dark:text-red-400">{createError}</p>
            )}
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition">
                {tc('cancel')}
              </button>
              <button type="submit" disabled={creating || !newName.trim()} className="px-5 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition disabled:opacity-60">
                {creating ? tc('creating') : tc('create')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Schema List */}
      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500 dark:text-slate-400">{tc('loading')}</div>
        ) : schemas.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3"><ClipboardList size={18} strokeWidth={1.75} /></div>
            <p className="text-gray-500 dark:text-slate-400 mb-1">{t('noSchemas')}</p>
            <p className="text-xs text-gray-400 dark:text-slate-500">{t('noSchemasDesc')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {schemas.map((s) => (
              <div key={s.id} className="px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{s.name}</span>
                      <span className="px-2 py-0.5 text-xs font-mono bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 rounded-md">v{s.version}</span>
                    </div>
                    {s.description && <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{s.description}</p>}
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{new Date(s.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewSchema(s)}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition"
                    >
                      {t('view')}
                    </button>
                    <button
                      onClick={() => { setValidatingId(s.id); setValidationPayload(''); setValidationResult(null); }}
                      className="px-3 py-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 hover:bg-brand-100 dark:hover:bg-brand-500/20 rounded-lg transition"
                    >
                      Validate
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Schema Modal */}
      {viewSchema && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setViewSchema(null)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[80dvh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{viewSchema.name}</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">v{viewSchema.version} · {new Date(viewSchema.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => setViewSchema(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-slate-300"><X size={18} strokeWidth={1.75} /></button>
            </div>
            <div className="p-6">
              <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-2 uppercase tracking-wider">JSON Schema</label>
              <pre className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-4 text-sm font-mono text-gray-800 dark:text-slate-300 overflow-x-auto">
                {JSON.stringify(viewSchema.schema, null, 2)}
              </pre>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-end">
              <button onClick={() => setViewSchema(null)} className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition">
                {tc('close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Validate Modal */}
      {validatingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => { setValidatingId(null); setValidationResult(null); }} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full mx-4 max-h-[80dvh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Validate Event</h3>
              <button onClick={() => { setValidatingId(null); setValidationResult(null); }} className="text-gray-500 hover:text-gray-700 dark:hover:text-slate-300"><X size={18} strokeWidth={1.75} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Event Payload (JSON)</label>
                <textarea
                  value={validationPayload}
                  onChange={(e) => setValidationPayload(e.target.value)}
                  rows={6}
                  placeholder='{"order_id": "ord_123", "total": 49.99}'
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-sm font-mono text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleValidate}
                disabled={!validationPayload.trim()}
                className="w-full px-4 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-xl hover:bg-brand-700 transition disabled:opacity-50"
              >
                <Check size={16} strokeWidth={1.75} className="inline mr-1" /> Validate
              </button>
              {validationResult && (
                <div className={`p-4 rounded-xl ${validationResult.valid ? 'bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30' : 'bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30'}`}>
                  <p className={`text-sm font-medium ${validationResult.valid ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                    {validationResult.valid ? '<Check size={14} strokeWidth={1.75} className="inline-block align-text-bottom text-emerald-500" /> Valid' : '<X size={14} strokeWidth={1.75} className="inline-block align-text-bottom text-red-500" /> Invalid'}
                  </p>
                  {validationResult.errors.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {validationResult.errors.map((err, i) => (
                        <li key={i} className="text-xs text-red-600 dark:text-red-400">
                          <span className="font-mono">{err.path}</span>: {err.message}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
