'use client';

import { StatusBadge } from '@/components/StatusBadge';
import type { UserModalsProps } from './types';
import { AlertTriangle, Mail, Search, Trash2, X } from 'lucide-react';

export function UserModals({
  detail,
  showBanModal,
  setShowBanModal,
  banReason,
  setBanReason,
  handleConfirmBan,
  showEmailModal,
  setShowEmailModal,
  emailSubject,
  setEmailSubject,
  emailBody,
  setEmailBody,
  handleSendEmail,
  sendEmailMutation,
  showRefundModal,
  setShowRefundModal,
  refundAmount,
  setRefundAmount,
  refundReason,
  setRefundReason,
  handleRefund,
  refundMutation,
  showTestWebhookModal,
  setShowTestWebhookModal,
  testWebhookUrl,
  setTestWebhookUrl,
  testWebhookEvent,
  setTestWebhookEvent,
  testWebhookPayload,
  setTestWebhookPayload,
  testWebhookResult,
  setTestWebhookResult,
  handleTestWebhook,
  testWebhookMutation,
  showGdprDeleteModal,
  setShowGdprDeleteModal,
  gdprDeleteReason,
  setGdprDeleteReason,
  handleGdprDelete,
  gdprDeleteMutation,
  selectedDeliveryId,
  setSelectedDeliveryId,
  deliveryDetail,
  deliveryLoading,
  deliveryAttempts,
  t,
  tc,
}: UserModalsProps) {
  return (
    <>
      {/* Ban Reason Modal */}
      {showBanModal && detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowBanModal(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              🚫 {t('banUser')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              {t('banUserConfirm', { email: detail.user.email }) || `Are you sure you want to ban ${detail.user.email}?`}
            </p>
            <div className="mb-4">
              <label htmlFor="ban-reason-detail" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                {t('banReason') || 'Reason (optional)'}
              </label>
              <textarea
                id="ban-reason-detail"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={3}
                placeholder={t('banReasonPlaceholder') || 'Enter reason for banning this user...'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition resize-none"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button"
                onClick={() => setShowBanModal(false)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              >
                {tc('cancel')}
              </button>
              <button type="button"
                onClick={handleConfirmBan}
                className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition"
              >
                {t('banUser') || 'Ban User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GDPR Delete Modal */}
      {showGdprDeleteModal && detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowGdprDeleteModal(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
              <Trash2 size={16} strokeWidth={1.75} className="inline mr-1" /> {t('deleteAllData') || 'Delete All User Data'}
            </h3>
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-700 dark:text-red-400 font-medium"><AlertTriangle size={16} strokeWidth={1.75} className="inline mr-1" /> {t('gdprDeleteWarning') || 'This action is permanent and cannot be undone.'}</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                {t('gdprDeleteDesc') || 'All endpoints, deliveries, invoices, notes, tags, and communication history will be deleted. The account will be downgraded to Free.'}
              </p>
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              {t('deletingDataFor', { email: detail.user.email }) || `Deleting data for: ${detail.user.email}`}
            </p>
            <div>
              <label htmlFor="gdpr-reason" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('reason') || 'Reason'} *</label>
              <textarea
                id="gdpr-reason"
                value={gdprDeleteReason}
                onChange={(e) => setGdprDeleteReason(e.target.value)}
                placeholder={t('gdprReasonPlaceholder') || 'e.g. User requested via support ticket #1234'}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowGdprDeleteModal(false); setGdprDeleteReason(''); }}
                className="px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                onClick={handleGdprDelete}
                disabled={gdprDeleteMutation.isPending || !gdprDeleteReason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {gdprDeleteMutation.isPending ? (t('deleting') || 'Deleting...') : (t('confirmDelete') || 'Permanently Delete All Data')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowRefundModal(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              💸 {t('processRefund') || 'Process Refund'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              {t('refundFor', { email: detail.user.email }) || `Refund for ${detail.user.email} (${detail.user.plan} plan)`}
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="refund-amount" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('amount') || 'Amount'} (USD)</label>
                <input
                  id="refund-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder="49.00"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="refund-reason" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('reason') || 'Reason'}</label>
                <textarea
                  id="refund-reason"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder={t('refundReasonPlaceholder') || 'Customer requested refund...'}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowRefundModal(false)}
                className="px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                onClick={handleRefund}
                disabled={refundMutation.isPending || !refundAmount || !refundReason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {refundMutation.isPending ? (t('processing') || 'Processing...') : (t('confirmRefund') || 'Confirm Refund')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowEmailModal(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              <Mail size={16} strokeWidth={1.75} className="inline mr-1" /> {t('sendEmail') || 'Send Email'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              {t('sendEmailTo', { email: detail.user.email }) || `Send email to ${detail.user.email}`}
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="email-subject" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('subject') || 'Subject'}</label>
                <input
                  id="email-subject"
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label htmlFor="email-body" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('message') || 'Message'}</label>
                <textarea
                  id="email-body"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-4">
              <button type="button"
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              >
                {tc('cancel')}
              </button>
              <button type="button"
                onClick={handleSendEmail}
                disabled={sendEmailMutation.isPending || !emailSubject.trim() || !emailBody.trim()}
                className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition disabled:opacity-60"
              >
                {sendEmailMutation.isPending ? tc('saving') : t('send') || 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Webhook Modal */}
      {showTestWebhookModal && detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => { setShowTestWebhookModal(false); setTestWebhookResult(null); }} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              🪝 {t('testWebhook') || 'Test Webhook'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              {t('testWebhookDesc') || `Send a test webhook to ${detail.user.email}'s endpoint`}
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="tw-url" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('endpointUrl') || 'Endpoint URL'} *</label>
                <input
                  id="tw-url"
                  type="url"
                  value={testWebhookUrl}
                  onChange={(e) => setTestWebhookUrl(e.target.value)}
                  placeholder="https://example.com/webhook"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label htmlFor="tw-event" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('eventType') || 'Event Type'}</label>
                <input
                  id="tw-event"
                  type="text"
                  value={testWebhookEvent}
                  onChange={(e) => setTestWebhookEvent(e.target.value)}
                  placeholder="order.created"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label htmlFor="tw-payload" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('payload') || 'Payload'} (JSON)</label>
                <textarea
                  id="tw-payload"
                  value={testWebhookPayload}
                  onChange={(e) => setTestWebhookPayload(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
                />
              </div>
            </div>

            {/* Result */}
            {testWebhookResult && (
              <div className="mt-4 p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-sm font-medium ${testWebhookResult.status_code < 400 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    HTTP {testWebhookResult.status_code}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-slate-400">
                    {testWebhookResult.duration_ms}ms
                  </span>
                </div>
                <pre className="text-xs font-mono text-gray-700 dark:text-slate-300 overflow-x-auto max-h-32">
                  {testWebhookResult.response_body}
                </pre>
              </div>
            )}

            <div className="flex gap-3 justify-end mt-4">
              <button type="button"
                onClick={() => { setShowTestWebhookModal(false); setTestWebhookResult(null); }}
                className="px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                {tc('cancel')}
              </button>
              <button type="button"
                onClick={handleTestWebhook}
                disabled={testWebhookMutation.isPending || !testWebhookUrl.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition disabled:opacity-60"
              >
                {testWebhookMutation.isPending ? (t('sending') || 'Sending...') : (t('sendTest') || 'Send Test')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Detail Modal */}
      {selectedDeliveryId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setSelectedDeliveryId(null)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                <Search size={16} strokeWidth={1.75} className="inline mr-1" /> {t("deliveryDetails") || "Delivery Details"}
              </h3>
              <button type="button"
                onClick={() => setSelectedDeliveryId(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition"
              >
                <X size={16} strokeWidth={1.75} className="inline mr-1" /> </button>
            </div>

            {deliveryLoading ? (
              <div className="py-8 text-center text-gray-500 dark:text-slate-400">{tc('loading')}</div>
            ) : deliveryDetail ? (
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-slate-400">ID</label>
                    <p className="text-sm font-mono text-gray-900 dark:text-white break-all">{deliveryDetail.id}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-slate-400">{t("status")}</label>
                    <div className="mt-1"><StatusBadge status={deliveryDetail.status} /></div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-slate-400">{t("event")}</label>
                    <p className="text-sm text-gray-900 dark:text-white">{deliveryDetail.event || '—'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-slate-400">{t("attempts")}</label>
                    <p className="text-sm text-gray-900 dark:text-white">{deliveryDetail.attempt_count}</p>
                  </div>
                  {deliveryDetail.endpoint_url && (
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500 dark:text-slate-400">{t("endpoint")}</label>
                      <p className="text-sm font-mono text-gray-900 dark:text-white break-all">{deliveryDetail.endpoint_url}</p>
                    </div>
                  )}
                  {deliveryDetail.error_message && (
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500 dark:text-slate-400">{t("error")}</label>
                      <p className="text-sm text-red-600 dark:text-red-400">{deliveryDetail.error_message}</p>
                    </div>
                  )}
                </div>

                {/* Request Body */}
                {deliveryDetail.request_body && (
                  <div>
                    <label className="text-xs text-gray-500 dark:text-slate-400 mb-1 block">{t("payload") || "Payload"}</label>
                    <pre className="p-3 bg-gray-50 dark:bg-slate-900 rounded-xl text-xs font-mono text-gray-800 dark:text-slate-300 overflow-x-auto max-h-40">
                      {typeof deliveryDetail.request_body === 'string'
                        ? deliveryDetail.request_body
                        : JSON.stringify(deliveryDetail.request_body, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Request Headers */}
                {deliveryDetail.request_headers && Object.keys(deliveryDetail.request_headers).length > 0 && (
                  <div>
                    <label className="text-xs text-gray-500 dark:text-slate-400 mb-1 block">{t("headers") || "Headers"}</label>
                    <pre className="p-3 bg-gray-50 dark:bg-slate-900 rounded-xl text-xs font-mono text-gray-800 dark:text-slate-300 overflow-x-auto max-h-32">
                      {JSON.stringify(deliveryDetail.request_headers, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Attempts */}
                {deliveryAttempts.length > 0 && (
                  <div>
                    <label className="text-xs text-gray-500 dark:text-slate-400 mb-2 block">{t("attempts") || "Attempts"}</label>
                    <div className="space-y-2">
                      {deliveryAttempts.map((a) => (
                        <div key={a.id} className="p-3 bg-gray-50 dark:bg-slate-900 rounded-xl">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-700 dark:text-slate-300">
                              #{a.attempt_number} — <StatusBadge status={a.status} />
                            </span>
                            <span className="text-xs text-gray-500 dark:text-slate-400">
                              {a.duration_ms ? `${a.duration_ms}ms` : ''} {new Date(a.created_at).toLocaleString()}
                            </span>
                          </div>
                          {a.response_status && (
                            <p className="text-xs text-gray-600 dark:text-slate-400">HTTP {a.response_status}</p>
                          )}
                          {a.error_message && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{a.error_message}</p>
                          )}
                          {a.response_body && (
                            <pre className="mt-2 p-2 bg-gray-100 dark:bg-slate-800 rounded-sm text-xs font-mono text-gray-700 dark:text-slate-300 overflow-x-auto max-h-24">
                              {a.response_body}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
