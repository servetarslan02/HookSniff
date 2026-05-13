'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { apiFetch } from '@/lib/api';
import { useTranslations } from 'next-intl';
import ConfirmDialog from '@/components/ConfirmDialog';

/* ─── Types ─── */

interface ServiceToken {
  id: string;
  name: string;
  token_prefix: string;
  created_at: string;
  last_used_at?: string;
}

/* ─── Page ─── */

export default function ServiceTokensPage() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const t = useTranslations('serviceTokens');
  const tc = useTranslations('common');

  const [tokens, setTokens] = useState<ServiceToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [revealedTokens, setRevealedTokens] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const loadTokens = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiFetch<ServiceToken[]>('/service-tokens', { token });
      setTokens(data);
    } catch {
      // API may not exist yet — show empty state
      setTokens([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newName.trim()) return;
    setCreating(true);
    try {
      const created = await apiFetch<ServiceToken>('/service-tokens', {
        method: 'POST',
        body: { name: newName.trim() },
        token,
      });
      setTokens((prev) => [created, ...prev]);
      setNewName('');
      setShowCreate(false);
      toast(t('created'), 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : tc('failedToCreate'), 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !deleteId) return;
    setDeleting(true);
    try {
      await apiFetch(`/service-tokens/${deleteId}`, { method: 'DELETE', token });
      setTokens((prev) => prev.filter((t) => t.id !== deleteId));
      toast(t('deleted'), 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : tc('failedToDelete'), 'error');
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleReveal = async (tokenId: string) => {
    if (revealedTokens[tokenId]) {
      setRevealedTokens((prev) => {
        const next = { ...prev };
        delete next[tokenId];
        return next;
      });
      return;
    }
    if (!token) return;
    try {
      const data = await apiFetch<{ token: string }>(`/service-tokens/${tokenId}/reveal`, { token });
      setRevealedTokens((prev) => ({ ...prev, [tokenId]: data.token }));
    } catch {
      toast(tc('failedToLoad'), 'error');
    }
  };

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast(tc('copied'), 'success');
    } catch {
      toast(tc('error'), 'error');
    }
  };

  const startEdit = (tok: ServiceToken) => {
    setEditingId(tok.id);
    setEditName(tok.name);
  };

  const handleEditSave = async () => {
    if (!token || !editingId || !editName.trim()) return;
    setSavingEdit(true);
    try {
      await apiFetch(`/service-tokens/${editingId}`, {
        method: 'PUT',
        body: { name: editName.trim() },
        token,
      });
      setTokens((prev) =>
        prev.map((t) => (t.id === editingId ? { ...t, name: editName.trim() } : t))
      );
      setEditingId(null);
      toast(tc('success'), 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : tc('error'), 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const orgId = user?.id || '';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://docs.hooksniff.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            {t('documentation')}
          </a>
          <a
            href="https://docs.hooksniff.com/api"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
            </svg>
            {t('apiReference')}
          </a>
        </div>
      </div>

      {/* ── Tokens Table ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-3">{t('name')}</th>
                <th className="px-6 py-3">{t('token')}</th>
                <th className="px-6 py-3">{t('createdAt')}</th>
                <th className="px-6 py-3 text-right">{tc('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {tokens.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                    </svg>
                    <p className="text-sm text-gray-500 dark:text-slate-400">{t('noTokens')}</p>
                  </td>
                </tr>
              ) : (
                tokens.map((tok) => (
                  <tr key={tok.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-3">
                      {editingId === tok.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleEditSave();
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                          />
                          <button
                            onClick={handleEditSave}
                            disabled={savingEdit}
                            className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs font-medium"
                          >
                            {savingEdit ? tc('saving') : tc('save')}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs"
                          >
                            {tc('cancel')}
                          </button>
                        </div>
                      ) : (
                        <span className="font-medium text-gray-900 dark:text-white">{tok.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded select-all">
                          {revealedTokens[tok.id] || tok.token_prefix || '••••••••••••••••'}
                        </code>
                        <button
                          onClick={() => handleReveal(tok.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                          title={revealedTokens[tok.id] ? t('hide') : t('reveal')}
                        >
                          {revealedTokens[tok.id] ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleCopy(revealedTokens[tok.id] || tok.token_prefix || '')}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                          title={tc('copyToClipboard')}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-500 dark:text-slate-400 text-xs">
                      {formatDate(tok.created_at)}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEdit(tok)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                          {tc('edit')}
                        </button>
                        <button
                          onClick={() => setDeleteId(tok.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          {tc('delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Create Button ── */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {t('createToken')}
          </button>
        </div>
      </div>

      {/* ── Create Form ── */}
      {showCreate && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{t('createTitle')}</h3>
          <form onSubmit={handleCreate} className="flex items-end gap-3">
            <div className="flex-1">
              <label htmlFor="token-name" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                {t('name')}
              </label>
              <input
                id="token-name"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t('namePlaceholder')}
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-60"
            >
              {creating ? tc('creating') : tc('create')}
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              {tc('cancel')}
            </button>
          </form>
        </div>
      )}

      {/* ── Quick Reference ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('quickRef')}</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{t('quickRefDesc')}</p>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600 dark:text-slate-300 whitespace-nowrap">{t('orgId')}:</span>
          <code className="flex-1 text-xs font-mono text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg select-all">
            {orgId}
          </code>
          <button
            onClick={() => handleCopy(orgId)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
            title={tc('copyToClipboard')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── AI Assistants (MCP) ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('aiAssistants')}</h2>
            <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
              MCP
            </span>
          </div>
          <a
            href="https://docs.hooksniff.com/mcp"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.384 3.18.75-5.97L2.414 8.18l5.99-.87L11.42 2l2.98 5.31 5.99.87-4.372 4.2.75 5.97z" />
            </svg>
            {t('setupGuide')}
          </a>
        </div>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{t('aiDesc')}</p>

        <div className="space-y-2 mb-4">
          <p className="text-sm text-gray-600 dark:text-slate-300 font-medium">{t('aiCapabilities')}:</p>
          {[
            t('aiCap1'),
            t('aiCap2'),
            t('aiCap3'),
            t('aiCap4'),
          ].map((cap, i) => (
            <div key={i} className="flex items-start gap-2">
              <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-gray-600 dark:text-slate-400">{cap}</span>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg p-4">
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">{t('quickStart')}</p>
          <p className="text-sm text-blue-700 dark:text-blue-400">{t('quickStartDesc')}</p>
        </div>
      </div>

      {/* ── Delete Confirmation ── */}
      <ConfirmDialog
        open={!!deleteId}
        title={t('deleteTitle')}
        message={t('deleteConfirm')}
        confirmLabel={tc('delete')}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  );
}
