'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/store';
import { apiFetch } from '@/lib/api';
import { useTranslations } from 'next-intl';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';

/* ─── Hook0-style: Service Tokens (API Keys) ─── */

interface ApiKey {
  id: string;
  name: string | null;
  prefix: string;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
}

export default function ApiKeysPage() {
  const t = useTranslations('apiKeys');
  const tc = useTranslations('common');
  const { token } = useAuth();
  const { toast } = useToast();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    try {
      const data = await apiFetch<ApiKey[]>('/api-keys', { token: token || undefined });
      setKeys(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const data = await apiFetch<{ key: string }>('/api-keys', {
        method: 'POST',
        body: { name: newName || undefined },
        token: token || undefined,
      });
      setNewKey(data.key);
      setNewName('');
      setShowCreate(false);
      fetchKeys();
    } catch (err) {
      toast(err instanceof Error ? err.message : tc('unknownError'), 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await apiFetch(`/api-keys/${deleteId}`, {
        method: 'DELETE',
        token: token || undefined,
      });
      setKeys((prev) => prev.filter((k) => k.id !== deleteId));
      toast(t('deleted') || 'Silindi', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : tc('unknownError'), 'error');
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Başlık + Create ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('title') || 'Hizmet Jetonları'}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {t('subtitle') || "HookSniff'e programatik erişim için API anahtarları"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition"
        >
          + {t('create') || 'Jeton oluştur'}
        </button>
      </div>

      {/* ── Yeni Key Alert ── */}
      {newKey && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">
            {t('keyCreated') || 'Anahtar oluşturuldu!'}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mb-2">
            {t('copyKey') || 'Bu anahtarı bir daha göremeyeceksiniz, şimdi kopyalayın.'}
          </p>
          <code className="block p-2 bg-white dark:bg-gray-900 rounded text-xs font-mono text-gray-900 dark:text-gray-200 break-all">
            {newKey}
          </code>
          <button
            type="button"
            onClick={() => { navigator.clipboard.writeText(newKey); setNewKey(null); }}
            className="mt-2 text-xs text-green-700 dark:text-green-400 hover:underline"
          >
            {t('copied') || 'Kopyala ve kapat'}
          </button>
        </div>
      )}

      {/* ── Create Form ── */}
      {showCreate && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t('namePlaceholder') || 'İsim (opsiyonel)'}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-60"
            >
              {creating ? (tc('creating') || 'Oluşturuluyor...') : (tc('create') || 'Oluştur')}
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 text-sm rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {tc('cancel') || 'İptal'}
            </button>
          </div>
        </div>
      )}

      {/* ── Tablo veya Boş Durum ── */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {keys.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="text-4xl mb-3">🔑</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('noTokens') || 'Hizmet belirteci yok'}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {t('createHint') || 'Programatik erişim için bir jeton oluşturun'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('nameLabel') || 'İsim'}</th>
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">Prefix</th>
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('created') || 'Oluşturulma'}</th>
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('lastUsed') || 'Son kullanım'}</th>
                  <th className="text-right px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('actions') || 'Eylemler'}</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-5 py-3 text-gray-900 dark:text-white">{k.name || '—'}</td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{k.prefix}…</td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs">
                      {new Date(k.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs">
                      {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString('tr-TR') : '—'}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setDeleteId(k.id)}
                        className="text-gray-400 hover:text-red-600 transition"
                        title={t('delete') || 'Sil'}
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Organization ID Referans (Hook0 gibi) ── */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          {t('orgId') || 'Organizasyon Kimliği'}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          {t('orgIdDesc') || 'API isteklerinde kullanmak üzere organizasyon kimliğiniz'}
        </p>
        <code className="block p-2 bg-gray-50 dark:bg-gray-900 rounded text-xs font-mono text-gray-600 dark:text-gray-400">
          {token ? token.slice(0, 20) + '...' : '—'}
        </code>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title={t('deleteTitle') || 'Jetonyu sil'}
        message={t('deleteDesc') || 'Bu jetonu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.'}
        confirmLabel={tc('delete') || 'Sil'}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
