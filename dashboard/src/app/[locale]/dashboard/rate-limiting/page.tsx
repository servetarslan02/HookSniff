'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/store';
import { apiFetch } from '@/lib/api';

/* ─── Types ─── */
interface RateLimitInfo {
  endpoint_id: string;
  endpoint_url: string;
  requests_per_second: number;
  requests_per_minute: number;
  burst_size: number;
  current_queue_depth: number;
  throttled_count: number;
  last_throttled_at: string | null;
}

interface RateLimitStats {
  total_endpoints: number;
  total_throttled: number;
  avg_rps: number;
  peak_rps: number;
  limits: RateLimitInfo[];
}

/* ─── Main Page ─── */
export default function RateLimitingPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<RateLimitStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      // Try to fetch from rate-limit endpoint, fallback to mock data
      try {
        const data = await apiFetch<RateLimitStats>('/rate-limits', { token });
        setStats(data);
      } catch {
        // Endpoint may not exist yet — show helpful empty state
        setStats(null);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6 animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">⚡ Rate Limiting</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          Monitor and configure rate limits for your webhook endpoints.
        </p>
      </div>

      {/* Overview Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <div className="text-sm text-gray-500 dark:text-slate-400 mb-1">Total Endpoints</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_endpoints}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-sm text-gray-500 dark:text-slate-400 mb-1">Avg Requests/sec</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avg_rps.toFixed(1)}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-sm text-gray-500 dark:text-slate-400 mb-1">Peak Requests/sec</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.peak_rps.toFixed(1)}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-sm text-gray-500 dark:text-slate-400 mb-1">Throttled Requests</div>
            <div className={`text-2xl font-bold ${stats.total_throttled > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
              {stats.total_throttled}
            </div>
          </div>
        </div>
      )}

      {/* Per-Endpoint Limits */}
      {stats && stats.limits.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Per-Endpoint Limits</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Endpoint</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">RPS</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">RPM</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Burst</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Queue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Throttled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
                {stats.limits.map((limit) => (
                  <tr key={limit.endpoint_id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4">
                      <div className="text-sm font-mono text-gray-900 dark:text-white truncate max-w-xs">{limit.endpoint_url}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">{limit.requests_per_second}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">{limit.requests_per_minute}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">{limit.burst_size}</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${limit.current_queue_depth > 10 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-600 dark:text-slate-400'}`}>
                        {limit.current_queue_depth}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${limit.throttled_count > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {limit.throttled_count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!stats && (
        <div className="glass-card p-12 text-center">
          <div className="text-5xl mb-4">⚡</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Rate Limiting</h2>
          <p className="text-gray-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            HookSniff automatically rate-limits webhook deliveries to protect your endpoints. 
            Configure limits per endpoint in settings.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">🔄</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Auto Retry</div>
              <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">Exponential backoff</div>
            </div>
            <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Per-Endpoint</div>
              <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">Custom limits</div>
            </div>
            <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">🔔</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Alerts</div>
              <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">Throttle notifications</div>
            </div>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">How Rate Limiting Works</h2>
        <div className="space-y-3">
          {[
            { icon: '1️⃣', title: 'Token Bucket Algorithm', desc: 'Each endpoint has a token bucket that refills at the configured rate. Requests consume tokens.' },
            { icon: '2️⃣', title: 'Burst Handling', desc: 'Short bursts are allowed up to the burst size, then requests are queued.' },
            { icon: '3️⃣', title: 'Queue & Retry', desc: 'Excess requests are queued and delivered when capacity is available. Failed deliveries retry with exponential backoff.' },
            { icon: '4️⃣', title: 'Per-Endpoint Config', desc: 'Each endpoint can have custom rate limits. Defaults: 10 req/sec, 600 req/min, burst 20.' },
          ].map((item) => (
            <div key={item.title} className="flex gap-3">
              <span className="text-lg">{item.icon}</span>
              <div>
                <div className="font-medium text-gray-900 dark:text-white text-sm">{item.title}</div>
                <div className="text-sm text-gray-500 dark:text-slate-400">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
