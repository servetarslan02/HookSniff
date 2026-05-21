'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/errors';
import { X, AlertTriangle, CheckCircle2 } from '@/components/icons';

const REFUND_CATEGORIES = [
  { value: 'accidental_purchase', icon: '🛒' },
  { value: 'not_satisfied', icon: '😞' },
  { value: 'missing_features', icon: '🧩' },
  { value: 'technical_issues', icon: '🔧' },
  { value: 'billing_error', icon: '💳' },
  { value: 'other', icon: '📝' },
] as const;

export function RefundRequestModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { token } = useAuth();
  const { toast } = useToast();
  const t = useTranslations('billing');
  const tc = useTranslations('common');
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<string>('other');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!token || !description.trim()) return;
    setSubmitting(true);
    try {
      const { api } = await import('@/lib/api');
      await api.post('/billing/refund-request', { category, description: description.trim() }, token);
      setSubmitted(true);
      toast(t('refundRequestSubmitted') || 'Refund request submitted successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['billing'] });
    } catch (err: unknown) {
      toast(getErrorMessage(err, tc('unknownError')), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setCategory('other');
    setDescription('');
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" aria-hidden="true" onClick={handleClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 outline-none">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
        >
          <X size={20} strokeWidth={1.75} />
        </button>

        {submitted ? (
          <div className="text-center py-4">
            <CheckCircle2 size={48} strokeWidth={1.5} className="mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('refundRequestSubmitted') || 'Request Submitted'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
              {t('refundRequestPending') || 'Your refund request has been submitted. Our team will review it and get back to you.'}
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition"
            >
              {tc('close') || 'Close'}
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 pr-8">
              {t('requestRefund') || 'Request Refund'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              {t('refundRequestDesc') || 'Select a reason and describe your issue. Our team will review your request.'}
            </p>

            {/* Category selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                {t('refundCategory') || 'Reason'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {REFUND_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm rounded-xl border transition ${
                      category === cat.value
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300'
                        : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{t(`refundCategories.${cat.value}`) || cat.value.replace(/_/g, ' ')}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                {t('refundDescription') || 'Description'}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('refundDescriptionPlaceholder') || 'Please describe why you want a refund...'}
                className="w-full p-3 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 resize-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                rows={4}
                maxLength={2000}
              />
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 text-right">
                {description.length}/2000
              </p>
            </div>

            <div className="flex items-start gap-2 mb-4 p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
              <AlertTriangle size={16} strokeWidth={1.75} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                {t('refundWarning') || 'Refund requests are reviewed by our team. Approval is not guaranteed. Your plan will be downgraded to Free upon refund approval.'}
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition"
              >
                {tc('cancel')}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !description.trim()}
                className="px-4 py-2.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition disabled:opacity-50"
              >
                {submitting ? (t('submitting') || 'Submitting...') : (t('submitRefundRequest') || 'Submit Request')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
