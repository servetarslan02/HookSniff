'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/lib/store';
import { agentsApi } from '@/lib/api';

export default function AgentsPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [copiedKey, setCopiedKey] = useState('');

  useEffect(() => {
    if (!token) return;
    agentsApi.list(token)
      .then((res) => setAgents(res.agents))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newName) return;
    setCreating(true);
    setError('');
    try {
      const res = await agentsApi.create(token, { name: newName, description: newDesc || undefined });
      setAgents((prev) => [res.agent, ...prev]);
      setNewName('');
      setNewDesc('');
      setShowCreate(false);
      // Show agent key warning
      alert(`Agent key kaydedin! Tekrar gosterilmeyecek:\n${res.agent.agent_key}`);
    } catch (err: any) {
      setError(err.message || 'Agent olusturulamadi');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Bu agenti silmek istediginizden emin misiniz?')) return;
    try {
      await agentsApi.delete(token, id);
      setAgents((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(err.message || 'Silinemedi');
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Agents</h1>
          <p className="text-zinc-400 mt-1">Agent'lar olusturun, event gonderin, yonetin</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors"
        >
          + Yeni Agent
        </button>
      </div>

      {showCreate && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Yeni Agent Olustur</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Agent Adi *</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-violet-500"
                placeholder="orn: Siparis Agent"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Aciklama</label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-violet-500"
                placeholder="orn: Siparis eventlerini dinler"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {creating ? 'Olusturuluyor...' : 'Olustur'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg"
              >
                Iptal
              </button>
            </div>
          </form>
        </div>
      )}

      {agents.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-lg font-semibold text-white mb-2">Henuz agent yok</h3>
          <p className="text-zinc-400 mb-4">Ilk agent'inizi olusturarak baslayin</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium"
          >
            + Yeni Agent
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-violet-500/50 transition-colors cursor-pointer"
              onClick={() => router.push(`/dashboard/agents/${agent.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🤖</span>
                  <h3 className="font-semibold text-white">{agent.name}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  agent.status === 'active'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-zinc-700 text-zinc-400'
                }`}>
                  {agent.status}
                </span>
              </div>
              {agent.description && (
                <p className="text-zinc-400 text-sm mb-3">{agent.description}</p>
              )}
              <div className="flex items-center gap-2">
                <code className="text-xs bg-zinc-800 px-2 py-1 rounded text-violet-400 font-mono">
                  {agent.agent_key?.slice(0, 20)}...
                </code>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyKey(agent.agent_key);
                  }}
                  className="text-xs text-zinc-500 hover:text-white"
                >
                  {copiedKey === agent.agent_key ? '✓' : 'Kopyala'}
                </button>
              </div>
              <div className="mt-3 text-xs text-zinc-500">
                {agent.last_seen_at
                  ? `Son gorulme: ${new Date(agent.last_seen_at).toLocaleString('tr-TR')}`
                  : 'Henuz baglanmadi'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
