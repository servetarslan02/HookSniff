'use client';

import { useTranslations } from 'next-intl';

interface DeadLetter {
  id: string;
  customer_email?: string;
  endpoint_url?: string;
  reason?: string;
  attempts: number;
  created_at: string;
}

export default function DeadLetters({ deadLetters }: { deadLetters: DeadLetter[] }) {
  const t = useTranslations('admin');

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">💀 {t('deadLetters') || 'Dead Letters'}</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('deadLettersDesc') || 'Permanently failed deliveries — no more retries'}</p>
      </div>
      {deadLetters.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">ID</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('user') || 'User'}</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('endpoint') || 'Endpoint'}</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('reason') || 'Reason'}</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('attempts') || 'Attempts'}</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('time') || 'Time'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
              {deadLetters.map((dl) => (
                <tr key={dl.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                  <td className="px-4 py-3 text-xs font-mono text-gray-600 dark:text-slate-400">{dl.id.slice(0, 8)}…</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{dl.customer_email || '—'}</td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-600 dark:text-slate-400 max-w-[200px] truncate">{dl.endpoint_url || '—'}</td>
                  <td className="px-4 py-3 text-xs text-red-600 dark:text-red-400 max-w-[250px] truncate">{dl.reason || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{dl.attempts}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400">{new Date(dl.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-6 text-center text-gray-500 dark:text-slate-400 text-sm">✅ {t('noDeadLetters') || 'No dead letters'}</div>
      )}
    </div>
  );
}
