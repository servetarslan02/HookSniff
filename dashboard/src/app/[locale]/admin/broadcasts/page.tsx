'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/store';
import { adminApi, type Broadcast } from '@/lib/api';
import { useAdminBroadcasts } from '@/hooks/useAdminData';
import { useTranslations } from 'next-intl';
import { useToast } from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import {
  Megaphone,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  Info,
  AlertCircle,
  Wrench,
  Sparkles,
  Radio,
  XCircle,
  Eye,
  EyeOff,
  Calendar,
} from '@/components/icons';

const BROADCAST_TYPES = [
  { value: 'announcement', label: 'Announcement', icon: <Radio size={14} strokeWidth={1.75} /> },
  { value: 'maintenance', label: 'Maintenance', icon: <Wrench size={14} strokeWidth={1.75} /> },
  { value: 'feature', label: 'Feature', icon: <Sparkles size={14} strokeWidth={1.75} /> },
  { value: 'incident', label: 'Incident', icon: <XCircle size={14} strokeWidth={1.75} /> },
];

const SEVERITY_OPTIONS = [
  { value: 'info', label: 'Info', color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400', icon: <Info size={14} strokeWidth={1.75} /> },
  { value: 'warning', label: 'Warning', color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400', icon: <AlertTriangle size={14} strokeWidth={1.75} /> },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400', icon: <AlertCircle size={14} strokeWidth={1.75} /> },
];

const PLAN_OPTIONS = [
  { value: '', label: 'All Plans' },
  { value: 'free', label: 'Free' },
  { value: 'startup', label: 'Startup' },
  { value: 'pro', label: 'Pro' },
  { value: 'enterprise', label: 'Enterprise' },
];

interface BroadcastFormData {
  title: string;
  message: string;
  broadcast_type: string;
  severity: string;
  link: string;
  link_text: string;
  target_plan: string;
  starts_at: string;
  expires_at: string;
}

const emptyForm: BroadcastFormData = {
  title: '',
  message: '',
  broadcast_type: 'announcement',
  severity: 'info',
  link: '',
  link_text: '',
  target_plan: '',
  starts_at: '',
  expires_at: '',
};

export default function AdminBroadcastsPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const t = useTranslations('admin');
  const qc = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BroadcastFormData>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [filterActive, setFilterActive] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // React Query — cached, no loading on revisit
  const { data: broadcastsData, isLoading: loading } = useAdminBroadcasts({
    is_active: filterActive !== 'all' ? (filterActive === 'active' ? 'true' : 'false') : undefined,
    broadcast_type: filterType !== 'all' ? filterType : undefined,
  });
  const broadcasts: Broadcast[] = broadcastsData?.broadcasts || [];

  // React Query mutations
  const saveMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      if (editingId) {
        await adminApi.updateBroadcast(token!, editingId, payload);
        return 'updated';
      } else {
        await adminApi.createBroadcast(token!, payload);
        return 'created';
      }
    },
    onSuccess: (action) => {
      qc.invalidateQueries({ queryKey: ['admin', 'broadcasts'] });
      toast(`Broadcast ${action}`, 'success');
      resetForm();
    },
    onError: () => toast('Failed to save broadcast', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteBroadcast(token!, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'broadcasts'] });
      toast('Broadcast deleted', 'success');
      setDeleteTarget(null);
    },
    onError: () => toast('Failed to delete broadcast', 'error'),
  });

  const toggleMutation = useMutation({
    mutationFn: (b: Broadcast) => adminApi.updateBroadcast(token!, b.id, { is_active: !b.is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'broadcasts'] }),
    onError: () => toast('Failed to update broadcast', 'error'),
  });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (b: Broadcast) => {
    setForm({
      title: b.title,
      message: b.message,
      broadcast_type: b.broadcast_type,
      severity: b.severity,
      link: b.link || '',
      link_text: b.link_text || '',
      target_plan: b.target_plan || '',
      starts_at: b.starts_at ? new Date(b.starts_at).toISOString().slice(0, 16) : '',
      expires_at: b.expires_at ? new Date(b.expires_at).toISOString().slice(0, 16) : '',
    });
    setEditingId(b.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!token || !form.title.trim() || !form.message.trim()) return;
    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      message: form.message.trim(),
      broadcast_type: form.broadcast_type,
      severity: form.severity,
    };
    if (form.link.trim()) payload.link = form.link.trim();
    if (form.link_text.trim()) payload.link_text = form.link_text.trim();
    if (form.target_plan) payload.target_plan = form.target_plan;
    if (form.starts_at) payload.starts_at = new Date(form.starts_at).toISOString();
    if (form.expires_at) payload.expires_at = new Date(form.expires_at).toISOString();
    saveMutation.mutate(payload);
  };

  const handleDelete = () => {
    if (!token || !deleteTarget) return;
    deleteMutation.mutate(deleteTarget);
  };

  const handleToggleActive = (b: Broadcast) => {
    if (!token) return;
    toggleMutation.mutate(b);
  };

  const severityBadge = (severity: string) => {
    const opt = SEVERITY_OPTIONS.find(s => s.value === severity);
    if (!opt) return null;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${opt.color}`}>
        {opt.icon}
        {opt.label}
      </span>
    );
  };

  const typeBadge = (type: string) => {
    const opt = BROADCAST_TYPES.find(t => t.value === type);
    if (!opt) return type;
    return (
      <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
        {opt.icon}
        {opt.label}
      </span>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            <Megaphone size={24} strokeWidth={1.75} className="inline mr-2" />
            {t('broadcasts') || 'Broadcasts'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            {t('broadcastsDesc') || 'Send global announcements to all users. Shows in notification bell and dashboard banner.'}
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Plus size={16} strokeWidth={1.75} />
          {t('newBroadcast') || 'New Broadcast'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
        >
          <option value="all">All Types</option>
          {BROADCAST_TYPES.map(bt => (
            <option key={bt.value} value={bt.value}>{bt.label}</option>
          ))}
        </select>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="glass-card p-6 border-2 border-brand-200 dark:border-brand-500/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingId ? (t('editBroadcast') || 'Edit Broadcast') : (t('createBroadcast') || 'Create Broadcast')}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
              <XCircle size={20} strokeWidth={1.75} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Scheduled Maintenance Notice"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Message *</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Describe the announcement to your users..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* Type + Severity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Type</label>
                <select
                  value={form.broadcast_type}
                  onChange={(e) => setForm({ ...form, broadcast_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
                >
                  {BROADCAST_TYPES.map(bt => (
                    <option key={bt.value} value={bt.value}>{bt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Severity</label>
                <select
                  value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
                >
                  {SEVERITY_OPTIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Link + Link Text */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Link (optional)</label>
                <input
                  type="url"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="https://status.hooksniff.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Link Text</label>
                <input
                  type="text"
                  value={form.link_text}
                  onChange={(e) => setForm({ ...form, link_text: e.target.value })}
                  placeholder="View Status"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>

            {/* Target Plan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Target Plan</label>
              <select
                value={form.target_plan}
                onChange={(e) => setForm({ ...form, target_plan: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
              >
                {PLAN_OPTIONS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* Schedule */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  <Calendar size={14} strokeWidth={1.75} className="inline mr-1" />
                  Starts At (optional)
                </label>
                <input
                  type="datetime-local"
                  value={form.starts_at}
                  onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  <Calendar size={14} strokeWidth={1.75} className="inline mr-1" />
                  Expires At (optional)
                </label>
                <input
                  type="datetime-local"
                  value={form.expires_at}
                  onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saveMutation.isPending || !form.title.trim() || !form.message.trim()}
                className="px-6 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
              >
                {saveMutation.isPending ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : broadcasts.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Megaphone size={48} strokeWidth={1.25} className="text-gray-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-slate-400 text-sm">No broadcasts yet</p>
          <p className="text-gray-400 dark:text-slate-500 text-xs mt-1">Create your first broadcast announcement above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {broadcasts.map((b) => (
            <div
              key={b.id}
              className={`glass-card p-4 transition-all ${
                !b.is_active ? 'opacity-60' : ''
              } ${
                b.severity === 'critical' ? 'border-l-4 border-red-500' :
                b.severity === 'warning' ? 'border-l-4 border-amber-500' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{b.title}</h3>
                    {severityBadge(b.severity)}
                    {typeBadge(b.broadcast_type)}
                    {!b.is_active && (
                      <span className="text-xs text-gray-400 dark:text-slate-500">(inactive)</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-slate-400 line-clamp-2">{b.message}</p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400 dark:text-slate-500">
                    {b.target_plan && <span>Plan: {b.target_plan}</span>}
                    {b.link && <span>Link: {b.link_text || b.link}</span>}
                    <span>{new Date(b.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleToggleActive(b)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                    title={b.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {b.is_active ? <Eye size={16} strokeWidth={1.75} /> : <EyeOff size={16} strokeWidth={1.75} />}
                  </button>
                  <button
                    onClick={() => handleEdit(b)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                    title="Edit"
                  >
                    <Pencil size={16} strokeWidth={1.75} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(b.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                    title="Delete"
                  >
                    <Trash2 size={16} strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Broadcast"
        message="Are you sure you want to delete this broadcast? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
