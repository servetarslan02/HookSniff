'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/lib/store';
import { endpointsApi } from '@/lib/api';
import { useEndpoints, useDeleteEndpoint, useToggleEndpoint } from '@/hooks/useDashboardData';
import { useTranslations } from 'next-intl';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';
import { useQueryClient } from '@tanstack/react-query';

export default function EndpointsPage() {
  const { token } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [rotatingId, setRotatingId] = useState<string | null>(null);
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const t = useTranslations('endpoints');
  const tc = useTranslations('common');

  // React Query — replaces useEffect + useState + fetch
  const { data: endpoints = [], isLoading, error: queryError } = useEndpoints();
  const deleteEndpointMutation = useDeleteEndpoint();
  const toggleEndpointMutation = useToggleEndpoint();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newUrl) return;
    setCreating(true);
    setError('');
    try {
      await endpointsApi.create(token, { url: newUrl, description: newDesc || undefined });
      queryClient.invalidateQueries({ queryKey: ['endpoints'] });
      setNewUrl('');
      setNewDesc('');
      setShowCreate(false);
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : tc('unknownError')) || tc('failedToCreate'));
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEndpointMutation.mutateAsync(id);
      setDeleteId(null);
    } catch (err: unknown) {
      toast((err instanceof Error ? err.message : tc('unknownError')) || tc('failedToDelete'), 'error');
    }
  };

  const handleToggle = async (id: string, currentState: boolean) => {
    setTogglingId(id);
    try {
      await toggleEndpointMutation.mutateAsync({ id, is_active: !currentState });
    } catch (err: unknown) {
      toast((err instanceof Error ? err.message : tc('unknownError')) || tc('failedToUpdate'), 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!token || !deleteId) return;
    try {
      await endpointsApi.delete(token, deleteId);
      queryClient.invalidateQueries({ queryKey: ['endpoints'] });
    } catch (err: unknown) {
      toast((err instanceof Error ? err.message : tc('unknownError')) || tc('failedToDelete'), 'error');
    } finally {
      setDeleteId(null);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === endpoints.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(endpoints.map((ep) => ep.id)));
    }
  };

  const handleRotateSecret = async (ep: { id: string }) => {
    if (!token) return;
    setRotatingId(ep.id);
    try {
      const data = await endpointsApi.rotateSecret(token, ep.id);
      setNewSecret(data.signing_secret);
      toast(t('secretRotated'), 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : tc('error'), 'error');
    } finally {
      setRotatingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (!token || selected.size === 0) return;
    setBulkDeleting(true);
    let deleted = 0;
    for (const id of selected) {
      try {
        await endpointsApi.delete(token, id);
        deleted++;
      } catch {
        // Continue with remaining
      }
    }
    queryClient.invalidateQueries({ queryKey: ['endpoints'] });
    setSelected(new Set());
    setBulkDeleting(false);
    toast(t('bulkDeleted', { count: deleted }), 'success');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-card p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-sm w-1/4 mb-3"></div>
            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded-sm w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (queryError && endpoints.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="text-4xl mb-3">⚠️</div>
        <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">{error || tc('error')}</p>
        <button type="button" onClick={() => queryClient.invalidateQueries({ queryKey: ['endpoints'] })} className="bg-brand-600 dark:bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 dark:hover:bg-brand-600 transition">
          {tc('retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(!showCreate)}
          className="bg-brand-600 dark:bg-brand-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 dark:hover:bg-brand-600 transition"
        >
          {t('newEndpoint')}
        </button>
      </div>

      {showCreate && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('create')}</h3>
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm border border-red-200">{error}</div>
          )}
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label htmlFor="endpoint-url" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('urlLabel')}</label>
              <input
                id="endpoint-url"
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder={t('form.urlPlaceholder')}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label htmlFor="endpoint-desc" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('descriptionLabel')}</label>
              <input
                id="endpoint-desc"
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder={t('form.descriptionPlaceholder')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creating}
                className="bg-brand-600 dark:bg-brand-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 dark:hover:bg-brand-600 transition disabled:opacity-60"
              >
                {creating ? tc('creating') : tc('create')}
              </button>
              <button
                type="button"
                onClick={() => { setShowCreate(false); setError(''); }}
                className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200 dark:bg-slate-700 transition"
              >
                {tc('cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {endpoints.length === 0 ? (
        <div className="glass-card p-12 text-center text-gray-500 dark:text-slate-500">
          {t('noEndpointsYet')}
        </div>
      ) : (
        <>
          {/* Bulk Actions Bar */}
          {endpoints.length > 1 && (
            <div className="flex items-center gap-4 mb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.size === endpoints.length && endpoints.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded-sm text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm text-gray-600 dark:text-slate-400">{t('selectAllLabel', { count: endpoints.length })}</span>
              </label>
              {selected.size > 0 && (
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  {bulkDeleting ? tc('deleting') : `🗑 ${tc('deleteSelected', { count: selected.size })}`}
                </button>
              )}
            </div>
          )}

          <div className="grid gap-4">
          {endpoints.map((ep) => (
            <div key={ep.id} className="glass-card p-6 hover-lift">
              <div className="flex items-start justify-between">
                {endpoints.length > 1 && (
                  <input
                    type="checkbox"
                    checked={selected.has(ep.id)}
                    onChange={() => toggleSelect(ep.id)}
                    className="w-4 h-4 rounded-sm text-brand-600 focus:ring-brand-500 mt-1 mr-3"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-3 py-1 rounded-lg">
                      {ep.id.slice(0, 12)}…
                    </span>
                    {/* Active/Inactive Toggle */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={ep.is_active}
                      onClick={() => handleToggle(ep.id, ep.is_active)}
                      disabled={togglingId === ep.id}
                      className={`relative w-10 h-5 rounded-full transition-colors duration-200 shrink-0 ${ep.is_active ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-slate-600'} ${togglingId === ep.id ? 'opacity-60' : ''}`}
                      title={ep.is_active ? t('disable') : t('enable')}
                    >
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-200 ${ep.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                    <span className="text-xs text-gray-500 dark:text-slate-400">{ep.is_active ? t('active') : t('inactive')}</span>
                  </div>
                  <div className="text-sm font-mono text-gray-900 dark:text-white mb-1">{ep.url}</div>
                  {ep.description && <div className="text-sm text-gray-500 dark:text-slate-400">{ep.description}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRotateSecret(ep)}
                    disabled={rotatingId === ep.id}
                    className="text-gray-500 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 transition p-2"
                    aria-label={t('rotateSecret')}
                    title={t('rotateSecret')}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push(`/endpoints/${ep.id}`)}
                    className="text-gray-500 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition p-2"
                    aria-label={t('settingsTitle')}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(ep.id)}
                    className="text-gray-500 dark:text-slate-500 hover:text-red-600 transition p-2"
                    aria-label={t('deleteTitle')}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        </>
      )}
      <ConfirmDialog
        open={!!deleteId}
        title={t('deleteTitle')}
        message={t('deleteConfirm')}
        confirmLabel={t('delete')}
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* New Secret Modal */}
      {newSecret && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setNewSecret(null)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">🔑 {t('newSecret')}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              {t('newSecretDesc')}
            </p>
            <div className="bg-gray-100 dark:bg-slate-700 rounded-lg p-4 mb-4">
              <code className="text-sm font-mono text-gray-900 dark:text-white break-all">{newSecret}</code>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(newSecret);
                  toast(t('copied'), 'success');
                }}
                className="px-4 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition"
              >
                📋 {t('copy')}
              </button>
              <button
                type="button"
                onClick={() => setNewSecret(null)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition"
              >
                {tc('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
