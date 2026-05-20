'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { apiFetch } from '@/lib/api';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useTranslations } from 'next-intl';
import { Plus, Trash2, RefreshCw, Check, X, ClipboardList, Search, Pencil, Clock } from '@/components/icons';

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

const INITIAL_FORM = {
  code: '',
  type: 'internal',
  discount_type: 'percentage',
  discount_value: 100,
  target_plan: '',
  max_redemptions: '',
  expires_at: '',
};

export default function CouponsContent() {
  const { token } = useAuth();
  const { toast } = useToast();
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<Coupon | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Create / Edit form state
  const [form, setForm] = useState(INITIAL_FORM);

  const fetchCoupons = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiFetch<Coupon[]>('/admin/coupons', { token });
      setCoupons(data);
    } catch {
      toast(t('couponsLoadFailed') || 'Kuponlar yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, toast, t]);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  // ── Create ──
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
      toast(t('couponCreated') || 'Kupon oluşturuldu', 'success');
      setShowCreate(false);
      setForm(INITIAL_FORM);
      fetchCoupons();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (t('couponCreateFailed') || 'Kupon oluşturulamadı');
      toast(msg, 'error');
    } finally {
      setCreating(false);
    }
  };

  // ── Edit ──
  const openEdit = (coupon: Coupon) => {
    setEditTarget(coupon);
    setForm({
      code: coupon.code,
      type: coupon.type,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      target_plan: coupon.target_plan || '',
      max_redemptions: coupon.max_redemptions?.toString() || '',
      expires_at: coupon.expires_at ? coupon.expires_at.split('T')[0] : '',
    });
  };

  const handleEdit = async () => {
    if (!token || !editTarget) return;
    setCreating(true);
    try {
      await apiFetch(`/admin/coupons/${editTarget.id}`, {
        method: 'PUT',
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
      toast(t('couponUpdated') || 'Kupon güncellendi', 'success');
      setEditTarget(null);
      setForm(INITIAL_FORM);
      fetchCoupons();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (t('couponUpdateFailed') || 'Kupon güncellenemedi');
      toast(msg, 'error');
    } finally {
      setCreating(false);
    }
  };

  // ── Sync ──
  const handleSync = async (id: string) => {
    if (!token) return;
    setSyncing(id);
    try {
      await apiFetch(`/admin/coupons/${id}/sync`, { method: 'POST', token });
      toast(t('couponSynced') || 'Polar.sh ile senkronize edildi', 'success');
      fetchCoupons();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (t('couponSyncFailed') || 'Senkronizasyon başarısız');
      toast(msg, 'error');
    } finally {
      setSyncing(null);
    }
  };

  // ── Toggle ──
  const handleToggle = async (id: string, isActive: boolean) => {
    if (!token) return;
    setToggling(id);
    try {
      await apiFetch(`/admin/coupons/${id}`, { method: 'PUT', token, body: { is_active: !isActive } });
      toast(isActive ? (t('couponDeactivated') || 'Kupon pasif edildi') : (t('couponActivated') || 'Kupon aktif edildi'), 'success');
      fetchCoupons();
    } catch {
      toast(t('couponToggleFailed') || 'Kupon durumu değiştirilemedi', 'error');
    } finally {
      setToggling(null);
    }
  };

  // ── Delete ──
  const handleDelete = async () => {
    if (!token || !deleteTarget) return;
    try {
      await apiFetch(`/admin/coupons/${deleteTarget}`, { method: 'DELETE', token });
      toast(t('couponDeleted') || 'Kupon silindi', 'success');
      setDeleteTarget(null);
      fetchCoupons();
    } catch {
      toast(t('couponDeleteFailed') || 'Kupon silinemedi', 'error');
    }
  };

  // ── Copy ──
  const copyCode = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
    } else {
      const ta = document.createElement('textarea');
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    toast(t('codeCopied') || 'Kod kopyalandı', 'success');
  };

  // ── Filter ──
  const filteredCoupons = coupons.filter((c) => {
    if (search && !c.code.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter && c.type !== typeFilter) return false;
    return true;
  });

  // ── Expiry helper ──
  const getExpiryLabel = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const date = new Date(expiresAt);
    const now = new Date();
    const isExpired = date < now;
    const label = date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    return { label, isExpired };
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-gray-200 dark:bg-slate-700 rounded" />
        <div className="h-64 bg-gray-200 dark:bg-slate-700 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('coupons') || 'Kupon Kodları'}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('couponsDesc') || 'İndirim kodlarını oluştur ve yönet'}</p>
        </div>
        <button type="button" onClick={() => { setShowCreate(!showCreate); setEditTarget(null); setForm(INITIAL_FORM); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-brand-600 text-white hover:bg-brand-700 transition">
          <Plus size={16} strokeWidth={1.75} /> {t('newCoupon') || 'Yeni Kupon'}
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchCoupons') || 'Kupon ara...'}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
        >
          <option value="">{t('allTypes') || 'Tüm tipler'}</option>
          <option value="internal">🔵 Internal</option>
          <option value="polar">🟣 Polar</option>
        </select>
      </div>

      {/* Create / Edit Form */}
      {(showCreate || editTarget) && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {editTarget ? (t('editCoupon') || 'Kuponu Düzenle') : (t('createCoupon') || 'Yeni Kupon Oluştur')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">{t('couponCode') || 'Kupon Kodu'}</label>
              <input type="text" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="INDIRIM50" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm font-mono" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">{t('couponType') || 'Tip'}</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm">
                <option value="internal">{t('internalType') || 'Internal (Direkt uygulanır)'}</option>
                <option value="polar">{t('polarType') || 'Polar.sh (Sync)'}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">{t('discountType') || 'İndirim Tipi'}</label>
              <select value={form.discount_type} onChange={e => setForm({ ...form, discount_type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm">
                <option value="percentage">{t('percentage') || 'Yüzde (%)'}</option>
                <option value="free_month">{t('freeMonth') || 'Ücretsiz Ay'}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">{form.discount_type === 'percentage' ? (t('percentageValue') || 'Yüzde (%)') : (t('freeMonthCount') || 'Ücretsiz Ay Sayısı')}</label>
              <input type="number" value={form.discount_value} onChange={e => setForm({ ...form, discount_value: parseInt(e.target.value) || 0 })} min={0} max={form.discount_type === 'percentage' ? 100 : 12} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">{t('targetPlan') || 'Hedef Plan (boş = tümü)'}</label>
              <select value={form.target_plan} onChange={e => setForm({ ...form, target_plan: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm">
                <option value="">{t('allPlans') || 'Tüm planlar'}</option>
                <option value="startup">Startup</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">{t('maxRedemptions') || 'Max Kullanım (boş = sınırsız)'}</label>
              <input type="number" value={form.max_redemptions} onChange={e => setForm({ ...form, max_redemptions: e.target.value })} min={1} placeholder={t('unlimited') || 'Sınırsız'} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">{t('expiresAt') || 'Son Kullanma Tarihi (boş = süresiz)'}</label>
              <input type="date" value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm" />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => { setShowCreate(false); setEditTarget(null); setForm(INITIAL_FORM); }} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition">{tc('cancel')}</button>
            <button type="button" onClick={editTarget ? handleEdit : handleCreate} disabled={creating || !form.code.trim()} className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition disabled:opacity-50">
              {creating ? (tc('saving') || 'Kaydediliyor...') : editTarget ? (tc('save') || 'Kaydet') : (t('create') || 'Oluştur')}
            </button>
          </div>
        </div>
      )}

      {/* Info boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-400">{t('internalCodeInfo') || '🔵 Internal Kod'}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400/70 mt-1">{t('internalCodeDesc') || 'Müşteri kodu girdiğinde plan direkt uygulanır. Polar\'a gitmez.'}</p>
        </div>
        <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20">
          <p className="text-sm font-medium text-purple-700 dark:text-purple-400">{t('polarCodeInfo') || '🟣 Polar Kod'}</p>
          <p className="text-xs text-purple-600 dark:text-purple-400/70 mt-1">{t('polarCodeDesc') || 'Polar.sh ile sync edilir. Ödeme sayfasında indirim uygulanır.'}</p>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700/50 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('couponCount', { count: filteredCoupons.length }) || `${filteredCoupons.length} kupon`}</span>
          {(search || typeFilter) && (
            <button type="button" onClick={() => { setSearch(''); setTypeFilter(''); }} className="text-xs text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300">{t('clearFilters') || 'Filtreleri temizle'}</button>
          )}
        </div>
        {filteredCoupons.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-4xl mb-3">🎫</div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              {coupons.length === 0 ? (t('noCoupons') || 'Henüz kupon yok') : (t('noCouponsMatch') || 'Aramaya uygun kupon yok')}
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
              {coupons.length === 0 ? (t('noCouponsDesc') || 'İlk kuponunuzu oluşturarak başlayın') : (t('tryDifferentSearch') || 'Farklı bir arama deneyin')}
            </p>
            {coupons.length === 0 && (
              <button type="button" onClick={() => setShowCreate(true)} className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition">
                <Plus size={16} className="inline mr-1" /> {t('newCoupon') || 'Yeni Kupon'}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('code') || 'Kod'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('type') || 'Tip'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('discount') || 'İndirim'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('plan') || 'Plan'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('usage') || 'Kullanım'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase hidden md:table-cell">{t('expiry') || 'Son Kullanma'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{tc('status') || 'Durum'}</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{tc('actions') || 'İşlem'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
                {filteredCoupons.map(c => {
                  const expiry = getExpiryLabel(c.expires_at);
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">{c.code}</span>
                          <button type="button" onClick={() => copyCode(c.code)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition" title={t('copyCode') || 'Kodu kopyala'}><ClipboardList size={14} /></button>
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
                        {c.target_plan || (t('all') || 'Tümü')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                        {c.redemption_count}{c.max_redemptions ? `/${c.max_redemptions}` : ''}
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        {expiry ? (
                          <span className={`inline-flex items-center gap-1 text-xs ${expiry.isExpired ? 'text-red-500' : 'text-gray-500 dark:text-slate-400'}`}>
                            <Clock size={12} /> {expiry.label}
                            {expiry.isExpired && <span className="text-red-500 font-medium">({t('expired') || 'Süresi dolmuş'})</span>}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">{t('noExpiry') || 'Süresiz'}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button type="button" onClick={() => handleToggle(c.id, c.is_active)} disabled={toggling === c.id} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition ${c.is_active ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-gray-50 dark:bg-gray-500/10 text-gray-500 dark:text-gray-400'} ${toggling === c.id ? 'opacity-50' : ''}`}>
                          {toggling === c.id ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : c.is_active ? (
                            <><Check size={12} /> {t('active') || 'Aktif'}</>
                          ) : (
                            <><X size={12} /> {t('passive') || 'Pasif'}</>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button type="button" onClick={() => openEdit(c)} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 transition" title={t('edit') || 'Düzenle'}>
                            <Pencil size={14} />
                          </button>
                          {c.type === 'polar' && !c.polar_discount_id && (
                            <button type="button" onClick={() => handleSync(c.id)} disabled={syncing === c.id} className="text-purple-600 dark:text-purple-400 hover:text-purple-700 transition disabled:opacity-50" title={t('syncPolar') || 'Polar.sh ile senkronize et'}>
                              <RefreshCw size={14} className={syncing === c.id ? 'animate-spin' : ''} />
                            </button>
                          )}
                          {c.type === 'polar' && c.polar_discount_id && (
                            <span className="text-xs text-green-600 dark:text-green-400">✓ Synced</span>
                          )}
                          <button type="button" onClick={() => setDeleteTarget(c.id)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition" title={tc('delete') || 'Sil'}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={t('deleteCoupon') || 'Kuponu Sil'}
        message={t('deleteCouponConfirm') || 'Bu kuponu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.'}
        confirmLabel={tc('delete') || 'Sil'}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
