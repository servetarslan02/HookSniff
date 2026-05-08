'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/store';
import { agentsApi } from '@/lib/api';

interface AgentStats {
  total_agents: number;
  active_agents: number;
  total_events_today: number;
  events_per_agent: { agent_id: string; name: string; count: number }[];
  recent_events: any[];
}

export default function AgentMonitoringPage() {
  const { token } = useAuth();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [agentEvents, setAgentEvents] = useState<any[]>([]);
  const [agentRoutes, setAgentRoutes] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    agentsApi.list(token)
      .then((res) => {
        setAgents(res.agents);
        if (res.agents.length > 0) {
          setSelectedAgent(res.agents[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token || !selectedAgent) return;
    Promise.all([
      agentsApi.listEvents(token, selectedAgent),
      agentsApi.listRoutes(token),
    ]).then(([eventsRes, routesRes]) => {
      setAgentEvents(eventsRes.events);
      setAgentRoutes(routesRes.routes.filter(
        (r: any) => r.target_agent_id === selectedAgent || r.source_agent_id === selectedAgent
      ));
    }).catch(console.error);
  }, [token, selectedAgent]);

  const activeAgents = agents.filter((a) => a.status === 'active');
  const inactiveAgents = agents.filter((a) => a.status !== 'active');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
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
          {agents.map((agent) => (
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
          ))}
        </div>

        {/* Agent Detail */}
        <div className="md:col-span-2 space-y-4">
          {selectedAgent ? (
            <>
              {/* Events Timeline */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
                <div className="px-4 py-3 border-b border-zinc-800">
                  <h3 className="font-semibold text-white">Son Event'ler</h3>
                </div>
                {agentEvents.length === 0 ? (
                  <div className="p-6 text-center text-zinc-500">Henuz event yok</div>
                ) : (
                  <div className="divide-y divide-zinc-800 max-h-96 overflow-y-auto">
                    {agentEvents.slice(0, 20).map((event, i) => (
                      <div key={event.id || i} className="px-4 py-3 flex items-start gap-3">
                        <div className="mt-1">
                          {event.direction === 'emit' ? (
                            <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs">↑</span>
                          ) : (
                            <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-xs">↓</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <code className="text-sm text-violet-400 font-mono">{event.event_type}</code>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              event.status === 'delivered'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {event.status}
                            </span>
                          </div>
                          <pre className="text-xs text-zinc-500 mt-1 truncate">
                            {JSON.stringify(event.payload).slice(0, 100)}
                          </pre>
                        </div>
                        <span className="text-xs text-zinc-600 whitespace-nowrap">
                          {new Date(event.created_at).toLocaleTimeString('tr-TR')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

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
                            {route.target_agent_id === selectedAgent ? 'Bu agent' : 'Baska agent'}
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
