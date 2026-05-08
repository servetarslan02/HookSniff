'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/store';
import { apiFetch } from '@/lib/api';

interface RoutingInfo {
  id: string;
  url: string;
  endpoint_id: string;
  routing_strategy: string;
  fallback_url: string | null;
  avg_response_ms: number;
  failure_streak: number;
  is_healthy: boolean;
  resolved_url: string;
  using_fallback: boolean;
}

export default function RoutingPage() {
  const { token } = useAuth();
  const [endpoints, setEndpoints] = useState<RoutingInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiFetch<RoutingInfo[]>('/endpoints', { token })
      .then(setEndpoints)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔀 Routing</h1>
      <p className="text-gray-500 mb-6">
        Configure how webhooks are routed to your endpoints. Choose between round-robin, latency-based, or failover strategies.
      </p>
      <div className="space-y-4">
        {endpoints.map((ep) => (
          <div key={ep.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-sm">{ep.url}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Strategy: <span className="font-semibold">{ep.routing_strategy || 'round-robin'}</span>
                  {ep.fallback_url && <> · Fallback: {ep.fallback_url}</>}
                </p>
              </div>
              <div className="text-right">
                <span className={`badge ${ep.failure_streak >= 3 ? 'badge-red' : 'badge-green'}`}>
                  {ep.failure_streak >= 3 ? 'Unhealthy' : 'Healthy'}
                </span>
                <p className="text-xs text-gray-500 mt-1">{ep.avg_response_ms}ms avg</p>
              </div>
            </div>
          </div>
        ))}
        {endpoints.length === 0 && (
          <div className="text-center py-12 text-gray-500">No endpoints configured yet.</div>
        )}
      </div>
    </div>
  );
}
