'use client';

import type { AdminUser } from '@/lib/api';

interface BanModalProps {
  banTarget: AdminUser | null;
  banReason: string;
  setBanReason: (reason: string) => void;
  handleConfirmBan: () => void;
  setBanTarget: (user: AdminUser | null) => void;
  t: (key: string, params?: Record<string, unknown>) => string;
  tc: (key: string) => string;
}

export function BanModal({
  banTarget,
  banReason,
  setBanReason,
  handleConfirmBan,
  setBanTarget,
  t,
  tc,
}: BanModalProps) {
  if (!banTarget) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setBanTarget(null)} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          🚫 {t('banUser')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
          {t('banUserConfirm', { email: banTarget.email }) || `Are you sure you want to ban ${banTarget.email}?`}
        </p>
        <div className="mb-4">
          <label htmlFor="ban-reason" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            {t('banReason') || 'Reason (optional)'}
          </label>
          <textarea
            id="ban-reason"
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            rows={3}
            placeholder={t('banReasonPlaceholder') || 'Enter reason for banning this user...'}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition resize-none"
          />
        </div>
        <div className="flex gap-3 justify-end">
          <button type="button"
            onClick={() => setBanTarget(null)}
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
  );
}
