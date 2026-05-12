'use client';

import { useState, useEffect, useCallback } from 'react';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { adminApi, type AdminUser } from '@/lib/api';
import { useTranslations, useLocale } from 'next-intl';

/* ─── Hook0-style Admin Users: Tablo + arama + plan filtresi ─── */

const PLAN_BADGE: Record<string, string> = {
  developer: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  startup: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  pro: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  enterprise: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
};

export default function AdminUsersPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const locale = useLocale();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const t = useTranslations('admin');
  const perPage = 20;

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await adminApi.listUsers(token, {
        page,
        search: search || undefined,
        plan: planFilter || undefined,
      });
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch {
      toast(t('failedToLoadUsers') || 'Kullanıcılar yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, page, search, planFilter, toast, t]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="space-y-4">
      {/* ── Başlık + Arama + Filtre ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('users') || 'Kullanıcılar'}</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={t('searchUsers') || 'Ara...'}
            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent w-48"
          />
          <select
            value={planFilter}
            onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
          >
            <option value="">{t('allPlans') || 'Tüm Planlar'}</option>
            <option value="developer">Developer</option>
            <option value="startup">Startup</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      {/* ── Tablo ── */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="px-5 py-10 text-center text-sm text-gray-500 animate-pulse">{t('loading') || 'Yükleniyor...'}</div>
        ) : users.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">{t('noUsers') || 'Kullanıcı bulunamadı'}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('email') || 'E-posta'}</th>
                    <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('nameLabel') || 'İsim'}</th>
                    <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('plan') || 'Plan'}</th>
                    <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('status') || 'Durum'}</th>
                    <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('joined') || 'Katıldı'}</th>
                    <th className="text-right px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('actions') || 'Eylemler'}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-5 py-3">
                        <Link href={`/admin/users/${u.id}`} className="text-gray-900 dark:text-white hover:underline">
                          {u.email}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-gray-600 dark:text-gray-400">{u.name || '—'}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${PLAN_BADGE[u.plan] || PLAN_BADGE.developer}`}>
                          {u.plan}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          u.status === 'active' ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                          {u.status === 'active' ? (t('active') || 'Aktif') : (t('banned') || 'Yasaklı')}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs">
                        {new Date(u.created_at).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US')}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link href={`/admin/users/${u.id}`} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
                          ⚙️
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {total > perPage && (
              <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} / {total}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 text-xs rounded border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-3 py-1 text-xs rounded border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
