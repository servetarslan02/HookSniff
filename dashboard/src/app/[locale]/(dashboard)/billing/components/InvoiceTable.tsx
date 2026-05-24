'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import type { Invoice } from '@/lib/api';
import { billingApiExtended } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { Download } from '@/components/icons';

export function InvoiceTable({
  invoices,
  loading,
}: {
  invoices: Invoice[];
  loading: boolean;
}) {
  const { token } = useAuth();
  const { toast } = useToast();
  const t = useTranslations('billing');
  const tc = useTranslations('common');
  const locale = useLocale();
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null);

  // Open Polar customer portal to download invoice
  const handleDownloadInvoice = async (inv: Invoice) => {
    if (!token) return;
    setDownloadingInvoice(inv.id);
    try {
      // For Polar invoices, open the customer portal where invoices are available
      if (inv.provider === 'polar') {
        const result = await billingApiExtended.openPortal(token);
        if (result.url && !result.url.includes('/dashboard/billing') && !result.url.includes('/account')) {
          window.open(result.url, '_blank', 'noopener,noreferrer');
        } else {
          toast(t('portalNotAvailable') || 'Billing portal not available', 'info');
        }
      } else {
        // For other providers, try portal
        const result = await billingApiExtended.openPortal(token);
        if (result.url) {
          window.open(result.url, '_blank', 'noopener,noreferrer');
        }
      }
    } catch {
      toast(t('portalNotAvailable') || 'Could not open billing portal', 'error');
    } finally {
      setDownloadingInvoice(null);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700/50 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{invoices.length} {t('invoices')}</span>
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('actions')}
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
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleDownloadInvoice(inv)}
                          disabled={downloadingInvoice === inv.id}
                          className="text-xs text-gray-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 disabled:opacity-50 flex items-center gap-1"
                          title={t('downloadInvoice') || 'Download invoice'}
                        >
                          <Download size={14} strokeWidth={1.75} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </>
  );
}
