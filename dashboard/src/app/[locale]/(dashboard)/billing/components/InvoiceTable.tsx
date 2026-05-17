'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import type { Invoice } from '@/lib/api';
import { billingApiExtended } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/errors';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';

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
  const queryClient = useQueryClient();
  const [refundModal, setRefundModal] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [refunding, setRefunding] = useState(false);

  // Check if an invoice is within 14-day refund window
  const isRefundable = (inv: Invoice) => {
    if (inv.status !== 'paid') return false;
    const invoiceDate = new Date(inv.date);
    const now = new Date();
    const diffDays = (now.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 14;
  };

  const handleRefund = async () => {
    if (!token || !refundReason.trim()) return;
    setRefunding(true);
    try {
      await billingApiExtended.requestRefund(token, refundReason.trim());
      toast(t('refundSuccess'), 'success');
      setRefundModal(null);
      setRefundReason('');
      queryClient.invalidateQueries({ queryKey: ['billing'] });
    } catch (err: unknown) {
      toast(getErrorMessage(err, tc('unknownError')), 'error');
    } finally {
      setRefunding(false);
    }
  };

  return (
    <>
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
                      {isRefundable(inv) && (
                        <button
                          type="button"
                          onClick={() => setRefundModal(inv.id)}
                          className="text-xs text-red-600 dark:text-red-400 hover:underline"
                        >
                          {t('requestRefund')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Refund Modal */}
      {refundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" aria-hidden="true" onClick={() => { setRefundModal(null); setRefundReason(''); }} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6 outline-none">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('refundTitle')}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              {t('refundDesc')}
            </p>
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder={t('refundReasonPlaceholder')}
              className="w-full p-3 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 resize-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              rows={3}
            />
            <div className="flex gap-3 justify-end mt-4">
              <button
                type="button"
                onClick={() => { setRefundModal(null); setRefundReason(''); }}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition"
              >
                {tc('cancel')}
              </button>
              <button
                type="button"
                onClick={handleRefund}
                disabled={refunding || !refundReason.trim()}
                className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition disabled:opacity-50"
              >
                {refunding ? t('processing') : t('confirmRefund')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
