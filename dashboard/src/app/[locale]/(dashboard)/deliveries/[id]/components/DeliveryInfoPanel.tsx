'use client';

import { useTranslations } from 'next-intl';
import type { DeliveryDetail } from '@/lib/api';
import { DetailRow } from './DetailRow';
import { ClipboardList } from '@/components/icons';

export function DeliveryInfoPanel({
  delivery,
  copiedField,
  onCopy,
}: {
  delivery: DeliveryDetail;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
}) {
  const t = useTranslations('deliveryDetail');

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <span><ClipboardList size={18} strokeWidth={1.75} /></span> {t('deliveryInfo')}
      </h3>
      <div className="space-y-4">
        <DetailRow label={t('deliveryId')} value={delivery.id} mono copyable onCopy={() => onCopy(delivery.id, 'id')} copied={copiedField === 'id'} />
        <DetailRow label={t('endpointId')} value={delivery.endpoint_id} mono copyable onCopy={() => onCopy(delivery.endpoint_id, 'endpoint')} copied={copiedField === 'endpoint'} />
        {delivery.endpoint_url && (
          <DetailRow label={t('endpointUrl')} value={delivery.endpoint_url} mono copyable onCopy={() => onCopy(delivery.endpoint_url!, 'url')} copied={copiedField === 'url'} />
        )}
        <DetailRow label={t('eventType')} value={delivery.event || '—'} />
        <DetailRow label={t('status')} value={delivery.status} />
        <DetailRow label={t('attemptCount')} value={String(delivery.attempt_count)} />
        {delivery.response_status && (
          <DetailRow label={t('lastResponse')} value={String(delivery.response_status)} />
        )}
        <DetailRow label={t('created')} value={new Date(delivery.created_at).toLocaleString()} />
        {delivery.updated_at && (
          <DetailRow label={t('updated')} value={new Date(delivery.updated_at).toLocaleString()} />
        )}
        {delivery.error_message && (
          <div className="pt-3 border-t border-gray-100 dark:border-slate-700">
            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">{t('errorLabel')}</p>
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 p-3 rounded-lg font-mono break-all">
              {delivery.error_message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
