'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/store';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface ApiKey {
  id: string;
  prefix: string;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
}

export default function ApiKeysPage() {
  const { token } = useAuth();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api-keys`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setKeys(await res.json());
    } catch (e) {
      console.error('Failed to fetch API keys:', e);
    } finally {
      setLoading(false);
    }
  }, [token, API]);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const createKey = async () => {
    setCreating(true);
    setError('');
    try {
      const res = await fetch(`${API}/api-keys`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: keyName || undefined }),
      });
      if (!res.ok) throw new Error('Failed to create key');
      const data = await res.json();
      setNewKey(data.key);
      setKeyName('');
      fetchKeys();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const deleteKey = async (id: string) => {
    if (!confirm('Delete this API key? This cannot be undone.')) return;
    try {
      await fetch(`${API}/api-keys/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchKeys();
    } catch (e) {
      console.error('Failed to delete key:', e);
    }
  };

  const rotateKey = async (id: string) => {
    if (!confirm('Rotate this key? The old key will stop working immediately.')) return;
    try {
      const res = await fetch(`${API}/api-keys/${id}/rotate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNewKey(data.key);
      fetchKeys();
    } catch (e) {
      console.error('Failed to rotate key:', e);
    }
  };

  const copyKey = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">API Keys</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          Manage your API keys for webhook delivery authentication.
        </p>
      </div>

      {/* New Key Alert */}
      {newKey && (
        <div className="glass-card p-6 border-l-4 border-green-500 bg-green-50/50 dark:bg-green-500/10">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-2">
            🔑 New API Key Created
          </h3>
          <p className="text-sm text-green-700 dark:text-green-300 mb-3">
            Save this key now — it won't be shown again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-3 bg-white dark:bg-slate-800 rounded-lg text-sm font-mono break-all border border-green-200 dark:border-green-500/30">
              {newKey}
            </code>
            <button
              onClick={copyKey}
              className="px-4 py-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <button
            onClick={() => setNewKey(null)}
            className="mt-3 text-sm text-green-700 dark:text-green-400 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Create Key */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Key</h2>
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
        <div className="flex gap-3">
          <input
            type="text"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            placeholder="Key name (optional)"
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 transition"
          />
          <button
            onClick={createKey}
            disabled={creating}
            className="px-6 py-3 bg-gray-900 dark:bg-brand-600 text-white rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-brand-700 transition disabled:opacity-60"
          >
            {creating ? 'Creating...' : 'Create Key'}
          </button>
        </div>
      </div>

      {/* Key List */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Keys</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400 dark:text-slate-500">Loading...</div>
        ) : keys.length === 0 ? (
          <div className="p-12 text-center text-gray-400 dark:text-slate-500">
            No API keys yet. Create one above.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {keys.map((key) => (
              <div key={key.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition">
                <div>
                  <div className="flex items-center gap-3">
                    <code className="text-sm font-mono text-gray-700 dark:text-slate-300">
                      {key.prefix}...
                    </code>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      key.is_active
                        ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
                    }`}>
                      {key.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                    Created {new Date(key.created_at).toLocaleDateString()}
                    {key.last_used_at && ` · Last used ${new Date(key.last_used_at).toLocaleDateString()}`}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => rotateKey(key.id)}
                    className="px-3 py-1.5 text-xs text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-slate-600 rounded-lg transition"
                  >
                    Rotate
                  </button>
                  <button
                    onClick={() => deleteKey(key.id)}
                    className="px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-300 dark:border-red-500/30 rounded-lg transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
