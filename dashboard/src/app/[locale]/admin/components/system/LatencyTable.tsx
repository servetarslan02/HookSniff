'use client';

import { useTranslations } from 'next-intl';
import { Timer } from '@/components/icons';

interface LatencyEndpoint {
  endpoint_id: string;
  url: string;
  total_deliveries: number;
  avg_latency_ms?: number | null;
  p95_latency_ms?: number | null;
  error_rate: number;
  failed_count?: number;
}

export default function LatencyTable({ endpoints }: { endpoints: LatencyEndpoint[] }) {
  const t = useTranslations('admin');

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white"><Timer size={18} strokeWidth={1.75} className="inline mr-1" />{t('apiLatency') || 'API Latency'} (24h)</h2>
      </div>
      {endpoints.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('endpoint') || 'Endpoint'}</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('deliveries') || 'Deliveries'}</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Avg</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">P95</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('errorRate') || 'Error Rate'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
              {endpoints.map((ep) => (
                <tr key={ep.endpoint_id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                  <td className="px-4 py-3 text-xs font-mono text-gray-900 dark:text-white max-w-[250px] truncate">{ep.url}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{ep.total_deliveries.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{ep.avg_latency_ms ? `${Math.round(ep.avg_latency_ms)}ms` : '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{ep.p95_latency_ms ? `${Math.round(ep.p95_latency_ms)}ms` : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                      ep.error_rate > 10 ? 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400'
                      : ep.error_rate > 5 ? 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
                      : 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400'
                    }`}>{ep.error_rate}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-6 text-center text-gray-500 dark:text-slate-400 text-sm">{t('noData') || 'No data'}</div>
      )}
    </div>
  );
}
