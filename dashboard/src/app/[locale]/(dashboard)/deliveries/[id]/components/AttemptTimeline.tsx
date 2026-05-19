'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { StatusBadge } from '@/components/StatusBadge';
import type { DeliveryAttempt } from '@/lib/api';
import { Check, X } from 'lucide-react';

function getHttpStatusColor(code?: number): string {
  if (!code) return 'text-gray-500 dark:text-slate-500';
  if (code < 300) return 'text-emerald-600 dark:text-emerald-400';
  if (code < 400) return 'text-blue-600 dark:text-blue-400';
  if (code < 500) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function formatHeaders(headers: Record<string, string>): string {
  return Object.entries(headers)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
}

export function AttemptTimeline({
  attempts,
  copiedField,
  onCopy,
}: {
  attempts: DeliveryAttempt[];
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
}) {
  const t = useTranslations('deliveryDetail');
  const tCommon = useTranslations('common');
  const [expandedAttempt, setExpandedAttempt] = useState<string | null>(null);

  const getAttemptStatusIcon = (status: string) => {
    if (status === 'delivered') return <Check size={16} strokeWidth={1.75} className="text-emerald-500" />;
    return <X size={16} strokeWidth={1.75} className="text-red-500" />;
  };

  const getAttemptStatusColor = (status: string) => {
    if (status === 'delivered') return 'bg-emerald-500';
    return 'bg-red-500';
  };

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <span>⏱️</span> {t('attemptTimeline')}
        {attempts.length > 0 && (
          <span className="text-xs font-normal text-gray-500 dark:text-slate-500 ml-2">
            ({attempts.length} {tCommon('attempts').toLowerCase()})
          </span>
        )}
      </h3>

      {attempts.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-slate-500">
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
                      <span className="text-xs text-gray-500 dark:text-slate-500">
                        {new Date(attempt.created_at).toLocaleString()}
                      </span>
                      <svg
                        className={`w-4 h-4 text-gray-500 dark:text-slate-500 transition-transform ${expandedAttempt === attempt.id ? 'rotate-180' : ''}`}
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
                            <span className="ml-1 text-gray-500 dark:text-slate-500">
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
                            <button type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onCopy(attempt.response_body!, `resp-${attempt.id}`);
                              }}
                              className="absolute top-2 right-2 p-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition"
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
                        <p className="text-xs text-gray-500 dark:text-slate-500 italic">
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
  );
}
