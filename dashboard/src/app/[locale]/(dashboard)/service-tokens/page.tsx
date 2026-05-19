'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/store';
import { useTranslations } from 'next-intl';
import { useServiceTokens, useCreateServiceToken, useDeleteServiceToken, useRevealServiceToken, useUpdateServiceToken } from '@/hooks/useDashboardData';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';
import { ClipboardList, Eye, EyeOff } from 'lucide-react';

export default function ServiceTokensPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const t = useTranslations('serviceTokens');
  const tc = useTranslations('common');

  const { data: tokens = [], isLoading } = useServiceTokens();
  const createToken = useCreateServiceToken();
  const deleteToken = useDeleteServiceToken();
  const revealToken = useRevealServiceToken();
  const updateToken = useUpdateServiceToken();

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [revealedTokens, setRevealedTokens] = useState<Record<string, React.ReactNode>>({});
  const [newlyCreatedToken, setNewlyCreatedToken] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    createToken.mutate(newName.trim(), {
      onSuccess: (data) => {
        setNewName('');
        setShowCreate(false);
        if (data.token) setNewlyCreatedToken(data.token);
        toast(t('created'), 'success');
      },
      onError: (err) => toast(err instanceof Error ? err.message : tc('failedToCreate'), 'error'),
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteToken.mutate(deleteId, {
      onSuccess: () => { setDeleteId(null); toast(t('deleted'), 'success'); },
      onError: (err) => toast(err instanceof Error ? err.message : tc('failedToDelete'), 'error'),
    });
  };

  const handleReveal = (tokenId: string) => {
    if (revealedTokens[tokenId]) {
      setRevealedTokens((prev) => { const next = { ...prev }; delete next[tokenId]; return next; });
      return;
    }
    revealToken.mutate(tokenId, {
      onSuccess: (data) => {
        if (data.token) setRevealedTokens((prev) => ({ ...prev, [tokenId]: data.token! }));
        else toast(data.message || t('tokenNotAvailable'), 'info');
      },
    });
  };

  const handleCopy = async (value: string) => {
    try { await navigator.clipboard.writeText(value); toast(tc('copied'), 'success'); }
    catch { toast(tc('error'), 'error'); }
  };

  const handleEditSave = () => {
    if (!editingId || !editName.trim()) return;
    updateToken.mutate({ id: editingId, body: { name: editName.trim() } }, {
      onSuccess: () => { setEditingId(null); toast(tc('success'), 'success'); },
      onError: (err) => toast(err instanceof Error ? err.message : tc('error'), 'error'),
    });
  };

  const formatDate = (dateStr: string) => {
    try { return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return dateStr; }
  };

  const orgId = user?.id || '';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-sm animate-pulse" />
        <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="https://docs.hooksniff.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
            {t('documentation')}
          </a>
        </div>
      </div>

      {/* Newly Created Token Banner */}
      {newlyCreatedToken && (
        <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-xl p-4">
          <p className="text-sm text-green-800 dark:text-green-300 mb-2">{t('tokenCreated')}</p>
          <code className="text-sm font-mono bg-green-100 dark:bg-green-500/20 px-3 py-1 rounded-sm select-all break-all">{newlyCreatedToken}</code>
          <div className="flex items-center gap-3 mt-2">
            <button onClick={() => { navigator.clipboard.writeText(newlyCreatedToken); toast(tc('copied'), 'success'); }} className="text-sm text-green-700 dark:text-green-400 hover:underline">{tc('copy')}</button>
            <button onClick={() => setNewlyCreatedToken(null)} className="text-sm text-green-700 dark:text-green-400 hover:underline">{tc('close')}</button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                <th className="px-3 sm:px-6 py-3">{t('name')}</th>
                <th className="px-3 sm:px-6 py-3">{t('token')}</th>
                <th className="px-3 sm:px-6 py-3 hidden sm:table-cell">{t('createdAt')}</th>
                <th className="px-3 sm:px-6 py-3 text-right">{tc('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {tokens.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-slate-400">{t('noTokens')}</td></tr>
              ) : tokens.map((tok) => (
                <tr key={tok.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-3 sm:px-6 py-3">
                    {editingId === tok.id ? (
                      <div className="flex items-center gap-2">
                        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="px-2 py-1 text-sm rounded-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" autoFocus onKeyDown={(e) => { if (e.key === 'Enter') handleEditSave(); if (e.key === 'Escape') setEditingId(null); }} />
                        <button onClick={handleEditSave} disabled={updateToken.isPending} className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs font-medium">{updateToken.isPending ? tc('saving') : tc('save')}</button>
                        <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs">{tc('cancel')}</button>
                      </div>
                    ) : (
                      <span className="font-medium text-gray-900 dark:text-white">{tok.name}</span>
                    )}
                  </td>
                  <td className="px-3 sm:px-6 py-3">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <code className="text-xs font-mono text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-gray-700 px-1.5 sm:px-2 py-1 rounded-sm select-all truncate max-w-[120px] sm:max-w-none">{revealedTokens[tok.id] || tok.token_prefix || '••••••••••••••••'}</code>
                      <button onClick={() => handleReveal(tok.id)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition" title={revealedTokens[tok.id] ? t('hide') : t('reveal')}>{revealedTokens[tok.id] ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}</button>
                      <button onClick={() => handleCopy(revealedTokens[tok.id] || tok.token_prefix || '')} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition hidden sm:inline-flex" title={tc('copyToClipboard')}><ClipboardList size={18} strokeWidth={1.75} /></button>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 text-gray-500 dark:text-slate-400 text-xs hidden sm:table-cell">{formatDate(tok.created_at)}</td>
                  <td className="px-3 sm:px-6 py-3">
                    <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                      <button onClick={() => { setEditingId(tok.id); setEditName(tok.name); }} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition">{tc('edit')}</button>
                      <button onClick={() => setDeleteId(tok.id)} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition">{tc('delete')}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={() => setShowCreate(!showCreate)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition">+ {t('createToken')}</button>
        </div>
      </div>

      {/* Create Token Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowCreate(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('createTitle')}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">{t('createDesc') || t('subtitle')}</p>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label htmlFor="token-name" className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t('name')}</label>
                <input
                  id="token-name"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={t('namePlaceholder')}
                  required
                  autoFocus
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => { setShowCreate(false); setNewName(''); }} className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition">
                  {tc('cancel')}
                </button>
                <button type="submit" disabled={createToken.isPending || !newName.trim()} className="px-5 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition disabled:opacity-60 shadow-sm">
                  {createToken.isPending ? tc('creating') : tc('create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('quickRef')}</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{t('quickRefDesc')}</p>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600 dark:text-slate-300 whitespace-nowrap">{t('orgId')}:</span>
          <code className="flex-1 text-xs font-mono text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg select-all">{orgId}</code>
          <button onClick={() => handleCopy(orgId)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition" title={tc('copyToClipboard')}><ClipboardList size={18} strokeWidth={1.75} /></button>
        </div>
      </div>

      <ConfirmDialog open={!!deleteId} title={t('deleteTitle')} message={t('deleteConfirm')} confirmLabel={tc('delete')} variant="danger" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={deleteToken.isPending} />
    </div>
  );
}
