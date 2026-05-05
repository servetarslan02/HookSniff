'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { endpointsApi, type Endpoint } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function EndpointsPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Endpoint | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [revealedSecrets, setRevealedSecrets] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchEndpoints = useCallback(async () => {
    if (!token) return;
    try {
      const data = await endpointsApi.list(token);
      setEndpoints(data);
    } catch (err: any) {
      toast(err.message || 'Failed to load endpoints', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => { fetchEndpoints(); }, [fetchEndpoints]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setCreating(true);
    try {
      const ep = await endpointsApi.create(token, { url, description: description || undefined });
      setEndpoints((prev) => [ep, ...prev]);
      setUrl('');
      setDescription('');
      toast('Endpoint created!', 'success');
    } catch (err: any) {
      toast(err.message || 'Failed to create endpoint', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !token) return;
    setDeleting(true);
    try {
      await endpointsApi.delete(token, deleteTarget.id);
      setEndpoints((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      toast('Endpoint deleted', 'success');
    } catch (err: any) {
      toast(err.message || 'Failed to delete', 'error');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast('Copied to clipboard', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSecret = (id: string) => {
    setRevealedSecrets((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = endpoints.filter((ep) =>
    ep.url.toLowerCase().includes(search.toLowerCase()) ||
    ep.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Endpoints</h1>
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search endpoints..."
            className="pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
          <span className="absolute left-2.5 top-2.5 text-gray-400 text-sm">🔍</span>
        </div>
      </div>

      {/* Create Form */}
      <form onSubmit={handleCreate} className="glass-card p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Endpoint</h2>
        <div className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Target URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://myapp.com/webhook"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Order notifications"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="bg-brand-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-brand-700 transition disabled:opacity-60 flex items-center gap-2 whitespace-nowrap"
          >
            {creating ? <LoadingSpinner size="sm" /> : '+ Add'}
          </button>
        </div>
      </form>

      {/* Endpoints List */}
      {loading ? (
        <div className="flex justify-center py-12"><LoadingSpinner /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🔗"
          title="No endpoints yet"
          description="Add your first endpoint to start receiving webhooks."
          action={{ label: '+ Add Endpoint', onClick: () => document.querySelector('input[type="url"]')?.(HTMLElement)?.focus() }}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((ep) => (
            <div key={ep.id} className="glass-card p-6 hover-lift">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-sm text-gray-900">{ep.url}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ep.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {ep.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {ep.description && <p className="text-sm text-gray-500">{ep.description}</p>}
                </div>
                <button
                  onClick={() => setDeleteTarget(ep)}
                  className="text-red-400 hover:text-red-600 transition text-sm"
                >
                  Delete
                </button>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">ID:</span>
                  <code className="font-mono">{ep.id.slice(0, 16)}…</code>
                  <button
                    onClick={() => copyToClipboard(ep.id, `id-${ep.id}`)}
                    className="text-brand-600 hover:text-brand-700"
                  >
                    {copiedId === `id-${ep.id}` ? '✓' : '📋'}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Signing Secret:</span>
                  <code className="font-mono">
                    {revealedSecrets.has(ep.id) ? 'whsec_' + ep.id.replace(/-/g, '').slice(0, 16) : '••••••••••••'}
                  </code>
                  <button onClick={() => toggleSecret(ep.id)} className="text-brand-600 hover:text-brand-700">
                    {revealedSecrets.has(ep.id) ? '🙈' : '👁️'}
                  </button>
                </div>
                <span>Created {new Date(ep.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Endpoint"
        message={`Are you sure you want to delete ${deleteTarget?.url}? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
