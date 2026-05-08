'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/store';
import { agentsApi } from '@/lib/api';

export default function AgentMonitoringPage() {
  const { token } = useAuth();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [agentStats, setAgentStats] = useState<any>(null);
  const [agentAnomaly, setAgentAnomaly] = useState<any>(null);
  const [agentRoutes, setAgentRoutes] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    agentsApi.list(token)
      .then((res) => {
        setAgents(res.agents);
        if (res.agents.length > 0) {
          setSelectedAgent(res.agents[0].id);
        }
      })
      .catch((err) => setError(err.message || 'Agent listesi yuklenemedi'))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token || !selectedAgent) return;
    Promise.all([
      agentsApi.listRoutes(token),
      agentsApi.getAnomalyStatus(token, selectedAgent).catch(() => null),
      agentsApi.getEventStats(token, selectedAgent).catch(() => null),
      agentsApi.getAuditLog(token, selectedAgent).catch(() => null),
    ]).then(([routesRes, anomalyRes, statsRes, auditRes]) => {
      setAgentRoutes(routesRes.routes.filter(
        (r: any) => r.target_agent_id === selectedAgent || r.source_agent_id === selectedAgent
      ));
      if (anomalyRes) setAgentAnomaly(anomalyRes);
      if (statsRes) setAgentStats(statsRes.stats);
      if (auditRes) setAuditLogs(auditRes.logs);
    }).catch(console.error);
  }, [token, selectedAgent]);

  const activeAgents = agents.filter((a) => a.status === 'active');
  const inactiveAgents = agents.filter((a) => a.status !== 'active');
  const selectedAgentData = agents.find((a) => a.id === selectedAgent);

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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Agent Monitoring</h1>
        <p className="text-zinc-400 mt-1">Tum agent'larin durumu ve aktivitesi</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="text-3xl font-bold text-white">{agents.length}</div>
          <div className="text-sm text-zinc-400">Toplam Agent</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="text-3xl font-bold text-green-400">{activeAgents.length}</div>
          <div className="text-sm text-zinc-400">Aktif</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="text-3xl font-bold text-zinc-500">{inactiveAgents.length}</div>
          <div className="text-sm text-zinc-400">Pasif</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="text-3xl font-bold text-violet-400">{agentRoutes.length}</div>
          <div className="text-sm text-zinc-400">Routing Kurali</div>
        </div>
      </div>

      {/* Agent Grid + Detail */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Agent List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Agent'lar</h2>
          {agents.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center text-zinc-500">
              Henuz agent yok
            </div>
          ) : (
            agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className={`w-full text-left p-4 rounded-xl border transition-colors ${
                  selectedAgent === agent.id
                    ? 'bg-violet-500/10 border-violet-500/50'
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🤖</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">{agent.name}</div>
                    <div className="text-xs text-zinc-500 truncate">
                      {agent.last_seen_at
                        ? `Son: ${new Date(agent.last_seen_at).toLocaleTimeString('tr-TR')}`
                        : 'Baglanmadi'}
                    </div>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${
                    agent.status === 'active' ? 'bg-green-400' : 'bg-zinc-600'
                  }`} />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Agent Detail */}
        <div className="md:col-span-2 space-y-4">
          {selectedAgent && selectedAgentData ? (
            <>
              {/* Anomaly Status */}
              {agentAnomaly && (
                <div className={`border rounded-xl p-4 ${
                  agentAnomaly.healthy
                    ? 'bg-green-500/5 border-green-500/20'
                    : 'bg-yellow-500/5 border-yellow-500/20'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-lg ${agentAnomaly.healthy ? 'text-green-400' : 'text-yellow-400'}`}>
                      {agentAnomaly.healthy ? '✓' : '⚠'}
                    </span>
                    <span className="font-medium text-white">
                      {agentAnomaly.healthy ? 'Agent Saglikli' : 'Uyarilar Var'}
                    </span>
                  </div>
                  {agentAnomaly.warnings?.length > 0 && (
                    <ul className="space-y-1 ml-7">
                      {agentAnomaly.warnings.map((w: string, i: number) => (
                        <li key={i} className="text-sm text-yellow-300">{w}</li>
                      ))}
                    </ul>
                  )}
                  {agentAnomaly.rate_limit && (
                    <div className="mt-3 ml-7 grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-zinc-500">Dakika:</span>
                        <span className="ml-2 text-white">
                          {agentAnomaly.rate_limit.minute_used}/{agentAnomaly.rate_limit.minute_limit}
                        </span>
                        <div className="mt-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              agentAnomaly.rate_limit.minute_used / agentAnomaly.rate_limit.minute_limit > 0.8
                                ? 'bg-red-500'
                                : 'bg-violet-500'
                            }`}
                            style={{ width: `${Math.min(100, (agentAnomaly.rate_limit.minute_used / agentAnomaly.rate_limit.minute_limit) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <span className="text-zinc-500">Saat:</span>
                        <span className="ml-2 text-white">
                          {agentAnomaly.rate_limit.hour_used}/{agentAnomaly.rate_limit.hour_limit}
                        </span>
                        <div className="mt-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              agentAnomaly.rate_limit.hour_used / agentAnomaly.rate_limit.hour_limit > 0.8
                                ? 'bg-red-500'
                                : 'bg-violet-500'
                            }`}
                            style={{ width: `${Math.min(100, (agentAnomaly.rate_limit.hour_used / agentAnomaly.rate_limit.hour_limit) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Event Stats */}
              {agentStats && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-3">Event Istatistikleri</h3>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{agentStats.total_events}</div>
                      <div className="text-xs text-zinc-500">Toplam</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-400">{agentStats.emit_count}</div>
                      <div className="text-xs text-zinc-500">Emit</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">{agentStats.receive_count}</div>
                      <div className="text-xs text-zinc-500">Receive</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-emerald-400">{agentStats.delivered_count}</div>
                      <div className="text-xs text-zinc-500">Delivered</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-400">{agentStats.failed_count}</div>
                      <div className="text-xs text-zinc-500">Failed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-400">{agentStats.last_24h_count}</div>
                      <div className="text-xs text-zinc-500">Son 24s</div>
                    </div>
                  </div>
                  {agentStats.top_event_types?.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-zinc-800">
                      <h4 className="text-xs text-zinc-500 mb-2">En Populer Event Tipleri</h4>
                      <div className="space-y-1.5">
                        {agentStats.top_event_types.map((t: any, i: number) => (
                          <div key={i} className="flex items-center gap-2">
                            <code className="text-xs text-violet-400 font-mono flex-1 truncate">{t.event_type}</code>
                            <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-violet-500 rounded-full"
                                style={{ width: `${Math.min(100, (t.count / agentStats.total_events) * 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-zinc-400 w-8 text-right">{t.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Routes */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
                <div className="px-4 py-3 border-b border-zinc-800">
                  <h3 className="font-semibold text-white">Routing Kurallari</h3>
                </div>
                {agentRoutes.length === 0 ? (
                  <div className="p-6 text-center text-zinc-500">Kural yok</div>
                ) : (
                  <div className="divide-y divide-zinc-800">
                    {agentRoutes.map((route) => (
                      <div key={route.id} className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-500">Event:</span>
                          <code className="text-sm text-violet-400 font-mono">{route.event_type}</code>
                          <span className="text-zinc-600">→</span>
                          <span className="text-sm text-white">
                            {route.target_agent_id === selectedAgent ? 'Bu agent' : (
                              agents.find((a) => a.id === route.target_agent_id)?.name || 'Bilinmeyen'
                            )}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          route.is_active
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-zinc-700 text-zinc-400'
                        }`}>
                          {route.is_active ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Audit Log */}
              {auditLogs.length > 0 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
                  <div className="px-4 py-3 border-b border-zinc-800">
                    <h3 className="font-semibold text-white">Son Aksiyonlar</h3>
                  </div>
                  <div className="divide-y divide-zinc-800 max-h-64 overflow-y-auto">
                    {auditLogs.slice(0, 10).map((log: any) => (
                      <div key={log.id} className="px-4 py-2 flex items-center gap-3">
                        <span className="text-xs text-zinc-500 w-16 shrink-0">
                          {new Date(log.created_at).toLocaleTimeString('tr-TR')}
                        </span>
                        <code className="text-xs bg-zinc-800 px-2 py-0.5 rounded text-violet-400">
                          {log.action}
                        </code>
                        <span className="text-xs text-zinc-400 truncate flex-1">
                          {JSON.stringify(log.details)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center text-zinc-500">
              Secilen agent yok
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
