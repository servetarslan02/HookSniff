'use client';

import { useTranslations, useLocale } from 'next-intl';
import type { Invoice } from '@/lib/api';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';

export function InvoiceTable({
  invoices,
  loading,
}: {
  invoices: Invoice[];
  loading: boolean;
}) {
  const t = useTranslations('billing');
  const tc = useTranslations('common');
  const locale = useLocale();

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('invoiceHistory')}</h2>
        <span className="text-sm text-gray-500 dark:text-slate-400">{invoices.length} {t('invoices')}</span>
      </div>
      {loading ? (
        <div className="px-6 py-12 text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">{tc('loading')}</p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-sm text-gray-500 dark:text-slate-400">{t('noInvoices')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('invoice')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('date')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('plan')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('amount')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('status')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition">
                  <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-slate-400">
                    {inv.id.slice(0, 8)}…
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                    {new Date(inv.date).toLocaleDateString(locale)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{inv.plan}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    ${inv.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <InvoiceStatusBadge status={inv.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
