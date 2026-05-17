'use client';

import { LazySection, Skeletons } from '@/components/LazySection';
import type { BillingTabProps } from './types';

export function BillingTab({
  detail,
  userInvoices,
  invoicesTotal,
  invoicesPage,
  setInvoicesPage,
  invoiceFilter,
  setInvoiceFilter,
  userPayments,
  userRefunds,
  handleGdprExport,
  handleGdprDelete: _handleGdprDelete,
  gdprExportMutation,
  showGdprDeleteModal: _showGdprDeleteModal,
  setShowGdprDeleteModal,
  gdprDeleteReason: _gdprDeleteReason,
  setGdprDeleteReason: _setGdprDeleteReason,
  t,
  tc: _tc,
  setShowRefundModal,
}: BillingTabProps) {
  return (
    <LazySection fallback={Skeletons.table()} rootMargin={300}>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">💰 {t("billing") || "Billing"}</h2>
        {detail && detail.user.plan !== 'free' && detail.user.plan !== 'developer' && (
          <button
            onClick={() => setShowRefundModal(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            💸 {t("processRefund") || "Process Refund"}
          </button>
        )}
      </div>

      {/* Invoices */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400">📄 {t("invoices") || "Invoices"}</h3>
          <select
            value={invoiceFilter}
            onChange={(e) => { setInvoiceFilter(e.target.value); setInvoicesPage(1); }}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
          >
            <option value="">{t("allStatuses") || "All Statuses"}</option>
            <option value="paid">✅ Paid</option>
            <option value="pending">⏳ Pending</option>
            <option value="failed">❌ Failed</option>
          </select>
        </div>
        {userInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400">{t("plan") || "Plan"}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400">{t("amount") || "Amount"}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400">{t("status") || "Status"}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400">{t("provider") || "Provider"}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400">{t("date") || "Date"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {userInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white capitalize">{inv.plan}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{(inv.amount_cents / 100).toFixed(2)} {inv.currency.toUpperCase()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        inv.status === 'paid' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                        inv.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      }`}>{inv.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400">{inv.provider}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400">{new Date(inv.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400 dark:text-slate-500">{t("noInvoices") || "No invoices yet"}</p>
        )}
        {invoicesTotal > 50 && (
          <div className="flex justify-center gap-2 mt-4">
            <button onClick={() => setInvoicesPage((p) => Math.max(1, p - 1))} disabled={invoicesPage === 1} className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-slate-800 disabled:opacity-40">←</button>
            <span className="px-3 py-1.5 text-sm text-gray-600 dark:text-slate-400">{invoicesPage} / {Math.ceil(invoicesTotal / 50)}</span>
            <button onClick={() => setInvoicesPage((p) => p + 1)} disabled={invoicesPage >= Math.ceil(invoicesTotal / 50)} className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-slate-800 disabled:opacity-40">→</button>
          </div>
        )}
      </div>

      {/* Payment Transactions */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-4">💳 {t("payments") || "Payment Transactions"}</h3>
        {userPayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400">{t("amount") || "Amount"}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400">{t("status") || "Status"}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400">{t("provider") || "Provider"}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400">{t("transactionId") || "Transaction ID"}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400">{t("date") || "Date"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {userPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{(pay.amount_cents / 100).toFixed(2)} {pay.currency.toUpperCase()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        pay.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                        pay.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      }`}>{pay.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400">{pay.provider}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400 font-mono">{pay.provider_transaction_id || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400">{new Date(pay.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400 dark:text-slate-500">{t("noPayments") || "No payment transactions yet"}</p>
        )}
      </div>

      {/* Refund History */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-4">💸 {t("refundHistory") || "Refund History"}</h3>
        {userRefunds.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400">{t("amount") || "Amount"}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400">{t("reason") || "Reason"}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400">{t("status") || "Status"}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400">{t("provider") || "Provider"}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400">{t("date") || "Date"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {userRefunds.map((ref) => (
                  <tr key={ref.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400">-{(ref.amount_cents / 100).toFixed(2)} {ref.currency.toUpperCase()}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-slate-300 max-w-xs truncate">{ref.reason || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        ref.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                        ref.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      }`}>{ref.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400">{ref.provider}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400">{new Date(ref.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400 dark:text-slate-500">{t("noRefunds") || "No refunds yet"}</p>
        )}
      </div>

      {/* GDPR Data Management */}
      <div className="glass-card p-6 border-2 border-amber-200 dark:border-amber-500/30">
        <h3 className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-2">🔐 {t("gdprDataManagement") || "GDPR Data Management"}</h3>
        <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
          {t("gdprDesc") || "Export or permanently delete all user data per GDPR requirements."}
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleGdprExport}
            disabled={gdprExportMutation.isPending}
            className="px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-lg transition-colors disabled:opacity-50"
          >
            {gdprExportMutation.isPending ? (t('exporting') || 'Exporting...') : `📦 ${t('exportData') || 'Export All Data'}`}
          </button>
          <button
            onClick={() => setShowGdprDeleteModal(true)}
            className="px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-colors"
          >
            🗑️ {t('deleteAllData') || 'Delete All Data'}
          </button>
        </div>
      </div>
    </div>
    </LazySection>
  );
}
