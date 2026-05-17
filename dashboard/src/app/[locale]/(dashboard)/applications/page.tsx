'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/lib/store';
import { applicationsApi, type Application } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';
import { useApplications } from '@/hooks/useDashboardData';
import { useQueryClient } from '@tanstack/react-query';

/* ─── Hook0-style: Application card grid ─── */

interface AppLabel {
  text: string;
  color: string;
}

function getAppLabels(app: Application): AppLabel[] {
  const labels: AppLabel[] = [];
  if (app.is_active) {
    labels.push({ text: 'active', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' });
  } else {
    labels.push({ text: 'inactive', color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' });
  }
  const created = new Date(app.created_at);
  const daysSinceCreated = Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
  if (daysSinceCreated < 7) {
    labels.push({ text: 'new', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' });
  }
  if (app.endpoint_count > 5) {
    labels.push({ text: 'production', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' });
  }
  return labels;
}

export default function ApplicationsPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const t = useTranslations('applications');
  const tc = useTranslations('common');

  // React Query hook for data fetching
  const { data: apps = [], isLoading: loading } = useApplications();

  // UI state (kept as useState)
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editApp, setEditApp] = useState<Application | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState('');

  const filteredApps = useMemo(() => {
    if (!search.trim()) return apps;
    const q = search.toLowerCase();
    return apps.filter(
      (app) =>
        app.name.toLowerCase().includes(q) ||
        app.id.toLowerCase().includes(q) ||
        (app.description && app.description.toLowerCase().includes(q))
    );
  }, [apps, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newName) return;
    setCreating(true);
    setError('');
    try {
      await applicationsApi.create(token, { name: newName, description: newDesc || undefined });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setNewName('');
      setNewDesc('');
      setShowCreate(false);
      toast(t('created') || 'Application created', 'success');
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : tc('unknownError')) || tc('failedToCreate'));
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editApp || !editName.trim()) return;
    setEditing(true);
    try {
      await applicationsApi.update(token, editApp.id, { name: editName.trim(), description: editDesc.trim() || undefined });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setEditApp(null);
      toast(t('updated') || 'Application updated', 'success');
    } catch (err: unknown) {
      toast((err instanceof Error ? err.message : tc('unknownError')) || tc('failedToUpdate'), 'error');
    } finally {
      setEditing(false);
    }
  };

  const confirmDelete = async () => {
    if (!token || !deleteId) return;
    try {
      await applicationsApi.delete(token, deleteId);
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast(t('deleted') || 'Application deleted', 'success');
    } catch (err: unknown) {
      toast((err instanceof Error ? err.message : tc('unknownError')) || tc('failedToDelete'), 'error');
    } finally {
      setDeleteId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-sm animate-pulse" />
          <div className="h-10 w-44 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>
        <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('title') || 'Applications'}
          </h2>
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
            {apps.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
        >
          {t('create') || 'Create application'}
        </button>
      </div>

      {/* ── Search ── */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('searchPlaceholder') || 'Search for a specific application...'}
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* ── Create Form ── */}
      {showCreate && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            {t('create') || 'Create application'}
          </h3>
          {error && (
            <div className="mb-3 p-2 rounded-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">{error}</div>
          )}
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label htmlFor="app-name" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                {t('nameLabel') || 'Name'}
              </label>
              <input
                id="app-name"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t('namePlaceholder') || 'My Application'}
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="app-desc" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                {t('descriptionLabel') || 'Description'}
              </label>
              <input
                id="app-desc"
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder={t('descriptionPlaceholder') || 'Optional description'}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-60"
              >
                {creating ? (tc('creating') || 'Creating...') : (tc('create') || 'Create')}
              </button>
              <button
                type="button"
                onClick={() => { setShowCreate(false); setError(''); }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                {tc('cancel') || 'Cancel'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Card Grid ── */}
      {filteredApps.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-5 py-16 text-center">
          <div className="text-4xl mb-3">📱</div>
          <p className="text-gray-900 dark:text-white font-medium">
            {search ? (tc('noResults') || 'No results found') : (t('empty') || 'No applications')}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {search
              ? 'Try a different search term'
              : (t('subtitle') || 'Create your first application to get started')}
          </p>
          {!search && (
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
            >
              {t('create') || 'Create application'}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredApps.map((app) => {
            const labels = getAppLabels(app);
            return (
              <div
                key={app.id}
                className="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
              >
                {/* UUID */}
                <p className="text-[11px] font-mono text-gray-400 dark:text-gray-500 mb-1 truncate">
                  {app.id}
                </p>

                {/* Name */}
                <Link
                  href={`/applications/${app.id}`}
                  className="text-base font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {app.name}
                </Link>

                {/* Description */}
                {app.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {app.description}
                  </p>
                )}

                {/* Labels */}
                {labels.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {labels.map((label) => (
                      <span
                        key={label.text}
                        className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full ${label.color}`}
                      >
                        {label.text}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <Link
                    href={`/applications/${app.id}`}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                  >
                    {t('manageEndpoints') || 'Manage endpoints'} →
                  </Link>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {tc('created') || 'Created'} {formatDate(app.created_at)}
                  </span>
                </div>

                {/* Action buttons (small, top-right) */}
                <div className="absolute top-4 right-4 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => { setEditApp(app); setEditName(app.name); setEditDesc(app.description || ''); }}
                    className="p-1 text-gray-300 hover:text-indigo-500 dark:text-gray-600 dark:hover:text-indigo-400 transition"
                    title={t('edit') || 'Edit'}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(app.id)}
                    className="p-1 text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 transition"
                    title={t('delete') || 'Delete'}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setEditApp(null)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              ✏️ {t('editApp') || 'Edit Application'}
            </h3>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('nameLabel') || 'Name'}</label>
                <input
                  id="edit-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label htmlFor="edit-desc" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('descriptionLabel') || 'Description'}</label>
                <input
                  id="edit-desc"
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setEditApp(null)} className="px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition">{tc('cancel')}</button>
                <button type="submit" disabled={editing || !editName.trim()} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition disabled:opacity-60">{editing ? (tc('saving') || 'Saving...') : (tc('save') || 'Save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title={t('deleteTitle') || 'Delete application'}
        message={t('deleteConfirm') || 'Are you sure you want to delete this application? All endpoints and delivery logs will be permanently removed.'}
        confirmLabel={t('delete') || 'Delete'}
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
