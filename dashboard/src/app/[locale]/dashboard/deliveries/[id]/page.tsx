'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { webhooksApi, type DeliveryDetail, type DeliveryAttempt } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function DeliveryDetailPage() {
  const t = useTranslations('deliveryDetail');
  const tCommon = useTranslations('common');
  const { id } = useParams<{ id: string }>();
  const locale = useLocale();
  const { token } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [delivery, setDelivery] = useState<DeliveryDetail | null>(null);
  const [attempts, setAttempts] = useState<DeliveryAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replaying, setReplaying] = useState(false);
  const [showReplayConfirm, setShowReplayConfirm] = useState(false);
  const [expandedAttempt, setExpandedAttempt] = useState<string | null>(null);
  const [showRequestHeaders, setShowRequestHeaders] = useState(false);
  const [showRequestBody, setShowRequestBody] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);
    setError('');
    try {
      const [detail, attemptList] = await Promise.all([
        webhooksApi.get(token, id),
        webhooksApi.getAttempts(token, id).catch(() => [] as DeliveryAttempt[]),
      ]);
      setDelivery(detail);
      setAttempts(attemptList);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('loadFailed');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [token, id, t]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleReplay = async () => {
    if (!token || !id) return;
    setReplaying(true);
    try {
      await webhooksApi.replay(token, id);
      toast(t('toastReplaySuccess'), 'success');
      fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('toastReplayFailed');
      toast(message, 'error');
    } finally {
      setReplaying(false);
      setShowReplayConfirm(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast(t('toastCopyFailed'), 'error');
    }
  };

  const formatJson = (data: unknown): string => {
    if (typeof data === 'string') {
      try { return JSON.stringify(JSON.parse(data), null, 2); } catch { return data; }
    }
    return JSON.stringify(data, null, 2);
  };

  const formatHeaders = (headers: Record<string, string>): string => {
    return Object.entries(headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  };

  const getHttpStatusColor = (code?: number): string => {
    if (!code) return 'text-gray-400 dark:text-slate-500';
    if (code < 300) return 'text-emerald-600 dark:text-emerald-400';
    if (code < 400) return 'text-blue-600 dark:text-blue-400';
    if (code < 500) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getAttemptStatusIcon = (status: string) => {
    if (status === 'delivered') return '✓';
    return '✕';
  };

  const getAttemptStatusColor = (status: string) => {
    if (status === 'delivered') return 'bg-emerald-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="glass-card p-6 animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
        </div>
        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('loadFailed')}</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">{error}</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={fetchData}
            className="bg-brand-600 dark:bg-brand-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 dark:hover:bg-brand-600 transition"
          >
            {t('tryAgain')}
          </button>
          <button
            onClick={() => router.push(`/${locale}/dashboard/deliveries`)}
            className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition"
          >
            {t('backToDeliveries')}
          </button>
        </div>
      </div>
    );
  }

  if (!delivery) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/${locale}/dashboard/deliveries`)}
            className="p-2 -ml-2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
            title={t('backToDeliveries')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 font-mono">{delivery.id}</p>
          </div>
        </div>
        <button
          onClick={() => setShowReplayConfirm(true)}
          className="bg-brand-600 dark:bg-brand-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 dark:hover:bg-brand-600 transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {t('replayWebhook')}
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t('statusLabel')}</p>
          <StatusBadge status={delivery.status} size="lg" />
        </div>
        <div className="glass-card p-5">
          <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t('eventLabel')}</p>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 dark:bg-slate-800 text-sm font-mono text-gray-700 dark:text-slate-300">
            {delivery.event || '—'}
          </span>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t('attemptsLabel')}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{delivery.attempt_count}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t('responseLabel')}</p>
          {delivery.response_status ? (
            <p className={`text-2xl font-bold font-mono ${getHttpStatusColor(delivery.response_status)}`}>
              {delivery.response_status}
            </p>
          ) : (
            <p className="text-2xl font-bold text-gray-300 dark:text-slate-600">—</p>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery Info */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>📋</span> {t('deliveryInfo')}
          </h3>
          <div className="space-y-4">
            <DetailRow label={t('deliveryId')} value={delivery.id} mono copyable onCopy={() => copyToClipboard(delivery.id, 'id')} copied={copiedField === 'id'} />
            <DetailRow label={t('endpointId')} value={delivery.endpoint_id} mono copyable onCopy={() => copyToClipboard(delivery.endpoint_id, 'endpoint')} copied={copiedField === 'endpoint'} />
            {delivery.endpoint_url && (
              <DetailRow label={t('endpointUrl')} value={delivery.endpoint_url} mono copyable onCopy={() => copyToClipboard(delivery.endpoint_url!, 'url')} copied={copiedField === 'url'} />
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

        {/* Request Details */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>📤</span> {t('requestDetails')}
          </h3>

          {/* Request Headers */}
          <div className="mb-5">
            <button
              onClick={() => setShowRequestHeaders(!showRequestHeaders)}
              className="flex items-center justify-between w-full text-left group"
            >
              <p className="text-sm font-medium text-gray-700 dark:text-slate-300 group-hover:text-gray-900 dark:group-hover:text-white transition">
                {t('requestHeaders')}
                {delivery.request_headers && (
                  <span className="ml-2 text-xs text-gray-400 dark:text-slate-500">
                    ({Object.keys(delivery.request_headers).length} {tCommon('headers').toLowerCase()})
                  </span>
                )}
              </p>
              <svg
                className={`w-4 h-4 text-gray-400 dark:text-slate-500 transition-transform ${showRequestHeaders ? 'rotate-180' : ''}`}
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
                  <button
                    onClick={() => copyToClipboard(formatHeaders(delivery.request_headers!), 'req-headers')}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition"
                    title={t('copyHeaders')}
                  >
                    {copiedField === 'req-headers' ? (
                      <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Request Body */}
          <div>
            <button
              onClick={() => setShowRequestBody(!showRequestBody)}
              className="flex items-center justify-between w-full text-left group"
            >
              <p className="text-sm font-medium text-gray-700 dark:text-slate-300 group-hover:text-gray-900 dark:group-hover:text-white transition">
                {t('requestBody')}
              </p>
              <svg
                className={`w-4 h-4 text-gray-400 dark:text-slate-500 transition-transform ${showRequestBody ? 'rotate-180' : ''}`}
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
                  <button
                    onClick={() => copyToClipboard(formatJson(delivery.request_body), 'req-body')}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition"
                    title={t('copyPayload')}
                  >
                    {copiedField === 'req-body' ? (
                      <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Attempt Timeline */}
      <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <span>⏱️</span> {t('attemptTimeline')}
          {attempts.length > 0 && (
            <span className="text-xs font-normal text-gray-400 dark:text-slate-500 ml-2">
              ({attempts.length} {tCommon('attempts').toLowerCase()})
            </span>
          )}
        </h3>

        {attempts.length === 0 ? (
          <div className="text-center py-8 text-gray-400 dark:text-slate-500">
            <p className="text-sm">{t('noAttemptData')}</p>
            <p className="text-xs mt-1">{t('noAttemptDataDesc')}</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-slate-700" />

            <div className="space-y-6">
              {attempts.sort((a, b) => a.attempt_number - b.attempt_number).map((attempt) => (
                <div key={attempt.id} className="relative pl-12">
                  {/* Timeline dot */}
                  <div className={`absolute left-3.5 top-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${getAttemptStatusColor(attempt.status)} z-10`} />

                  <div
                    className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden cursor-pointer hover:border-gray-300 dark:hover:border-slate-700 transition"
                    onClick={() => setExpandedAttempt(expandedAttempt === attempt.id ? null : attempt.id)}
                  >
                    {/* Attempt header */}
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getAttemptStatusIcon(attempt.status)}</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {t('attemptN', { n: attempt.attempt_number })}
                          </span>
                        </div>
                        <StatusBadge status={attempt.status} size="sm" />
                        {attempt.response_status && (
                          <span className={`text-sm font-mono font-medium ${getHttpStatusColor(attempt.response_status)}`}>
                            HTTP {attempt.response_status}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        {attempt.duration_ms !== undefined && (
                          <span className="text-xs text-gray-500 dark:text-slate-400 font-mono">
                            {attempt.duration_ms}ms
                          </span>
                        )}
                        <span className="text-xs text-gray-400 dark:text-slate-500">
                          {new Date(attempt.created_at).toLocaleString()}
                        </span>
                        <svg
                          className={`w-4 h-4 text-gray-400 dark:text-slate-500 transition-transform ${expandedAttempt === attempt.id ? 'rotate-180' : ''}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {expandedAttempt === attempt.id && (
                      <div className="border-t border-gray-200 dark:border-slate-700 p-4 space-y-4">
                        {/* Error message */}
                        {attempt.error_message && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">{t('errorMessage')}</p>
                            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 p-3 rounded-lg font-mono break-all">
                              {attempt.error_message}
                            </p>
                          </div>
                        )}

                        {/* Response Headers */}
                        {attempt.response_headers && Object.keys(attempt.response_headers).length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">
                              {t('responseHeaders')}
                              <span className="ml-1 text-gray-400 dark:text-slate-500">
                                ({Object.keys(attempt.response_headers).length})
                              </span>
                            </p>
                            <pre className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-3 text-xs font-mono text-gray-700 dark:text-slate-300 overflow-x-auto max-h-48 overflow-y-auto">
                              {formatHeaders(attempt.response_headers)}
                            </pre>
                          </div>
                        )}

                        {/* Response Body */}
                        {attempt.response_body && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">{t('responseBody')}</p>
                            <div className="relative">
                              <pre className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-3 text-xs font-mono text-gray-700 dark:text-slate-300 overflow-x-auto max-h-64 overflow-y-auto">
                                {(() => {
                                  try { return JSON.stringify(JSON.parse(attempt.response_body), null, 2); }
                                  catch { return attempt.response_body; }
                                })()}
                              </pre>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(attempt.response_body!, `resp-${attempt.id}`);
                                }}
                                className="absolute top-2 right-2 p-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition"
                                title={t('copyResponseBody')}
                              >
                                {copiedField === `resp-${attempt.id}` ? (
                                  <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* No additional data */}
                        {!attempt.error_message && !attempt.response_headers && !attempt.response_body && (
                          <p className="text-xs text-gray-400 dark:text-slate-500 italic">
                            {t('noDebugData')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Replay Confirmation */}
      <ConfirmDialog
        open={showReplayConfirm}
        title={t('replayTitle')}
        message={t('replayMessage')}
        confirmLabel={t('replayConfirm')}
        onConfirm={handleReplay}
        onCancel={() => setShowReplayConfirm(false)}
        loading={replaying}
      />
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
  copyable,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  mono?: boolean;
  copyable?: boolean;
  onCopy?: () => void;
  copied?: boolean;
}) {
  const t = useTranslations('deliveryDetail');
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-gray-500 dark:text-slate-400 flex-shrink-0">{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        <span className={`text-sm text-gray-900 dark:text-white truncate ${mono ? 'font-mono text-xs' : ''}`}>
          {value}
        </span>
        {copyable && onCopy && (
          <button
            onClick={onCopy}
            className="flex-shrink-0 p-1 rounded text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition"
            title={t('copyTitle')}
          >
            {copied ? (
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
