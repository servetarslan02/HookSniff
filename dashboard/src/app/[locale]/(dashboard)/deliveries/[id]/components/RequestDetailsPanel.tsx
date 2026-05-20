'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { DeliveryDetail } from '@/lib/api';
import { ArrowUpFromLine } from '@/components/icons';

function formatHeaders(headers: Record<string, string>): string {
  return Object.entries(headers)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
}

function formatJson(data: unknown): string {
  if (typeof data === 'string') {
    try { return JSON.stringify(JSON.parse(data), null, 2); } catch { return data; }
  }
  return JSON.stringify(data, null, 2);
}

function CopyButton({ copied, onClick, title }: { copied: boolean; onClick: () => void; title: string }) {
  return (
    <button type="button"
      onClick={onClick}
      className="absolute top-3 right-3 p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition"
      title={title}
    >
      {copied ? (
        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
}

export function RequestDetailsPanel({
  delivery,
  copiedField,
  onCopy,
}: {
  delivery: DeliveryDetail;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
}) {
  const t = useTranslations('deliveryDetail');
  const tCommon = useTranslations('common');
  const [showRequestHeaders, setShowRequestHeaders] = useState(false);
  const [showRequestBody, setShowRequestBody] = useState(false);

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <span className="text-gray-500"><ArrowUpFromLine size={18} strokeWidth={1.75} /></span> {t('requestDetails')}
      </h3>

      {/* Request Headers */}
      <div className="mb-5">
        <button type="button"
          onClick={() => setShowRequestHeaders(!showRequestHeaders)}
          className="flex items-center justify-between w-full text-left group"
        >
          <p className="text-sm font-medium text-gray-700 dark:text-slate-300 group-hover:text-gray-900 dark:group-hover:text-white transition">
            {t('requestHeaders')}
            {delivery.request_headers && (
              <span className="ml-2 text-xs text-gray-500 dark:text-slate-500">
                ({Object.keys(delivery.request_headers).length} {tCommon('headers').toLowerCase()})
              </span>
            )}
          </p>
          <svg
            className={`w-4 h-4 text-gray-500 dark:text-slate-500 transition-transform ${showRequestHeaders ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showRequestHeaders && (
          <div className="mt-3 relative">
            <pre className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl p-4 text-xs font-mono text-gray-700 dark:text-slate-300 overflow-x-auto max-h-64 overflow-y-auto">
              {delivery.request_headers
                ? formatHeaders(delivery.request_headers)
                : t('noHeaders')}
            </pre>
            {delivery.request_headers && (
              <CopyButton
                copied={copiedField === 'req-headers'}
                onClick={() => onCopy(formatHeaders(delivery.request_headers!), 'req-headers')}
                title={t('copyHeaders')}
              />
            )}
          </div>
        )}
      </div>

      {/* Request Body */}
      <div>
        <button type="button"
          onClick={() => setShowRequestBody(!showRequestBody)}
          className="flex items-center justify-between w-full text-left group"
        >
          <p className="text-sm font-medium text-gray-700 dark:text-slate-300 group-hover:text-gray-900 dark:group-hover:text-white transition">
            {t('requestBody')}
          </p>
          <svg
            className={`w-4 h-4 text-gray-500 dark:text-slate-500 transition-transform ${showRequestBody ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showRequestBody && (
          <div className="mt-3 relative">
            <pre className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl p-4 text-xs font-mono text-gray-700 dark:text-slate-300 overflow-x-auto max-h-80 overflow-y-auto">
              {delivery.request_body
                ? formatJson(delivery.request_body)
                : t('noPayload')}
            </pre>
            {delivery.request_body != null && (
              <CopyButton
                copied={copiedField === 'req-body'}
                onClick={() => onCopy(formatJson(delivery.request_body), 'req-body')}
                title={t('copyPayload')}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
