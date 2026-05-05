'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface AiStatus {
  active_events: number;
  critical_events: number;
  pending_actions: number;
  blocked_items: number;
  avg_risk_score: number;
  high_risk_endpoints: number;
}

interface AiEvent {
  id: string;
  event_type: string;
  severity: string;
  title: string;
  description: string | null;
  action_taken: string | null;
  target_type: string | null;
  resolved: boolean;
  created_at: string;
}

interface RiskScore {
  id: string;
  target_type: string;
  target_id: string;
  score: number;
  factors: Record<string, number> | null;
  created_at: string;
}

interface AiAction {
  id: string;
  action_type: string;
  description: string;
  target_type: string | null;
  status: string;
  risk_level: string;
  auto_approved: boolean;
  executed_at: string | null;
  created_at: string;
}

interface BlocklistEntry {
  id: string;
  block_type: string;
  block_value: string;
  reason: string | null;
  expires_at: string | null;
  created_at: string;
}

const severityColors: Record<string, string> = {
  info: 'bg-blue-100 text-blue-800',
  warning: 'bg-yellow-100 text-yellow-800',
  critical: 'bg-red-100 text-red-800',
};

const riskColors = (score: number) => {
  if (score <= 30) return 'text-green-600 bg-green-50';
  if (score <= 60) return 'text-yellow-600 bg-yellow-50';
  if (score <= 80) return 'text-orange-600 bg-orange-50';
  return 'text-red-600 bg-red-50';
};

const riskEmoji = (score: number) => {
  if (score <= 30) return '🟢';
  if (score <= 60) return '🟡';
  if (score <= 80) return '🟠';
  return '🔴';
};

