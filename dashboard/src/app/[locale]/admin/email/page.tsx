'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/store';
import { adminApi, type Broadcast } from '@/lib/api';
import { useAdminBroadcasts } from '@/hooks/useAdminData';
import { useTranslations } from 'next-intl';
import { useToast } from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import {
  Mail, Send, AlertTriangle, CheckCircle2, ClipboardList, XCircle,
  Megaphone, Plus, Pencil, Trash2, Eye, EyeOff, Calendar,
} from '@/components/icons';

const BROADCAST_TYPES = [
  { value: 'announcement', label: 'Duyuru' },
  { value: 'maintenance', label: 'Bakım' },
  { value: 'feature', label: 'Yeni Özellik' },
  { value: 'incident', label: 'Olay' },
];

const SEVERITY_OPTIONS = [
  { value: 'info', label: 'Bilgi', color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' },
  { value: 'warning', label: 'Uyarı', color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' },
  { value: 'critical', label: 'Kritik', color: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' },
];

const PLAN_TARGET_OPTIONS = [
  { value: '', label: 'Tüm Planlar' },
  { value: 'free', label: 'Free' },
  { value: 'startup', label: 'Startup' },
  { value: 'pro', label: 'Pro' },
  { value: 'enterprise', label: 'Enterprise' },
];

interface BroadcastForm {
  title: string; message: string; broadcast_type: string; severity: string;
  link: string; link_text: string; target_plan: string; starts_at: string; expires_at: string;
}

const emptyBroadcastForm: BroadcastForm = {
  title: '', message: '', broadcast_type: 'announcement', severity: 'info',
  link: '', link_text: '', target_plan: '', starts_at: '', expires_at: '',
};

export default function AdminEmailPage() {
  const { token } = useAuth();
  const t = useTranslations('admin');
  const { toast } = useToast();

  const [mode, setMode] = useState<'email' | 'broadcast'>('email');

  // ── Email state ──
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

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sending, setSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [result, setResult] = useState<{ total_sent: number; total_failed: number; message: string } | null>(null);
  const [history, setHistory] = useState<Array<{ subject: string; sent: number; failed: number; date: string; plan: string }>>([]);

  // ── Broadcast state (React Query) ──
  const qc = useQueryClient();
  const { data: broadcastsData, isLoading: broadcastLoading } = useAdminBroadcasts();
  const broadcasts: Broadcast[] = broadcastsData?.broadcasts || [];
  const [bForm, setBForm] = useState<BroadcastForm>(emptyBroadcastForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showBForm, setShowBForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // ── Email handlers ──
  const executeSend = useCallback(async () => {
    if (!token || !subject.trim() || !body.trim()) return;
    setSending(true); setResult(null); setShowConfirm(false);
    try {
      const res = await adminApi.sendBulkEmail(token, {
        subject: subject.trim(), body: body.trim(),
        ...(planFilter ? { plan_filter: planFilter } : {}),
        ...(statusFilter ? { status_filter: statusFilter } : {}),
      });
      setResult(res);
      setHistory((prev) => [{ subject: subject.trim(), sent: res.total_sent, failed: res.total_failed, date: new Date().toLocaleString(), plan: planFilter || 'all paid' }, ...prev].slice(0, 10));
      toast(res.message, 'success');
    } catch { toast(t('bulkEmailFailed'), 'error'); }
    finally { setSending(false); }
  }, [token, subject, body, planFilter, statusFilter, t, toast]);

  const handleSendClick = useCallback(() => {
    if (!subject.trim() || !body.trim()) return;
    setShowConfirm(true);
  }, [subject, body]);

  // ── Broadcast mutations ──
  const saveBroadcastMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      if (editingId) { await adminApi.updateBroadcast(token!, editingId, payload); return 'updated'; }
      else { await adminApi.createBroadcast(token!, payload); return 'created'; }
    },
    onSuccess: (action) => { qc.invalidateQueries({ queryKey: ['admin', 'broadcasts'] }); toast(`Bildirim ${action === 'created' ? 'oluşturuldu' : 'güncellendi'}`, 'success'); resetBForm(); },
    onError: () => toast('Bildirim kaydedilemedi', 'error'),
  });

  const deleteBroadcastMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteBroadcast(token!, id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'broadcasts'] }); toast('Bildirim silindi', 'success'); setDeleteTarget(null); },
    onError: () => toast('Bildirim silinemedi', 'error'),
  });

  const toggleBroadcastMutation = useMutation({
    mutationFn: (b: Broadcast) => adminApi.updateBroadcast(token!, b.id, { is_active: !b.is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'broadcasts'] }),
    onError: () => toast('Bildirim güncellenemedi', 'error'),
  });

  const resetBForm = () => { setBForm(emptyBroadcastForm); setEditingId(null); setShowBForm(false); };

  const handleEditBroadcast = (b: Broadcast) => {
    setBForm({
      title: b.title, message: b.message, broadcast_type: b.broadcast_type, severity: b.severity,
      link: b.link || '', link_text: b.link_text || '', target_plan: b.target_plan || '',
      starts_at: b.starts_at ? new Date(b.starts_at).toISOString().slice(0, 16) : '',
      expires_at: b.expires_at ? new Date(b.expires_at).toISOString().slice(0, 16) : '',
    });
    setEditingId(b.id); setShowBForm(true);
  };

  const handleSaveBroadcast = () => {
    if (!token || !bForm.title.trim() || !bForm.message.trim()) return;
    const payload: Record<string, unknown> = {
      title: bForm.title.trim(), message: bForm.message.trim(),
      broadcast_type: bForm.broadcast_type, severity: bForm.severity,
    };
    if (bForm.link.trim()) payload.link = bForm.link.trim();
    if (bForm.link_text.trim()) payload.link_text = bForm.link_text.trim();
    if (bForm.target_plan) payload.target_plan = bForm.target_plan;
    if (bForm.starts_at) payload.starts_at = new Date(bForm.starts_at).toISOString();
    if (bForm.expires_at) payload.expires_at = new Date(bForm.expires_at).toISOString();
    saveBroadcastMutation.mutate(payload);
  };

  const handleDeleteBroadcast = () => {
    if (!token || !deleteTarget) return;
    deleteBroadcastMutation.mutate(deleteTarget);
  };

  const handleToggleBroadcast = (b: Broadcast) => {
    if (!token) return;
    toggleBroadcastMutation.mutate(b);
  };

  const severityBadge = (severity: string) => {
    const opt = SEVERITY_OPTIONS.find(s => s.value === severity);
    if (!opt) return null;
    return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${opt.color}`}>{opt.label}</span>;
  };

  const typeLabel = (type: string) => BROADCAST_TYPES.find(t => t.value === type)?.label || type;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-3xl">
      {/* ── Header + Mode Toggle ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {mode === 'email' ? <><Mail size={24} strokeWidth={1.75} className="inline mr-1" />{t('bulkEmail') || 'Toplu E-posta'}</> : <><Megaphone size={24} strokeWidth={1.75} className="inline mr-1" />{t('broadcasts') || 'Bildirim'}</>}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            {mode === 'email' ? (t('bulkEmailDesc') || 'Kullanıcılara toplu e-posta gönder.') : (t('broadcastsDesc') || 'Tüm kullanıcılara global bildirim gönder. Çan ikonunda ve banner olarak gösterilir.')}
          </p>
        </div>
        <div className="flex bg-gray-100 dark:bg-slate-800 rounded-xl p-1 shrink-0 w-fit">
          <button onClick={() => setMode('email')} className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${mode === 'email' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'}`}>
            <Mail size={14} strokeWidth={1.75} className="inline mr-1.5" />E-posta
          </button>
          <button onClick={() => setMode('broadcast')} className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${mode === 'broadcast' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'}`}>
            <Megaphone size={14} strokeWidth={1.75} className="inline mr-1.5" />Bildirim
          </button>
        </div>
      </div>

      {/* ═══ EMAIL MODE ═══ */}
      {mode === 'email' && (
        <>
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4"><Send size={18} strokeWidth={1.75} className="inline mr-1" />{t('compose') || 'Compose'}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('planFilter') || 'Plan Filter'}</label>
                  <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm">
                    {PLAN_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('statusFilter') || 'Email Status'}</label>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm">
                    {STATUS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('subject') || 'Subject'} *</label>
                <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={t('bulkSubjectPlaceholder') || 'e.g. New feature announcement'} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('body') || 'Body'} * <span className="text-xs text-gray-400 font-normal">{'{name}'} {'{email}'} {t('bulkEmailPlaceholders') || 'placeholders supported'}</span></label>
                <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder={t('bulkBodyPlaceholder') || 'Hello {name},\n\nWe wanted to share some exciting news...'} rows={8} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white" />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400 dark:text-slate-500">{t('bulkEmailNote') || 'Emails are sent in batches of 50. Max 5000 recipients per send.'}</p>
                <button onClick={handleSendClick} disabled={sending || !subject.trim() || !body.trim()} className="px-6 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors">
                  {sending ? (t('sending') || 'Sending...') : <><Mail size={14} strokeWidth={1.75} className="inline mr-1" />{t('sendBulkEmail') || 'Send Bulk Email'}</>}
                </button>
              </div>
            </div>
          </div>

          {showConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2"><AlertTriangle size={18} strokeWidth={1.75} className="inline mr-1 text-amber-500" />{t('bulkEmailConfirmTitle') || 'Confirm Bulk Email'}</h3>
                <p className="text-sm text-gray-600 dark:text-slate-300 mb-1">{t('bulkEmailConfirmDesc') || 'You are about to send an email to all matching users. This action cannot be undone.'}</p>
                <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3 mb-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{subject}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{planFilter ? `${t('planFilter')}: ${planFilter}` : t('emailAllPaid') || 'All Paid Plans'}{' · '}{statusFilter ? `${t('statusFilter')}: ${statusFilter}` : t('emailAllUsers') || 'All Users'}</p>
                </div>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setShowConfirm(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl transition-colors">{t('bulkEmailConfirmCancel') || 'Cancel'}</button>
                  <button onClick={executeSend} disabled={sending} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl transition-colors">{sending ? (t('sending') || 'Sending...') : (t('bulkEmailConfirmSend') || 'Yes, Send')}</button>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="glass-card p-6 border-2 border-emerald-200 dark:border-emerald-500/30">
              <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-2"><CheckCircle2 size={16} strokeWidth={1.75} className="inline mr-1" />{t('sendComplete') || 'Send Complete'}</h3>
              <p className="text-sm text-gray-700 dark:text-slate-300">{result.message}</p>
              <div className="flex gap-6 mt-3">
                <div className="text-center"><div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{result.total_sent}</div><div className="text-xs text-gray-500 dark:text-slate-400">{t('sent') || 'Sent'}</div></div>
                <div className="text-center"><div className="text-2xl font-bold text-red-600 dark:text-red-400">{result.total_failed}</div><div className="text-xs text-gray-500 dark:text-slate-400">{t('failed') || 'Failed'}</div></div>
              </div>
            </div>
          )}

          {history.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-4"><ClipboardList size={16} strokeWidth={1.75} className="inline mr-1" />{t('sendHistory') || 'Send History (this session)'}</h3>
              <div className="space-y-2">
                {history.map((h, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="min-w-0"><p className="text-sm font-medium text-gray-900 dark:text-white truncate">{h.subject}</p><p className="text-xs text-gray-500 dark:text-slate-400">{h.date} · {h.plan}</p></div>
                    <div className="flex gap-3 shrink-0 text-xs"><span className="text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={12} strokeWidth={1.75} className="inline mr-0.5" />{h.sent}</span>{h.failed > 0 && <span className="text-red-600 dark:text-red-400"><XCircle size={12} strokeWidth={1.75} className="inline mr-0.5" />{h.failed}</span>}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══ BROADCAST MODE ═══ */}
      {mode === 'broadcast' && (
        <>
          {!showBForm && (
            <button onClick={() => { resetBForm(); setShowBForm(true); }} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center gap-1.5">
              <Plus size={16} strokeWidth={1.75} />Yeni Bildirim Oluştur
            </button>
          )}

          {showBForm && (
            <div className="glass-card p-6 border-2 border-brand-200 dark:border-brand-500/30">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editingId ? 'Bildirimi Düzenle' : 'Yeni Bildirim'}</h2>
                <button onClick={resetBForm} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"><XCircle size={20} strokeWidth={1.75} /></button>
              </div>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Başlık *</label><input type="text" value={bForm.title} onChange={(e) => setBForm({ ...bForm, title: e.target.value })} placeholder="Örn: Planlı Bakım Duyurusu" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Mesaj *</label><textarea value={bForm.message} onChange={(e) => setBForm({ ...bForm, message: e.target.value })} placeholder="Kullanıcılara gönderilecek mesajı yazın..." rows={4} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white" /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Tür</label><select value={bForm.broadcast_type} onChange={(e) => setBForm({ ...bForm, broadcast_type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm">{BROADCAST_TYPES.map(bt => <option key={bt.value} value={bt.value}>{bt.label}</option>)}</select></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Önem</label><select value={bForm.severity} onChange={(e) => setBForm({ ...bForm, severity: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm">{SEVERITY_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Link (opsiyonel)</label><input type="url" value={bForm.link} onChange={(e) => setBForm({ ...bForm, link: e.target.value })} placeholder="https://status.hooksniff.com" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Link Yazısı</label><input type="text" value={bForm.link_text} onChange={(e) => setBForm({ ...bForm, link_text: e.target.value })} placeholder="Durumu Gör" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm" /></div>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Hedef Plan</label><select value={bForm.target_plan} onChange={(e) => setBForm({ ...bForm, target_plan: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm">{PLAN_TARGET_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}</select></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5"><Calendar size={14} strokeWidth={1.75} className="inline mr-1" />Başlangıç (opsiyonel)</label><input type="datetime-local" value={bForm.starts_at} onChange={(e) => setBForm({ ...bForm, starts_at: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5"><Calendar size={14} strokeWidth={1.75} className="inline mr-1" />Bitiş (opsiyonel)</label><input type="datetime-local" value={bForm.expires_at} onChange={(e) => setBForm({ ...bForm, expires_at: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm" /></div>
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button onClick={resetBForm} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl transition-colors">İptal</button>
                  <button onClick={handleSaveBroadcast} disabled={saveBroadcastMutation.isPending || !bForm.title.trim() || !bForm.message.trim()} className="px-6 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors">{saveBroadcastMutation.isPending ? 'Kaydediliyor...' : editingId ? 'Güncelle' : 'Oluştur'}</button>
                </div>
              </div>
            </div>
          )}

          {broadcastLoading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="glass-card p-4 animate-pulse"><div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-2" /><div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-2/3" /></div>)}</div>
          ) : broadcasts.length === 0 ? (
            <div className="glass-card p-12 text-center"><Megaphone size={48} strokeWidth={1.25} className="text-gray-300 dark:text-slate-600 mx-auto mb-3" /><p className="text-gray-500 dark:text-slate-400 text-sm">Henüz bildirim yok</p><p className="text-gray-400 dark:text-slate-500 text-xs mt-1">Yukarıdan ilk bildiriminizi oluşturun</p></div>
          ) : (
            <div className="glass-card overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700"><h3 className="text-sm font-semibold text-gray-900 dark:text-white"><ClipboardList size={14} strokeWidth={1.75} className="inline mr-1.5" />Bildirim Geçmişi ({broadcasts.length})</h3></div>
              <div className="divide-y divide-gray-100 dark:divide-slate-800">
                {broadcasts.map((b) => (
                  <div key={b.id} className={`px-4 py-3 flex items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition ${!b.is_active ? 'opacity-50' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap"><span className="text-sm font-medium text-gray-900 dark:text-white truncate">{b.title}</span>{severityBadge(b.severity)}<span className="text-[11px] text-gray-400 dark:text-slate-500">{typeLabel(b.broadcast_type)}</span>{!b.is_active && <span className="text-[11px] text-gray-400">(pasif)</span>}</div>
                      <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5">{b.message}</p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400 dark:text-slate-500">{b.target_plan && <span>Plan: {b.target_plan}</span>}<span>{new Date(b.created_at).toLocaleDateString()}</span></div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handleToggleBroadcast(b)} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition" title={b.is_active ? 'Pasifleştir' : 'Aktifleştir'}>{b.is_active ? <Eye size={15} strokeWidth={1.75} /> : <EyeOff size={15} strokeWidth={1.75} />}</button>
                      <button onClick={() => handleEditBroadcast(b)} className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition" title="Düzenle"><Pencil size={15} strokeWidth={1.75} /></button>
                      <button onClick={() => setDeleteTarget(b.id)} className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition" title="Sil"><Trash2 size={15} strokeWidth={1.75} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmDialog open={!!deleteTarget} title="Bildirimi Sil" message="Bu bildirimi silmek istediğinize emin misiniz? Bu işlem geri alınamaz." confirmLabel="Sil" cancelLabel="İptal" variant="danger" onConfirm={handleDeleteBroadcast} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
