'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/store';

interface EndpointHealth {
  id: string;
  url: string;
  description: string | null;
  is_active: boolean;
  health_status: string;
  success_rate: number;
  avg_response_ms: number;
  p95_response_ms: number;
  total_deliveries: number;
  successful: number;
  failed: number;
  consecutive_failures: number;
  last_failure_at: string | null;
  uptime_24h: number;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  healthy: { color: 'text-green-700 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-500/20', label: 'Healthy' },
  degraded: { color: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-500/20', label: 'Degraded' },
  unhealthy: { color: 'text-red-700 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-500/20', label: 'Unhealthy' },
};

export default function EndpointHealthPage() {
  const { token } = useAuth();
  const [endpoints, setEndpoints] = useState<EndpointHealth[]>([]);
  const [loading, setLoading] = useState(true);

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch(`${API}/endpoint-health`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setEndpoints(await res.json());
    } catch (e) {
      console.error('Failed to fetch endpoint health:', e);
    } finally {
      setLoading(false);
    }
  }, [token, API]);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchHealth]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Endpoint Health</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          Monitor the health and performance of your webhook endpoints.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: 'Healthy',
            count: endpoints.filter((e) => e.health_status === 'healthy').length,
            color: 'text-green-600 dark:text-green-400',
            bg: 'bg-green-50 dark:bg-green-500/10',
          },
          {
            label: 'Degraded',
            count: endpoints.filter((e) => e.health_status === 'degraded').length,
            color: 'text-yellow-600 dark:text-yellow-400',
            bg: 'bg-yellow-50 dark:bg-yellow-500/10',
          },
          {
            label: 'Unhealthy',
            count: endpoints.filter((e) => e.health_status === 'unhealthy').length,
            color: 'text-red-600 dark:text-red-400',
            bg: 'bg-red-50 dark:bg-red-500/10',
          },
        ].map((card) => (
          <div key={card.label} className={`glass-card p-5 ${card.bg}`}>
            <div className={`text-3xl font-bold ${card.color}`}>{card.count}</div>
            <div className="text-sm text-gray-500 dark:text-slate-400">{card.label} Endpoints</div>
          </div>
        ))}
      </div>

      {/* Endpoint List */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 dark:text-slate-500">Loading...</div>
        ) : endpoints.length === 0 ? (
          <div className="p-12 text-center text-gray-400 dark:text-slate-500">
            No endpoints yet. Create one to start monitoring health.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {endpoints.map((ep) => {
              const status = STATUS_CONFIG[ep.health_status] || STATUS_CONFIG.healthy;
              return (
                <div key={ep.id} className="px-6 py-5 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                        <code className="text-sm font-mono text-gray-700 dark:text-slate-300">
                          {ep.url}
                        </code>
                      </div>
                      {ep.description && (
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{ep.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {ep.success_rate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">success rate</div>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-3">
                    {[
                      { label: 'Total', value: ep.total_deliveries.toLocaleString() },
                      { label: 'Successful', value: ep.successful.toLocaleString() },
                      { label: 'Failed', value: ep.failed.toLocaleString() },
                      { label: 'Avg Latency', value: `${ep.avg_response_ms}ms` },
                      { label: 'P95 Latency', value: `${ep.p95_response_ms}ms` },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{stat.value}</div>
                        <div className="text-xs text-gray-500 dark:text-slate-400">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          ep.health_status === 'healthy' ? 'bg-green-500' :
                          ep.health_status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${ep.success_rate}%` }}
                      />
                    </div>
                  </div>

                  {ep.consecutive_failures > 0 && (
                    <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                      ⚠️ {ep.consecutive_failures} consecutive failure{ep.consecutive_failures > 1 ? 's' : ''}
                      {ep.last_failure_at && ` · Last failure ${new Date(ep.last_failure_at).toLocaleString()}`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