export default function AiCenterPage() {
  const [status, setStatus] = useState<AiStatus | null>(null);
  const [events, setEvents] = useState<AiEvent[]>([]);
  const [risks, setRisks] = useState<RiskScore[]>([]);
  const [actions, setActions] = useState<AiAction[]>([]);
  const [blocklist, setBlocklist] = useState<BlocklistEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'risks' | 'actions' | 'blocklist'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const [statusRes, eventsRes, risksRes, actionsRes, blockRes] = await Promise.all([
        api.get('/ai/status'),
        api.get('/ai/events?limit=100'),
        api.get('/ai/risks'),
        api.get('/ai/actions'),
        api.get('/ai/blocklist'),
      ]);
      setStatus(statusRes.data);
      setEvents(eventsRes.data);
      setRisks(risksRes.data);
      setActions(actionsRes.data);
      setBlocklist(blockRes.data);
    } catch (err) {
      console.error('AI Center data load failed:', err);
    } finally {
      setLoading(false);
    }
  }

  async function approveAction(id: string) {
    await api.post(`/ai/actions/${id}/approve`);
    loadData();
  }

  async function rejectAction(id: string) {
    await api.post(`/ai/actions/${id}/reject`);
    loadData();
  }

  async function rollbackAction(id: string) {
    await api.post(`/ai/actions/${id}/rollback`);
    loadData();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">🧠 AI Merkezi</h1>
        <span className="text-sm text-gray-500">Otonom yönetim sistemi</span>
      </div>

      {/* Status Cards */}
      {status && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatusCard
            label="Aktif Olaylar"
            value={status.active_events}
            icon="📊"
            color={status.active_events > 10 ? 'text-red-600' : 'text-gray-900'}
          />
          <StatusCard
            label="Kritik Olaylar"
            value={status.critical_events}
            icon="🔴"
            color={status.critical_events > 0 ? 'text-red-600' : 'text-green-600'}
          />
          <StatusCard
            label="Bekleyen Aksiyon"
            value={status.pending_actions}
            icon="⏳"
            color={status.pending_actions > 5 ? 'text-yellow-600' : 'text-gray-900'}
          />
          <StatusCard
            label="Engelli"
            value={status.blocked_items}
            icon="🚫"
            color="text-gray-900"
          />
          <StatusCard
            label="Ort. Risk"
            value={Math.round(status.avg_risk_score)}
            icon={riskEmoji(status.avg_risk_score)}
            color={status.avg_risk_score > 60 ? 'text-red-600' : 'text-green-600'}
          />
          <StatusCard
            label="Yüksek Risk"
            value={status.high_risk_endpoints}
            icon="⚠️"
            color={status.high_risk_endpoints > 0 ? 'text-orange-600' : 'text-green-600'}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['overview', 'events', 'risks', 'actions', 'blocklist'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'overview' && '📊 Genel Bakış'}
              {tab === 'events' && '📋 Olaylar'}
              {tab === 'risks' && '🎯 Risk Skorları'}
              {tab === 'actions' && '⚡ Aksiyonlar'}
              {tab === 'blocklist' && '🚫 Engelleme Listesi'}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Critical Events */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-3">🔴 Son Kritik Olaylar</h3>
            <div className="space-y-2">
              {events.filter(e => e.severity === 'critical').slice(0, 5).map(event => (
                <div key={event.id} className="text-sm border-l-4 border-red-400 pl-3 py-1">
                  <div className="font-medium">{event.title}</div>
                  <div className="text-gray-500 text-xs">{new Date(event.created_at).toLocaleString('tr-TR')}</div>
                </div>
              ))}
              {events.filter(e => e.severity === 'critical').length === 0 && (
                <div className="text-sm text-gray-500">Kritik olay yok ✅</div>
              )}
            </div>
          </div>

          {/* Top Risk Endpoints */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-3">🎯 En Yüksek Risk Endpointler</h3>
            <div className="space-y-2">
              {risks.sort((a, b) => b.score - a.score).slice(0, 5).map(risk => (
                <div key={risk.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{risk.target_id.slice(0, 8)}...</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${riskColors(risk.score)}`}>
                    {riskEmoji(risk.score)} {risk.score}
                  </span>
                </div>
              ))}
              {risks.length === 0 && (
                <div className="text-sm text-gray-500">Risk endpoint yok ✅</div>
              )}
            </div>
          </div>

          {/* Pending Actions */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-3">⏳ Onay Bekleyen Aksiyonlar</h3>
            <div className="space-y-2">
              {actions.filter(a => a.status === 'pending').slice(0, 5).map(action => (
                <div key={action.id} className="text-sm border-l-4 border-yellow-400 pl-3 py-1">
                  <div className="font-medium">{action.description}</div>
                  <div className="flex gap-2 mt-1">
                    <button onClick={() => approveAction(action.id)} className="text-green-600 text-xs hover:underline">✅ Onayla</button>
                    <button onClick={() => rejectAction(action.id)} className="text-red-600 text-xs hover:underline">❌ Reddet</button>
                  </div>
                </div>
              ))}
              {actions.filter(a => a.status === 'pending').length === 0 && (
                <div className="text-sm text-gray-500">Bekleyen aksiyon yok ✅</div>
              )}
            </div>
          </div>

          {/* Recent Auto-Actions */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-3">🤖 Son Otomatik Aksiyonlar</h3>
            <div className="space-y-2">
              {actions.filter(a => a.auto_approved).slice(0, 5).map(action => (
                <div key={action.id} className="text-sm border-l-4 border-blue-400 pl-3 py-1">
                  <div className="font-medium">{action.description}</div>
                  <div className="text-gray-500 text-xs">{new Date(action.created_at).toLocaleString('tr-TR')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Seviye</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Tür</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Başlık</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Açıklama</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {events.map(event => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${severityColors[event.severity] || 'bg-gray-100'}`}>
                      {event.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{event.event_type}</td>
                  <td className="px-4 py-3 text-sm font-medium">{event.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{event.description}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(event.created_at).toLocaleString('tr-TR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'risks' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Risk</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Hedef</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Skor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {risks.sort((a, b) => b.score - a.score).map(risk => (
                <tr key={risk.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-lg">{riskEmoji(risk.score)}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="font-mono text-xs">{risk.target_id}</div>
                    <div className="text-gray-500 text-xs">{risk.target_type}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${riskColors(risk.score)}`}>
                      {risk.score}/100
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(risk.created_at).toLocaleString('tr-TR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'actions' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Tür</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Açıklama</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Durum</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Risk</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {actions.map(action => (
                <tr key={action.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{action.action_type}</td>
                  <td className="px-4 py-3 text-sm max-w-md truncate">{action.description}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      action.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      action.status === 'executed' ? 'bg-green-100 text-green-800' :
                      action.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {action.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{action.risk_level}</td>
                  <td className="px-4 py-3">
                    {action.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => approveAction(action.id)} className="text-green-600 text-xs hover:underline">Onayla</button>
                        <button onClick={() => rejectAction(action.id)} className="text-red-600 text-xs hover:underline">Reddet</button>
                      </div>
                    )}
                    {action.status === 'executed' && (
                      <button onClick={() => rollbackAction(action.id)} className="text-orange-600 text-xs hover:underline">Geri Al</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'blocklist' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Tür</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Değer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Sebep</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Bitiş</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {blocklist.map(entry => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{entry.block_type}</td>
                  <td className="px-4 py-3 text-sm font-mono">{entry.block_value}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{entry.reason || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {entry.expires_at ? new Date(entry.expires_at).toLocaleString('tr-TR') : 'Kalıcı'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className={`text-2xl font-bold ${color}`}>{value}</span>
      </div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  );
}
