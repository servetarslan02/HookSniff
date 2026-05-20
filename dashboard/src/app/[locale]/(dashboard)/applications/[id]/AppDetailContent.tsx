'use client';


import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useApplicationDetail, useDeleteEndpoint, useToggleEndpoint } from '@/hooks/useDashboardData';
import { endpointsApi } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { useQueryClient } from '@tanstack/react-query';
import ConfirmDialog from '@/components/ConfirmDialog';
import { LazySection, Skeletons } from '@/components/LazySection';
import { AlertCircle, CheckCircle2, ClipboardList, Key, Link2, Pause } from '@/components/icons';

/* ─── Application Detail — endpoint yönetimi ile birlikte ─── */

export function AppDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const t = useTranslations('applications');
  const tc = useTranslations('common');
  const te = useTranslations('endpoints');

  const appId = params.id as string;

  // Data
  const { data, isLoading: loading } = useApplicationDetail(appId);
  const deleteEndpointMutation = useDeleteEndpoint();
  const toggleEndpointMutation = useToggleEndpoint();

  const app = data?.app ?? null;
  const endpoints = data?.endpoints ?? [];

  // UI state
  const [showCreate, setShowCreate] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [rotatingId, setRotatingId] = useState<string | null>(null);
  const [newSecret, setNewSecret] = useState<string | null>(null);

  // Stats
  const activeCount = endpoints.filter((ep) => ep.is_active).length;
  const inactiveCount = endpoints.length - activeCount;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newUrl) return;
    setCreating(true);
    setError('');
    try {
      await endpointsApi.create(token, {
        url: newUrl,
        description: newDesc || undefined,
        application_id: appId,
      });
      queryClient.invalidateQueries({ queryKey: ['application', appId] });
      queryClient.invalidateQueries({ queryKey: ['endpoints'] });
      setNewUrl('');
      setNewDesc('');
      setShowCreate(false);
      toast(t('endpointCreated') || 'Endpoint created', 'success');
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : tc('unknownError')) || tc('failedToCreate'));
    } finally {
      setCreating(false);
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

  const handleDelete = async () => {
    if (!token || !deleteId) return;
    try {
      await deleteEndpointMutation.mutateAsync(deleteId);
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ['application', appId] });
    } catch (err: unknown) {
      toast((err instanceof Error ? err.message : tc('unknownError')) || tc('failedToDelete'), 'error');
    }
  };

  const handleRotateSecret = async (epId: string) => {
    if (!token) return;
    setRotatingId(epId);
    try {
      const data = await endpointsApi.rotateSecret(token, epId);
      setNewSecret(data.signing_secret);
      toast(te('secretRotated'), 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : tc('error'), 'error');
    } finally {
      setRotatingId(null);
    }
  };

  // ─── Loading
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-48 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse" />
      </div>
    );
  }

  // ─── Not found
  if (!app) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="flex justify-center mb-4 text-gray-400"><AlertCircle size={48} strokeWidth={1.5} /></div>
        <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
          {t('notFound') || 'Application not found'}
        </p>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
          {t('notFoundDesc') || 'This application may have been deleted or you don\'t have access.'}
        </p>
        <button
          type="button"
          onClick={() => router.push('/applications')}
          className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-xl hover:opacity-90 transition"
        >
          ← {t('backToList') || 'Back to applications'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* ── Breadcrumb + Header ── */}
      <div>
        <button
          type="button"
          onClick={() => router.push('/applications')}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('title') || 'Applications'}
        </button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
                {app.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {app.name}
                </h1>
                {app.description && (
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                    {app.description}
                  </p>
                )}
              </div>
            </div>
          </div>
          <span className="font-mono text-xs text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
            {app.id.slice(0, 8)}…
          </span>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
              <span className="text-xl"><Link2 size={18} strokeWidth={1.75} /></span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{endpoints.length}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">{te('title') || 'Endpoints'}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
              <span className="text-xl"><CheckCircle2 size={18} strokeWidth={1.75} /></span>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activeCount}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">{t('active') || 'Active'}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-500/10 flex items-center justify-center">
              <span className="text-xl"><Pause size={18} strokeWidth={1.75} /></span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-400 dark:text-slate-500">{inactiveCount}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">{t('inactive') || 'Inactive'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Endpoints Section ── */}
      <LazySection fallback={Skeletons.card} rootMargin={300}>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {te('title') || 'Endpoints'}
          </h2>
          <button
            type="button"
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-xl hover:opacity-90 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {te('newEndpoint') || 'New Endpoint'}
          </button>
        </div>

        {/* ── Create Form ── */}
        {showCreate && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              {te('create') || 'Create endpoint'}
            </h3>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm border border-red-200 dark:border-red-500/20">
                {error}
              </div>
            )}
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label htmlFor="ep-url" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  {te('urlLabel') || 'URL'}
                </label>
                <input
                  id="ep-url"
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder={te('form.urlPlaceholder') || 'https://your-app.com/webhooks'}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder:text-gray-400 dark:placeholder:text-slate-500"
                />
              </div>
              <div>
                <label htmlFor="ep-desc" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  {te('descriptionLabel') || 'Description'}
                </label>
                <input
                  id="ep-desc"
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder={te('form.descriptionPlaceholder') || 'What does this endpoint do?'}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder:text-gray-400 dark:placeholder:text-slate-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-xl hover:opacity-90 transition disabled:opacity-50"
                >
                  {creating ? (tc('creating') || 'Creating...') : (tc('create') || 'Create')}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCreate(false); setError(''); }}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition"
                >
                  {tc('cancel') || 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Endpoint Cards ── */}
        {endpoints.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
              <span className="text-3xl"><Link2 size={18} strokeWidth={1.75} /></span>
            </div>
            <p className="text-base font-medium text-gray-900 dark:text-white mb-1">
              {te('noEndpointsYet') || 'No endpoints yet'}
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
              {t('noEndpointsDesc') || 'Create your first endpoint to start receiving webhooks.'}
            </p>
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-xl hover:opacity-90 transition"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {te('newEndpoint') || 'New Endpoint'}
              </span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {endpoints.map((ep) => (
              <div
                key={ep.id}
                className="group bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 hover:border-gray-300 dark:hover:border-slate-600 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {/* Status indicator */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={ep.is_active}
                        onClick={() => handleToggle(ep.id, ep.is_active)}
                        disabled={togglingId === ep.id}
                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
                          ep.is_active
                            ? 'bg-emerald-500'
                            : 'bg-gray-300 dark:bg-slate-600'
                        } ${togglingId === ep.id ? 'opacity-60' : ''}`}
                        title={ep.is_active ? (te('disable') || 'Disable') : (te('enable') || 'Enable')}
                      >
                        <div
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                            ep.is_active ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>

                      {/* ID badge */}
                      <span className="font-mono text-xs text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                        {ep.id.slice(0, 8)}…
                      </span>

                      {/* Active/Inactive label */}
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                          ep.is_active
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                            : 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            ep.is_active ? 'bg-emerald-500' : 'bg-gray-400 dark:bg-slate-500'
                          }`}
                        />
                        {ep.is_active ? (t('active') || 'Active') : (t('inactive') || 'Inactive')}
                      </span>
                    </div>

                    {/* URL */}
                    <p className="text-sm font-mono text-gray-900 dark:text-white truncate mb-1">
                      {ep.url}
                    </p>

                    {/* Description */}
                    {ep.description && (
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        {ep.description}
                      </p>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Secret rotation */}
                    <button
                      type="button"
                      onClick={() => handleRotateSecret(ep.id)}
                      disabled={rotatingId === ep.id}
                      className="p-2 text-gray-400 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition"
                      title={te('rotateSecret') || 'Rotate secret'}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </button>

                    {/* Settings */}
                    <button
                      type="button"
                      onClick={() => router.push(`/endpoints/${ep.id}`)}
                      className="p-2 text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
                      title={te('settingsTitle') || 'Settings'}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => setDeleteId(ep.id)}
                      className="p-2 text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition"
                      title={te('deleteTitle') || 'Delete'}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </LazySection>

      {/* ── Confirm Delete Dialog ── */}
      <ConfirmDialog
        open={!!deleteId}
        title={te('deleteTitle') || 'Delete endpoint'}
        message={te('deleteConfirm') || 'Are you sure you want to delete this endpoint? All delivery logs will be permanently removed.'}
        confirmLabel={te('delete') || 'Delete'}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* ── New Secret Modal ── */}
      {newSecret && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setNewSecret(null)}
          />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                <span className="text-xl"><Key size={18} strokeWidth={1.75} /></span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {te('newSecret') || 'New Secret'}
              </h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              {te('newSecretDesc') || 'Copy this secret now. You won\'t be able to see it again.'}
            </p>
            <div className="bg-gray-50 dark:bg-slate-900 rounded-xl p-4 mb-5 border border-gray-200 dark:border-slate-700">
              <code className="text-sm font-mono text-gray-900 dark:text-white break-all select-all">
                {newSecret}
              </code>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(newSecret);
                  toast(te('copied') || 'Copied!', 'success');
                }}
                className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-xl hover:opacity-90 transition"
              >
                <ClipboardList size={16} strokeWidth={1.75} className="inline mr-1" /> {te('copy') || 'Copy'}
              </button>
              <button
                type="button"
                onClick={() => setNewSecret(null)}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition"
              >
                {tc('close') || 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
