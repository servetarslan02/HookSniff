'use client';

import { AdminRefundRequests } from '../users/[id]/components/AdminRefundRequests';
import { useTranslations } from 'next-intl';

export default function RefundRequestsPage() {
  const t = useTranslations('admin');

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          {t('refundRequests') || 'Refund Requests'}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
          {t('refundRequestsDesc') || 'Review and manage customer refund requests.'}
        </p>
      </div>
      <AdminRefundRequests />
    </div>
  );
}
