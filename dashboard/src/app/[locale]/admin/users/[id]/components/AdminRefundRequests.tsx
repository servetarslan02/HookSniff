'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { getErrorMessage } from '@/lib/errors';
import { CheckCircle2, XCircle, Clock, DollarSign, MessageSquare } from '@/components/icons';

interface RefundRequest {
  id: string;
  customer_id: string;
  email: string;
  category: string;
  description: string;
  amount_cents: number;
  currency: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
}

const CATEGORY_LABELS: Record<string, { en: string; tr: string; icon: string }> = {
  accidental_purchase: { en: 'Accidental Purchase', tr: 'Yanlışlıkla Satın Alma', icon: '🛒' },
  not_satisfied: { en: 'Not Satisfied', tr: 'Memnun Değilim', icon: '😞' },
  missing_features: { en: 'Missing Features', tr: 'Eksik Özellikler', icon: '🧩' },
  technical_issues: { en: 'Technical Issues', tr: 'Teknik Sorunlar', icon: '🔧' },
  billing_error: { en: 'Billing Error', tr: 'Faturalandırma Hatası', icon: '💳' },
  other: { en: 'Other', tr: 'Diğer', icon: '📝' },
};

export function AdminRefundRequests() {
  const { token } = useAuth();
  const { toast } = useToast();
  const t = useTranslations('admin');
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'deny' | null>(null);

  const fetchRequests = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { api } = await import('@/lib/api');
      const statusParam = filter ? `?status=${filter}` : '';
      const data = await api.get(`/admin/refund-requests${statusParam}`, token);
      setRequests(data.requests || []);
    } catch (err: unknown) {
      toast(getErrorMessage(err, 'Failed to load refund requests'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [token, filter]);

  const handleReview = async (id: string, action: 'approve' | 'deny') => {
    if (!token) return;
    try {
      const { api } = await import('@/lib/api');
      await api.post(`/admin/refund-requests/${id}/${action}`, { admin_notes: adminNotes }, token);
      toast(
        action === 'approve' ? 'Refund approved and processed' : 'Refund request denied',
        'success'
      );
      setReviewingId(null);
      setAdminNotes('');
      setActionType(null);
      fetchRequests();
    } catch (err: unknown) {
      toast(getErrorMessage(err, 'Action failed'), 'error');
    }
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      processed: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
      denied: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    };
    return styles[status] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300';
  };

  const lang = typeof window !== 'undefined' && navigator.language.startsWith('tr') ? 'tr' : 'en';

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 flex items-center gap-2">
          <DollarSign size={16} strokeWidth={1.75} />
          {t('refundRequests') || 'Refund Requests'}
        </h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
        >
          <option value="pending">⏳ {t('pending') || 'Pending'}</option>
          <option value="processed">✅ {t('processed') || 'Processed'}</option>
          <option value="denied">❌ {t('denied') || 'Denied'}</option>
          <option value="">{t('all') || 'All'}</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : requests.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-8">
          {t('noRefundRequests') || 'No refund requests'}
        </p>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {req.email}
                    </span>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(req.status)}`}>
                      {req.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      {CATEGORY_LABELS[req.category]?.icon || '📝'}{' '}
                      {CATEGORY_LABELS[req.category]?.[lang] || req.category}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-slate-500">•</span>
                    <span className="text-xs font-medium text-gray-700 dark:text-slate-300">
                      ${(req.amount_cents / 100).toFixed(2)} {req.currency.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-slate-500">•</span>
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      {new Date(req.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-slate-400 whitespace-pre-wrap">
                    {req.description}
                  </p>
                  {req.admin_notes && (
                    <div className="mt-2 flex items-start gap-1.5 text-xs text-gray-500 dark:text-slate-400">
                      <MessageSquare size={12} strokeWidth={1.75} className="mt-0.5 shrink-0" />
                      <span>{req.admin_notes}</span>
                    </div>
                  )}
                </div>

                {req.status === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => { setReviewingId(req.id); setActionType('approve'); }}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition"
                    >
                      <CheckCircle2 size={14} strokeWidth={1.75} className="inline mr-1" />
                      {t('approve') || 'Approve'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setReviewingId(req.id); setActionType('deny'); }}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
                    >
                      <XCircle size={14} strokeWidth={1.75} className="inline mr-1" />
                      {t('deny') || 'Deny'}
                    </button>
                  </div>
                )}
              </div>

              {/* Review form */}
              {reviewingId === req.id && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder={t('adminNotesPlaceholder') || 'Optional notes...'}
                    className="w-full p-2 text-sm border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none"
                    rows={2}
                  />
                  <div className="flex gap-2 mt-2 justify-end">
                    <button
                      type="button"
                      onClick={() => { setReviewingId(null); setAdminNotes(''); setActionType(null); }}
                      className="px-3 py-1.5 text-xs text-gray-600 dark:text-slate-400 hover:underline"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReview(req.id, actionType!)}
                      className={`px-3 py-1.5 text-xs font-medium text-white rounded-lg transition ${
                        actionType === 'approve'
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {actionType === 'approve' ? 'Confirm Approve' : 'Confirm Deny'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
