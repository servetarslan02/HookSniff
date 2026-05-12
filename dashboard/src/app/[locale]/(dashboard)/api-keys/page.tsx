'use client';

import { getErrorMessage } from '@/lib/errors';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/store';
import { apiFetch } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { NewKeyAlert } from './components/NewKeyAlert';
import { CreateKeyForm } from './components/CreateKeyForm';
import { KeyList } from './components/KeyList';
import { ConfirmActionModal } from './components/ConfirmActionModal';

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
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [rotateTarget, setRotateTarget] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    try {
      const data = await apiFetch<ApiKey[]>('/api-keys', { token: token || undefined });
      setKeys(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('failedToLoad'));
    } finally {
      setLoading(false);
    }
  }, [token, t]);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const createKey = async (name?: string) => {
    setError('');
    try {
      const data = await apiFetch<{ key: string }>('/api-keys', {
        method: 'POST',
        body: { name },
        token: token || undefined,
      });
      setNewKey(data.key);
      fetchKeys();
    } catch (e: unknown) {
      setError(getErrorMessage(e, tc('unknownError')));
    }
  };

  const deleteKey = async (id: string) => {
    setActionLoading(id);
    try {
      await apiFetch(`/api-keys/${id}`, {
        method: 'DELETE',
        token: token || undefined,
      });
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } catch (e: unknown) {
      setError(getErrorMessage(e, tc('unknownError')));
    } finally {
      setActionLoading(null);
      setDeleteTarget(null);
    }
  };

  const rotateKey = async (id: string) => {
    setActionLoading(id);
    try {
      const data = await apiFetch<{ key: string }>(`/api-keys/${id}/rotate`, {
        method: 'POST',
        token: token || undefined,
      });
      setNewKey(data.key);
      fetchKeys();
    } catch (e: unknown) {
      setError(getErrorMessage(e, tc('unknownError')));
    } finally {
      setActionLoading(null);
      setRotateTarget(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-between">
          <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
          <button type="button" onClick={() => setError('')} aria-label={t("dismissError")} className="text-red-400 hover:text-red-600 transition">✕</button>
        </div>
      )}

      {newKey && (
        <NewKeyAlert newKey={newKey} onDismiss={() => setNewKey(null)} />
      )}

      <CreateKeyForm onCreate={createKey} />

      <KeyList
        keys={keys}
        loading={loading}
        onRotate={setRotateTarget}
        onDelete={setDeleteTarget}
        actionLoading={actionLoading}
      />

      <ConfirmActionModal
        open={deleteTarget !== null}
        title={t('deleteTitle')}
        description={t('deleteDesc')}
        confirmLabel={tc('delete')}
        confirmVariant="danger"
        loading={actionLoading === deleteTarget}
        onConfirm={() => deleteTarget && deleteKey(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmActionModal
        open={rotateTarget !== null}
        title={t('rotateTitle')}
        description={t('rotateDesc')}
        confirmLabel={t('rotate')}
        confirmVariant="warning"
        loading={actionLoading === rotateTarget}
        onConfirm={() => rotateTarget && rotateKey(rotateTarget)}
        onCancel={() => setRotateTarget(null)}
      />
    </div>
  );
}
