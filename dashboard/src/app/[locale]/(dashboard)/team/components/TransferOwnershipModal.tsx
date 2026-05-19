'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { TeamMember } from '@/lib/api';

export function TransferOwnershipModal({
  members,
  currentOwnerId,
  onTransfer,
  onClose,
}: {
  members: TeamMember[];
  currentOwnerId: string;
  onTransfer: (newOwnerId: string) => Promise<void>;
  onClose: () => void;
}) {
  const t = useTranslations('team');
  const tc = useTranslations('common');
  const [selectedId, setSelectedId] = useState('');
  const [transferring, setTransferring] = useState(false);

  const eligibleMembers = members.filter((m) => m.customer_id !== currentOwnerId && m.joined_at !== null);

  const handleTransfer = async () => {
    if (!selectedId) return;
    setTransferring(true);
    try {
      await onTransfer(selectedId);
    } finally {
      setTransferring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white mb-4 shadow-lg shadow-orange-500/20">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('transferOwnership') || 'Transfer Ownership'}</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {t('transferOwnershipDesc') || 'Select a team member to become the new owner. They will be promoted to admin.'}
          </p>
        </div>

        <div className="px-6 pb-2">
          {eligibleMembers.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-slate-400 py-4 text-center">
              {t('noEligibleMembers') || 'No eligible members. Invite someone first.'}
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {eligibleMembers.map((m) => (
                <button
                  key={m.customer_id}
                  type="button"
                  onClick={() => setSelectedId(m.customer_id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                    selectedId === m.customer_id
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10'
                      : 'border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 dark:from-slate-500 dark:to-slate-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {(m.name || m.email)[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{m.name || m.email.split('@')[0]}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{m.email}</p>
                  </div>
                  {selectedId === m.customer_id && (
                    <svg className="w-5 h-5 text-orange-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 mt-4 bg-gray-50 dark:bg-slate-800/50 flex gap-3 justify-end border-t border-gray-100 dark:border-slate-700/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 rounded-xl border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 transition"
          >
            {tc('cancel')}
          </button>
          <button
            type="button"
            onClick={handleTransfer}
            disabled={!selectedId || transferring}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-orange-600 rounded-xl hover:bg-orange-700 transition shadow-sm shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {transferring && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {transferring ? (tc('transferring') || 'Transferring...') : (t('confirmTransfer') || 'Transfer Ownership')}
          </button>
        </div>
      </div>
    </div>
  );
}
