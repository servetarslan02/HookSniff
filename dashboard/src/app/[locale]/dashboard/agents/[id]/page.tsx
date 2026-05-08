'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/store';
import { agentsApi } from '@/lib/api';

export default function AgentDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const [agent, setAgent] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [rateLimit, setRateLimit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'events' | 'routes' | 'emit' | 'settings'>('events');

  // Event filters
  const [filterDirection, setFilterDirection] = useState<string>('');
  const [filterEventType, setFilterEventType] = useState<string>('');
  const [eventPage, setEventPage] = useState(1);
  const [eventPagination, setEventPagination] = useState<any>(null);

  // Emit form
  const [emitType, setEmitType] = useState('');
  const [emitPayload, setEmitPayload] = useState('{\n  \n}');
  const [emitTarget, setEmitTarget] = useState('');
  const [emitting, setEmitting] = useState(false);
  const [emitResult, setEmitResult] = useState('');

  // Route form
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [routeEventType, setRouteEventType] = useState('');
  const [routeTargetId, setRouteTargetId] = useState('');
  const [allAgents, setAllAgents] = useState<any[]>([]);

  // Edit form
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editing, setEditing] = useState(false);

  // Rate limit form
  const [rlMinute, setRlMinute] = useState('');
  const [rlHour, setRlHour] = useState('');
  const [savingRL, setSavingRL] = useState(false);

  const loadData = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);
    setError('');
    try {
      const [agentRes, eventsRes, routesRes, agentsRes, statsRes, rlRes] = await Promise.all([
        agentsApi.get(token, id as string),
        agentsApi.listEvents(token, id as string, eventPage),
        agentsApi.listRoutes(token),
        agentsApi.list(token),
        fetch(`/api/agents/${id}/stats`, { headers: { Authorization: `Bearer ${token}` } })
          .then(r => r.ok ? r.json() : null)
          .catch(() => null),
        agentsApi.getRateLimit(token, id as string).catch(() => null),
      ]);
      setAgent(agentRes.agent);
      setEditName(agentRes.agent.name);
      setEditDesc(agentRes.agent.description || '');
      setEditStatus(agentRes.agent.status);
      setEvents(eventsRes.events);
      setEventPagination(eventsRes.pagination);
      setRoutes(routesRes.routes.filter(
        (r: any) => r.target_agent_id === id || r.source_agent_id === id
      ));
      setAllAgents(agentsRes.agents);
      if (statsRes) setStats(statsRes.stats);
      if (rlRes) {
        setRateLimit(rlRes.rate_limit);
        setRlMinute(String(rlRes.rate_limit.max_events_per_minute));
        setRlHour(String(rlRes.rate_limit.max_events_per_hour));
      }
    } catch (err: any) {
      setError(err.message || 'Veri yuklenemedi');
    } finally {
      setLoading(false);
    }
  }, [token, id, eventPage]);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredEvents = events.filter((e) => {
    if (filterDirection && e.direction !== filterDirection) return false;
    if (filterEventType && !e.event_type.includes(filterEventType)) return false;
    return true;
  });

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
        target_agent_id: emitTarget || undefined,
      });
      setEmitResult(`✓ Event gonderildi! ID: ${res.event_id}, Hedefler: ${res.delivered_to.length}`);
      setEmitType('');
      setEmitTarget('');
      // Refresh events
      const eventsRes = await agentsApi.listEvents(token, id as string, 1);
      setEvents(eventsRes.events);
    } catch (err: any) {
      setEmitResult(`✗ Hata: ${err.message}`);
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
      const routesRes = await agentsApi.listRoutes(token);
      setRoutes(routesRes.routes.filter(
        (r: any) => r.target_agent_id === id || r.source_agent_id === id
      ));
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

  const handleUpdateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !id) return;
    setEditing(true);
    try {
      const res = await agentsApi.update(token, id as string, {
        name: editName,
        description: editDesc || undefined,
        status: editStatus,
      });
      setAgent(res.agent);
      alert('Agent guncellendi');
    } catch (err: any) {
      alert(err.message || 'Guncellenemedi');
    } finally {
      setEditing(false);
    }
  };

  const handleUpdateRateLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !id) return;
    setSavingRL(true);
    try {
      const res = await agentsApi.updateRateLimit(token, id as string, {
        max_events_per_minute: parseInt(rlMinute) || undefined,
        max_events_per_hour: parseInt(rlHour) || undefined,
      });
      setRateLimit(res.rate_limit);
      alert('Rate limit guncellendi');
    } catch (err: any) {
      alert(err.message || 'Guncellenemedi');
    } finally {
      setSavingRL(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">{error}</p>
        <button onClick={loadData} className="mt-4 px-4 py-2 bg-zinc-800 text-white rounded-lg">
          Tekrar Dene
        </button>
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
              : agent.status === 'suspended'
              ? 'bg-red-500/20 text-red-400'
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
            <p className="mt-1 text-white">{stats?.total_events ?? events.length}</p>
          </div>
        </div>
        {stats && (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-4 pt-4 border-t border-zinc-800">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">{stats.emit_count}</div>
              <div className="text-xs text-zinc-500">Emit</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">{stats.receive_count}</div>
              <div className="text-xs text-zinc-500">Receive</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-400">{stats.delivered_count}</div>
              <div className="text-xs text-zinc-500">Delivered</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-400">{stats.failed_count}</div>
              <div className="text-xs text-zinc-500">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-violet-400">{stats.unique_event_types}</div>
              <div className="text-xs text-zinc-500">Event Type</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-400">{stats.last_24h_count}</div>
              <div className="text-xs text-zinc-500">Son 24s</div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900 rounded-lg p-1">
        {(['events', 'routes', 'emit', 'settings'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-violet-600 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {tab === 'events' ? 'Event Gecmisi' : tab === 'routes' ? 'Routing Kurallari' : tab === 'emit' ? 'Event Gonder' : 'Ayarlar'}
          </button>
        ))}
      </div>

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filterDirection}
              onChange={(e) => setFilterDirection(e.target.value)}
              className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
            >
              <option value="">Tum Yonler</option>
              <option value="emit">↑ Gonderilen (Emit)</option>
              <option value="receive">↓ Alinan (Receive)</option>
            </select>
            <input
              type="text"
              value={filterEventType}
              onChange={(e) => setFilterEventType(e.target.value)}
              placeholder="Event type ara..."
              className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm flex-1 min-w-[200px]"
            />
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            {filteredEvents.length === 0 ? (
              <div className="p-8 text-center text-zinc-400">
                {filterDirection || filterEventType ? 'Filtreye uygun event bulunamadi' : 'Henuz event yok'}
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {filteredEvents.map((event) => (
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
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          event.status === 'delivered'
                            ? 'bg-green-500/20 text-green-400'
                            : event.status === 'failed'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {event.status}
                        </span>
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

          {/* Event Pagination */}
          {eventPagination && eventPagination.total_pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setEventPage((p) => Math.max(1, p - 1))}
                disabled={eventPage === 1}
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded disabled:opacity-30"
              >
                ←
              </button>
              <span className="text-zinc-400 text-sm">
                Sayfa {eventPage} / {eventPagination.total_pages} ({eventPagination.total} event)
              </span>
              <button
                onClick={() => setEventPage((p) => Math.min(eventPagination.total_pages, p + 1))}
                disabled={eventPage === eventPagination.total_pages}
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded disabled:opacity-30"
              >
                →
              </button>
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
                    <span className="text-white text-sm">
                      {route.target_agent_id === id ? 'Bu agent' : (
                        allAgents.find((a) => a.id === route.target_agent_id)?.name || route.target_agent_id
                      )}
                    </span>
                    {route.source_agent_id && (
                      <span className="text-zinc-500 text-xs ml-2">
                        (kaynak: {route.source_agent_id === id ? 'bu agent' : allAgents.find((a) => a.id === route.source_agent_id)?.name || route.source_agent_id})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      route.is_active
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-zinc-700 text-zinc-400'
                    }`}>
                      {route.is_active ? 'Aktif' : 'Pasif'}
                    </span>
                    <button
                      onClick={() => handleDeleteRoute(route.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Sil
                    </button>
                  </div>
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
              <label className="block text-sm text-zinc-400 mb-1">Hedef Agent (opsiyonel)</label>
              <select
                value={emitTarget}
                onChange={(e) => setEmitTarget(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              >
                <option value="">Yok (routing kurallarina gore)</option>
                {allAgents.filter((a) => a.id !== id).map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
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
              emitResult.startsWith('✗') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
            }`}>
              {emitResult}
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Edit Agent */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Agent Duzenle</h3>
            <form onSubmit={handleUpdateAgent} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Agent Adi</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                  maxLength={100}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Aciklama</label>
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                  maxLength={500}
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Durum</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={editing}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {editing ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </form>
          </div>

          {/* Rate Limit */}
          {rateLimit && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Rate Limit</h3>
              <form onSubmit={handleUpdateRateLimit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Dakika Limiti</label>
                    <input
                      type="number"
                      value={rlMinute}
                      onChange={(e) => setRlMinute(e.target.value)}
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                      min={1}
                      max={10000}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Saat Limiti</label>
                    <input
                      type="number"
                      value={rlHour}
                      onChange={(e) => setRlHour(e.target.value)}
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                      min={1}
                      max={100000}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={savingRL}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {savingRL ? 'Kaydediliyor...' : 'Rate Limit Guncelle'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
