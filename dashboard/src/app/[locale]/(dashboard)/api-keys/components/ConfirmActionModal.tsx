'use client';

import { useTranslations } from 'next-intl';

export function ConfirmActionModal({
  open,
  title,
  description,
  confirmLabel,
  confirmVariant = 'danger',
  loading,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmVariant?: 'danger' | 'warning';
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const tc = useTranslations('common');

  if (!open) return null;

  const variantClasses = confirmVariant === 'danger'
    ? 'bg-red-600 hover:bg-red-700'
    : 'bg-amber-600 hover:bg-amber-700';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" aria-hidden="true" onClick={onCancel} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
          {description}
        </p>
        <div className="flex gap-3 justify-end">
          <button type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition"
          >
            {tc('cancel')}
          </button>
          <button type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2.5 text-sm font-medium text-white rounded-xl transition disabled:opacity-60 ${variantClasses}`}
          >
            {loading ? tc('deleting') : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
