'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/store';
import { agentsApi } from '@/lib/api';

export default function AgentDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const [agent, setAgent] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'events' | 'routes' | 'emit'>('events');

  // Emit form
  const [emitType, setEmitType] = useState('');
  const [emitPayload, setEmitPayload] = useState('{\n  \n}');
  const [emitting, setEmitting] = useState(false);
  const [emitResult, setEmitResult] = useState('');

  // Route form
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [routeEventType, setRouteEventType] = useState('');
  const [routeTargetId, setRouteTargetId] = useState('');
  const [allAgents, setAllAgents] = useState<any[]>([]);

  useEffect(() => {
    if (!token || !id) return;
    Promise.all([
      agentsApi.get(token, id as string),
      agentsApi.listEvents(token, id as string),
      agentsApi.listRoutes(token),
      agentsApi.list(token),
    ])
      .then(([agentRes, eventsRes, routesRes, agentsRes]) => {
        setAgent(agentRes.agent);
        setEvents(eventsRes.events);
        setRoutes(routesRes.routes.filter((r: any) => r.target_agent_id === id || r.source_agent_id === id));
        setAllAgents(agentsRes.agents);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, id]);

  const handleEmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !id || !emitType) return;
    setEmitting(true);
    setEmitResult('');
    try {
      let payload = {};
      try { payload = JSON.parse(emitPayload); } catch { payload = {}; }
      const res = await agentsApi.emitEvent(token, id as string, {
        event_type: emitType,
        payload,
      });
      setEmitResult(`Event gonderildi! ID: ${res.event_id}, Hedefler: ${res.delivered_to.length}`);
      setEmitType('');
      // Refresh events
      const eventsRes = await agentsApi.listEvents(token, id as string);
      setEvents(eventsRes.events);
    } catch (err: any) {
      setEmitResult(`Hata: ${err.message}`);
    } finally {
      setEmitting(false);
    }
  };

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !routeEventType || !routeTargetId) return;
    try {
      await agentsApi.createRoute(token, {
        event_type: routeEventType,
        target_agent_id: routeTargetId,
      });
      setShowRouteForm(false);
      setRouteEventType('');
      setRouteTargetId('');
      // Refresh routes
      const routesRes = await agentsApi.listRoutes(token);
      setRoutes(routesRes.routes.filter((r: any) => r.target_agent_id === id || r.source_agent_id === id));
    } catch (err: any) {
      alert(err.message || 'Route olusturulamadi');
    }
  };

  const handleDeleteRoute = async (routeId: string) => {
    if (!token || !confirm('Bu routeu silmek istediginizden emin misiniz?')) return;
    try {
      await agentsApi.deleteRoute(token, routeId);
      setRoutes((prev) => prev.filter((r) => r.id !== routeId));
    } catch (err: any) {
      alert(err.message || 'Silinemedi');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400">Agent bulunamadi</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Agent Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🤖</span>
          <div>
            <h1 className="text-2xl font-bold text-white">{agent.name}</h1>
            {agent.description && <p className="text-zinc-400">{agent.description}</p>}
          </div>
          <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
            agent.status === 'active'
              ? 'bg-green-500/20 text-green-400'
              : 'bg-zinc-700 text-zinc-400'
          }`}>
            {agent.status}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-zinc-500">Agent Key</span>
            <code className="block mt-1 text-violet-400 font-mono text-xs break-all">{agent.agent_key}</code>
          </div>
          <div>
            <span className="text-zinc-500">Olusturulma</span>
            <p className="mt-1 text-white">{new Date(agent.created_at).toLocaleString('tr-TR')}</p>
          </div>
          <div>
            <span className="text-zinc-500">Son Gorulme</span>
            <p className="mt-1 text-white">{agent.last_seen_at ? new Date(agent.last_seen_at).toLocaleString('tr-TR') : 'Henuz yok'}</p>
          </div>
          <div>
            <span className="text-zinc-500">Toplam Event</span>
            <p className="mt-1 text-white">{events.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900 rounded-lg p-1">
        {(['events', 'routes', 'emit'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-violet-600 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {tab === 'events' ? 'Event Gecmisi' : tab === 'routes' ? 'Routing Kurallari' : 'Event Gonder'}
          </button>
        ))}
      </div>

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          {events.length === 0 ? (
            <div className="p-8 text-center text-zinc-400">Henuz event yok</div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {events.map((event) => (
                <div key={event.id} className="p-4 hover:bg-zinc-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        event.direction === 'emit'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {event.direction === 'emit' ? '↑ GONDER' : '↓ ALDI'}
                      </span>
                      <code className="text-sm text-violet-400 font-mono">{event.event_type}</code>
                    </div>
                    <span className="text-xs text-zinc-500">
                      {new Date(event.created_at).toLocaleString('tr-TR')}
                    </span>
                  </div>
                  <pre className="mt-2 text-xs text-zinc-400 bg-zinc-800 rounded p-2 overflow-x-auto">
                    {JSON.stringify(event.payload, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Routes Tab */}
      {activeTab === 'routes' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowRouteForm(true)}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium"
            >
              + Yeni Route
            </button>
          </div>

          {showRouteForm && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Yeni Route Olustur</h3>
              <form onSubmit={handleCreateRoute} className="space-y-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Event Tipi *</label>
                  <input
                    type="text"
                    value={routeEventType}
                    onChange={(e) => setRouteEventType(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                    placeholder="orn: order.created"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Hedef Agent *</label>
                  <select
                    value={routeTargetId}
                    onChange={(e) => setRouteTargetId(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                    required
                  >
                    <option value="">Secin...</option>
                    {allAgents.filter((a) => a.id !== id).map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium">
                    Olustur
                  </button>
                  <button type="button" onClick={() => setShowRouteForm(false)} className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg text-sm">
                    Iptal
                  </button>
                </div>
              </form>
            </div>
          )}

          {routes.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-zinc-400">
              Henuz routing kurali yok
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
              {routes.map((route) => (
                <div key={route.id} className="p-4 flex items-center justify-between">
                  <div>
                    <code className="text-violet-400 font-mono text-sm">{route.event_type}</code>
                    <span className="text-zinc-500 mx-2">→</span>
                    <span className="text-white text-sm">{route.target_agent_id === id ? 'Bu agent' : route.target_agent_id}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteRoute(route.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Sil
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Emit Tab */}
      {activeTab === 'emit' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Event Gonder</h3>
          <form onSubmit={handleEmit} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Event Tipi *</label>
              <input
                type="text"
                value={emitType}
                onChange={(e) => setEmitType(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                placeholder="orn: order.created"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Payload (JSON)</label>
              <textarea
                value={emitPayload}
                onChange={(e) => setEmitPayload(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono text-sm h-32"
              />
            </div>
            <button
              type="submit"
              disabled={emitting}
              className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium disabled:opacity-50"
            >
              {emitting ? 'Gonderiliyor...' : 'Gonder'}
            </button>
          </form>
          {emitResult && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${
              emitResult.startsWith('Hata') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
            }`}>
              {emitResult}
            </div>
          )}
        </div>
      )}
    </div>
  );
