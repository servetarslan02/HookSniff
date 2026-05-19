'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/store';
import { adminApi } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { useToast } from '@/components/Toast';
import { Mail, Send, AlertTriangle, CheckCircle2, ClipboardList, XCircle } from 'lucide-react';



export default function AdminEmailPage() {
  const { token } = useAuth();
  const t = useTranslations('admin');
  
  const PLAN_OPTIONS = [
    { value: '', label: t('emailAllPaid') },
    { value: 'startup', label: 'Startup' },
    { value: 'pro', label: 'Pro' },
    { value: 'enterprise', label: 'Enterprise' },
    { value: 'free', label: 'Free (include free)' },
  ];

  const STATUS_OPTIONS = [
    { value: '', label: t('emailAllUsers') },
    { value: 'verified', label: t('emailVerifiedOnly') },
    { value: 'unverified', label: t('emailUnverifiedOnly') },
  ];
  const { toast } = useToast();

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sending, setSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [result, setResult] = useState<{ total_sent: number; total_failed: number; message: string } | null>(null);
  const [history, setHistory] = useState<Array<{ subject: string; sent: number; failed: number; date: string; plan: string }>>([]);

  const executeSend = useCallback(async () => {
    if (!token || !subject.trim() || !body.trim()) return;
    setSending(true);
    setResult(null);
    setShowConfirm(false);
    try {
      const res = await adminApi.sendBulkEmail(token, {
        subject: subject.trim(),
        body: body.trim(),
        ...(planFilter ? { plan_filter: planFilter } : {}),
        ...(statusFilter ? { status_filter: statusFilter } : {}),
      });
      setResult(res);
      setHistory((prev) => [{
        subject: subject.trim(),
        sent: res.total_sent,
        failed: res.total_failed,
        date: new Date().toLocaleString(),
        plan: planFilter || 'all paid',
      }, ...prev].slice(0, 10));
      toast(res.message, 'success');
    } catch {
      toast(t('bulkEmailFailed'), 'error');
    } finally {
      setSending(false);
    }
  }, [token, subject, body, planFilter, statusFilter, t, toast]);

  const handleSendClick = useCallback(() => {
    if (!subject.trim() || !body.trim()) return;
    setShowConfirm(true);
  }, [subject, body]);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white"><Mail size={24} strokeWidth={1.75} className="inline mr-1" />{t('bulkEmail') || 'Bulk Email'}</h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
          {t('bulkEmailDesc') || 'Send email to multiple users at once. Free/developer users are excluded by default.'}
        </p>
      </div>

      {/* Compose */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4"><Send size={18} strokeWidth={1.75} className="inline mr-1" />{t('compose') || 'Compose'}</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('planFilter') || 'Plan Filter'}</label>
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
              >
                {PLAN_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('statusFilter') || 'Email Status'}</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('subject') || 'Subject'} *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t('bulkSubjectPlaceholder') || 'e.g. New feature announcement'}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
              {t('body') || 'Body'} * <span className="text-xs text-gray-400 font-normal">{'{name}'} {'{email}'} {t('bulkEmailPlaceholders') || 'placeholders supported'}</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t('bulkBodyPlaceholder') || 'Hello {name},\n\nWe wanted to share some exciting news...'}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400 dark:text-slate-500">
              {t('bulkEmailNote') || 'Emails are sent in batches of 50. Max 5000 recipients per send.'}
            </p>
            <button
              onClick={handleSendClick}
              disabled={sending || !subject.trim() || !body.trim()}
              className="px-6 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
            >
              {sending ? (t('sending') || 'Sending...') : <><Mail size={14} strokeWidth={1.75} className="inline mr-1" />{t('sendBulkEmail') || 'Send Bulk Email'}</>}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              <AlertTriangle size={18} strokeWidth={1.75} className="inline mr-1 text-amber-500" />{t('bulkEmailConfirmTitle') || 'Confirm Bulk Email'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-slate-300 mb-1">
              {t('bulkEmailConfirmDesc') || 'You are about to send an email to all matching users. This action cannot be undone.'}
            </p>
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{subject}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                {planFilter ? `${t('planFilter')}: ${planFilter}` : t('emailAllPaid') || 'All Paid Plans'}
                {' · '}
                {statusFilter ? `${t('statusFilter')}: ${statusFilter}` : t('emailAllUsers') || 'All Users'}
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl transition-colors"
              >
                {t('bulkEmailConfirmCancel') || 'Cancel'}
              </button>
              <button
                onClick={executeSend}
                disabled={sending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl transition-colors"
              >
                {sending ? (t('sending') || 'Sending...') : (t('bulkEmailConfirmSend') || 'Yes, Send')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="glass-card p-6 border-2 border-emerald-200 dark:border-emerald-500/30">
          <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-2"><CheckCircle2 size={16} strokeWidth={1.75} className="inline mr-1" />{t('sendComplete') || 'Send Complete'}</h3>
          <p className="text-sm text-gray-700 dark:text-slate-300">{result.message}</p>
          <div className="flex gap-6 mt-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{result.total_sent}</div>
              <div className="text-xs text-gray-500 dark:text-slate-400">{t('sent') || 'Sent'}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{result.total_failed}</div>
              <div className="text-xs text-gray-500 dark:text-slate-400">{t('failed') || 'Failed'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Send History (session only) */}
      {history.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-4"><ClipboardList size={16} strokeWidth={1.75} className="inline mr-1" />{t('sendHistory') || 'Send History (this session)'}</h3>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{h.subject}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{h.date} · {h.plan}</p>
                </div>
                <div className="flex gap-3 shrink-0 text-xs">
                  <span className="text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={12} strokeWidth={1.75} className="inline mr-0.5" />{h.sent}</span>
                  {h.failed > 0 && <span className="text-red-600 dark:text-red-400"><XCircle size={12} strokeWidth={1.75} className="inline mr-0.5" />{h.failed}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
