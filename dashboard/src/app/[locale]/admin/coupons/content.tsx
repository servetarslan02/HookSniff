'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { apiFetch } from '@/lib/api';
import { Plus, Trash2, RefreshCw, Check, X, ClipboardList } from '@/components/icons';

interface Coupon {
  id: string;
  code: string;
  type: string;
  discount_type: string;
  discount_value: number;
  target_plan: string | null;
  polar_discount_id: string | null;
  max_redemptions: number | null;
  redemption_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export default function CouponsContent() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);

  // Create form state
  const [form, setForm] = useState({
    code: '',
    type: 'internal',
    discount_type: 'percentage',
    discount_value: 100,
    target_plan: '',
    max_redemptions: '',
    expires_at: '',
  });

  const fetchCoupons = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiFetch<Coupon[]>('/admin/coupons', { token });
      setCoupons(data);
    } catch {
      toast('Failed to load coupons', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const handleCreate = async () => {
    if (!token || !form.code.trim()) return;
    setCreating(true);
    try {
      await apiFetch('/admin/coupons', {
        method: 'POST',
        token,
        body: {
          code: form.code.toUpperCase(),
          type: form.type,
          discount_type: form.discount_type,
          discount_value: form.discount_value,
          target_plan: form.target_plan || null,
          max_redemptions: form.max_redemptions ? parseInt(form.max_redemptions) : null,
          expires_at: form.expires_at || null,
        },
      });
      toast('Coupon created', 'success');
      setShowCreate(false);
      setForm({ code: '', type: 'internal', discount_type: 'percentage', discount_value: 100, target_plan: '', max_redemptions: '', expires_at: '' });
      fetchCoupons();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create coupon';
      toast(msg, 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleSync = async (id: string) => {
    if (!token) return;
    setSyncing(id);
    try {
      await apiFetch(`/admin/coupons/${id}/sync`, { method: 'POST', token });
      toast('Synced to Polar.sh', 'success');
      fetchCoupons();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sync failed';
      toast(msg, 'error');
    } finally {
      setSyncing(null);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    if (!token) return;
    try {
      await apiFetch(`/admin/coupons/${id}`, { method: 'PUT', token, body: { is_active: !isActive } });
      fetchCoupons();
    } catch {
      toast('Failed to update coupon', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Delete this coupon?')) return;
    try {
      await apiFetch(`/admin/coupons/${id}`, { method: 'DELETE', token });
      toast('Coupon deleted', 'success');
      fetchCoupons();
    } catch {
      toast('Failed to delete coupon', 'error');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast('Code copied', 'success');
  };

  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-gray-200 dark:bg-slate-700 rounded" /><div className="h-64 bg-gray-200 dark:bg-slate-700 rounded-xl" /></div>;
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kupon Kodları</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">İndirim kodlarını oluştur ve yönet</p>
        </div>
        <button type="button" onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-brand-600 text-white hover:bg-brand-700 transition">
          <Plus size={16} strokeWidth={1.75} /> Yeni Kupon
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Yeni Kupon Oluştur</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Code */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Kupon Kodu</label>
              <input type="text" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="INDIRIM50" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm font-mono" />
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Tip</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm">
                <option value="internal">Internal (Direkt uygulanır)</option>
                <option value="polar">Polar.sh (Sync)</option>
              </select>
            </div>

            {/* Discount Type */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">İndirim Tipi</label>
              <select value={form.discount_type} onChange={e => setForm({ ...form, discount_type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm">
                <option value="percentage">Yüzde (%)</option>
                <option value="free_month">Ücretsiz Ay</option>
              </select>
            </div>

            {/* Discount Value */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">{form.discount_type === 'percentage' ? 'Yüzde (%)' : 'Ücretsiz Ay Sayısı'}</label>
              <input type="number" value={form.discount_value} onChange={e => setForm({ ...form, discount_value: parseInt(e.target.value) || 0 })} min={0} max={form.discount_type === 'percentage' ? 100 : 12} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm" />
            </div>

            {/* Target Plan */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Hedef Plan (boş = tümü)</label>
              <select value={form.target_plan} onChange={e => setForm({ ...form, target_plan: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm">
                <option value="">Tüm planlar</option>
                <option value="startup">Startup</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            {/* Max Redemptions */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Max Kullanım (boş = sınırsız)</label>
              <input type="number" value={form.max_redemptions} onChange={e => setForm({ ...form, max_redemptions: e.target.value })} min={1} placeholder="Sınırsız" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm" />
            </div>

            {/* Expires At */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Son Kullanma Tarihi (boş = süresiz)</label>
              <input type="date" value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm" />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition">İptal</button>
            <button type="button" onClick={handleCreate} disabled={creating || !form.code.trim()} className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition disabled:opacity-50">
              {creating ? 'Oluşturuluyor...' : 'Oluştur'}
            </button>
          </div>
        </div>
      )}

      {/* Info boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-400">🔵 Internal Kod</p>
          <p className="text-xs text-blue-600 dark:text-blue-400/70 mt-1">Müşteri kodu girdiğinde plan direkt uygulanır. Polar&apos;a gitmez.</p>
        </div>
        <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20">
          <p className="text-sm font-medium text-purple-700 dark:text-purple-400">🟣 Polar Kod</p>
          <p className="text-xs text-purple-600 dark:text-purple-400/70 mt-1">Polar.sh ile sync edilir. Ödeme sayfasında indirim uygulanır.</p>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700/50">
          <span className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{coupons.length} kupon</span>
        </div>
        {coupons.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-gray-500 dark:text-slate-400">Henüz kupon yok</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Kod</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Tip</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">İndirim</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Kullanım</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Durum</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
                {coupons.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">{c.code}</span>
                        <button type="button" onClick={() => copyCode(c.code)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"><ClipboardList size={14} /></button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${c.type === 'polar' ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'}`}>
                        {c.type === 'polar' ? '🟣 Polar' : '🔵 Internal'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                      {c.discount_type === 'percentage' ? `%${c.discount_value}` : `${c.discount_value} ay ücretsiz`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                      {c.target_plan || 'Tümü'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                      {c.redemption_count}{c.max_redemptions ? `/${c.max_redemptions}` : ''}
                    </td>
                    <td className="px-6 py-4">
                      <button type="button" onClick={() => handleToggle(c.id, c.is_active)} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${c.is_active ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-gray-50 dark:bg-gray-500/10 text-gray-500 dark:text-gray-400'}`}>
                        {c.is_active ? <><Check size={12} /> Aktif</> : <><X size={12} /> Pasif</>}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {c.type === 'polar' && !c.polar_discount_id && (
                          <button type="button" onClick={() => handleSync(c.id)} disabled={syncing === c.id} className="text-xs text-purple-600 dark:text-purple-400 hover:underline disabled:opacity-50">
                            <RefreshCw size={14} className={syncing === c.id ? 'animate-spin' : ''} />
                          </button>
                        )}
                        {c.type === 'polar' && c.polar_discount_id && (
                          <span className="text-xs text-green-600 dark:text-green-400">✓ Synced</span>
                        )}
                        <button type="button" onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
