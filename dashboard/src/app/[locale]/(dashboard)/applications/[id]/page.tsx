'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useApplicationDetail } from '@/hooks/useDashboardData';

/* ─── Hook0-style: Application detay — içinde endpoint'ler + teslimatlar ─── */

type Tab = 'endpoints' | 'deliveries';

export default function ApplicationDetailPage() {
  const params = useParams();
  const t = useTranslations('applications');
  const [activeTab, setActiveTab] = useState<Tab>('endpoints');

  const appId = params.id as string;

  // React Query hook for data fetching
  const { data, isLoading: loading } = useApplicationDetail(appId);

  const app = data?.app ?? null;
  const endpoints = data?.endpoints ?? [];
  const deliveries = data?.deliveries ?? [];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-sm w-1/4 animate-pulse"></div>
        <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-sm animate-pulse"></div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">{t('notFound') || 'Uygulama bulunamadı'}</p>
        <Link href="/team-mgmt" className="text-green-600 hover:underline text-sm mt-2 inline-block">
          ← {t('backToList') || 'Geri dön'}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Başlık ── */}
      <div className="flex items-center gap-3">
        <Link href="/team-mgmt" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          ←
        </Link>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{app.name}</h2>
          {app.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{app.description}</p>
          )}
        </div>
        <span className="ml-auto font-mono text-xs text-gray-400">{app.id}</span>
      </div>

      {/* ── Tab Menü (Hook0 gibi) ── */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {(['endpoints', 'deliveries'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'text-green-600 border-b-2 border-green-600 dark:text-green-400 dark:border-green-400'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            {tab === 'endpoints' ? (t('endpoints') || "Endpoint'ler") : (t('deliveries') || 'Teslimatlar')}
          </button>
        ))}
      </div>

      {/* ── Endpoint'ler Tablosu ── */}
      {activeTab === 'endpoints' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {endpoints.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
              {t('noEndpoints') || 'Bu uygulamada henüz endpoint yok'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">ID</th>
                    <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">URL</th>
                    <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('status') || 'Durum'}</th>
                  </tr>
                </thead>
                <tbody>
                  {endpoints.map((ep) => (
                    <tr key={ep.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-5 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{ep.id.slice(0, 8)}…</td>
                      <td className="px-5 py-3 font-mono text-gray-900 dark:text-gray-200 max-w-xs truncate">{ep.url}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          ep.is_active ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${ep.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                          {ep.is_active ? (t('active') || 'Aktif') : (t('inactive') || 'Pasif')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Teslimatlar Tablosu ── */}
      {activeTab === 'deliveries' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {deliveries.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
              {t('noDeliveries') || 'Henüz teslimat yok'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">ID</th>
                    <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('event') || 'Olay'}</th>
                    <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('status') || 'Durum'}</th>
                    <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('time') || 'Zaman'}</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((d) => (
                    <tr key={d.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-5 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{d.id.slice(0, 8)}…</td>
                      <td className="px-5 py-3">
                        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-sm text-gray-700 dark:text-gray-300">
                          {d.event || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          d.status === 'delivered' ? 'text-green-600 dark:text-green-400' :
                          d.status === 'failed' ? 'text-red-600 dark:text-red-400' :
                          'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            d.status === 'delivered' ? 'bg-green-500' :
                            d.status === 'failed' ? 'bg-red-500' :
                            'bg-yellow-500'
                          }`}></span>
                          {d.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                        {new Date(d.created_at).toLocaleString('tr-TR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
