'use client';

import { LazySection, Skeletons } from '@/components/LazySection';
import { useState, useMemo } from 'react';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { adminApi, API_BASE, type AdminUser } from '@/lib/api';
import { useAdminUsers, useUpdateUserPlan, useUpdateUserStatus } from '@/hooks/useAdminData';
import { useTranslations, useLocale } from 'next-intl';
import { UserFilters } from './components/UserFilters';
import { BulkActions } from './components/BulkActions';
import { UserTable } from './components/UserTable';
import { PlanChangeModal } from './components/PlanChangeModal';
import { BanModal } from './components/BanModal';

const PLAN_OPTIONS = [
  { value: 'developer', labelKey: 'developerPlan' },
  { value: 'startup', labelKey: 'startupPlan' },
  { value: 'pro', labelKey: 'proPlan' },
  { value: 'enterprise', labelKey: 'enterprisePlan' },
];

const PLAN_BADGE_COLORS: Record<string, string> = {
  developer: 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300',
  startup: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  pro: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',
  enterprise: 'bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400',
};

export default function AdminUsersPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const locale = useLocale();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [planChangeTarget, setPlanChangeTarget] = useState<AdminUser | null>(null);
  const [newPlan, setNewPlan] = useState('');
  const [sortField, setSortField] = useState<'email' | 'name' | 'plan' | 'status' | 'created_at'>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<'ban' | 'unban' | 'plan' | null>(null);
  const [bulkPlan, setBulkPlan] = useState('developer');
  const [bulkProcessing, setBulkProcessing] = useState(false);
  // Ban reason dialog
  const [banTarget, setBanTarget] = useState<AdminUser | null>(null);
  const [banReason, setBanReason] = useState('');
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const perPage = 20;

  // Compute date range params
  const dateParams = useMemo(() => {
    if (!dateRange) return undefined;
    const now = new Date();
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  }, [dateRange]);

  // React Query — replaces fetchUsers + useState + useEffect
  const { data, isLoading } = useAdminUsers({
    page,
    search: search || undefined,
    plan: planFilter || undefined,
    status: statusFilter || undefined,
    created_after: dateParams,
    sort_field: sortField,
    sort_dir: sortDir,
  });

  // Mutations
  const updatePlanMutation = useUpdateUserPlan();
  const updateStatusMutation = useUpdateUserStatus();

  const users = useMemo(() => data?.users ?? [], [data?.users]);
  const total = data?.total ?? 0;

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setPage(1); // Reset to first page when sorting changes
  };

  // Backend handles sorting now, no need for frontend sort
  const sortedUsers = users;

  const handleExportCSV = async () => {
    if (!token) return;
    try {
      const url = adminApi.exportUsers(token, {
        plan: planFilter || undefined,
        status: statusFilter || undefined,
        created_after: dateParams || undefined,
      });
      const res = await fetch(`${API_BASE}${url}`, { headers: { Authorization: `Bearer ${token}`, 'Origin': window.location.origin } });
      if (!res.ok) throw new Error(t('exportFailed'));
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `hooksniff-users-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast(tc('error'), 'error');
    }
  };

  const handleImpersonate = async (user: AdminUser) => {
    if (!token) return;
    try {
      const result = await adminApi.impersonateUser(token, user.id);
      // Store token in sessionStorage (not URL) to prevent log/history leakage
      sessionStorage.setItem('impersonate_token', result.token);
      const newWindow = window.open('about:blank', '_blank');
      if (newWindow) {
        newWindow.location.href = `/${locale}/dashboard?impersonate=1`;
      }
      toast(t('impersonating') + `: ${user.email}`, 'success');
    } catch {
      toast(tc('error'), 'error');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleChangePlan = async () => {
    if (!planChangeTarget || !newPlan) return;
    try {
      await updatePlanMutation.mutateAsync({ userId: planChangeTarget.id, plan: newPlan });
      toast(t('planUpdated', { plan: newPlan }), 'success');
      setPlanChangeTarget(null);
    } catch {
      toast(tc('error'), 'error');
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    if (user.status === 'active') {
      setBanTarget(user);
      setBanReason('');
      return;
    }
    try {
      await updateStatusMutation.mutateAsync({ userId: user.id, status: 'active' });
      toast(t('userActivated'), 'success');
    } catch {
      toast(tc('error'), 'error');
    }
  };

  const handleConfirmBan = async () => {
    if (!banTarget) return;
    try {
      await updateStatusMutation.mutateAsync({
        userId: banTarget.id,
        status: 'banned',
        reason: banReason.trim() || undefined,
      });
      toast(t('userBanned'), 'success');
      setBanTarget(null);
      setBanReason('');
    } catch {
      toast(tc('error'), 'error');
    }
  };

  const totalPages = Math.ceil(total / perPage);

  // Bulk selection helpers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    if (selectedIds.size === sortedUsers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedUsers.map((u) => u.id)));
    }
  };
  const clearSelection = () => setSelectedIds(new Set());

  // Bulk action handler
  const handleBulkAction = async () => {
    if (selectedIds.size === 0) return;
    setBulkProcessing(true);
    let successCount = 0;
    const errors: string[] = [];
    const ids = Array.from(selectedIds);

    try {
      if (bulkAction === 'ban' || bulkAction === 'unban') {
        const status = bulkAction === 'ban' ? 'banned' : 'active';
        const results = await Promise.allSettled(
          ids.map((id) => updateStatusMutation.mutateAsync({ userId: id, status }))
        );
        results.forEach((r, i) => {
          if (r.status === 'fulfilled') {
            successCount++;
          } else {
            errors.push(`${ids[i].slice(0, 8)}: ${r.reason?.message || 'Unknown error'}`);
          }
        });
      } else if (bulkAction === 'plan') {
        const results = await Promise.allSettled(
          ids.map((id) => updatePlanMutation.mutateAsync({ userId: id, plan: bulkPlan }))
        );
        results.forEach((r, i) => {
          if (r.status === 'fulfilled') {
            successCount++;
          } else {
            errors.push(`${ids[i].slice(0, 8)}: ${r.reason?.message || 'Unknown error'}`);
          }
        });
      }

      if (successCount > 0) {
        toast(t('bulkActionSuccess', { count: successCount }) || `${successCount} user(s) updated`, 'success');
      }
      if (errors.length > 0) {
        const errorSummary = errors.slice(0, 3).join('; ') + (errors.length > 3 ? ` (+${errors.length - 3} more)` : '');
        toast(t('bulkActionFailed', { count: errors.length }) + `: ${errorSummary}`, 'error');
      }
      clearSelection();
      setBulkAction(null);
    } catch {
      toast(tc('error'), 'error');
    } finally {
      setBulkProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('userManagement')}</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          {t('userManagementDesc')}
        </p>
      </div>

      {/* Search & Filters */}
      <UserFilters
        search={search}
        setSearch={setSearch}
        planFilter={planFilter}
        setPlanFilter={setPlanFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        dateRange={dateRange}
        setDateRange={setDateRange}
        handleSearch={handleSearch}
        handleExportCSV={handleExportCSV}
        setPage={setPage}
        planOptions={PLAN_OPTIONS}
        t={t}
        tc={tc}
      />

      {/* Bulk Action Bar + User Table — below the fold, lazy loaded */}
      <LazySection fallback={Skeletons.table()} rootMargin={300}>
      <BulkActions
        selectedIds={selectedIds}
        bulkAction={bulkAction}
        setBulkAction={setBulkAction}
        bulkPlan={bulkPlan}
        setBulkPlan={setBulkPlan}
        bulkProcessing={bulkProcessing}
        clearSelection={clearSelection}
        handleBulkAction={handleBulkAction}
        planOptions={PLAN_OPTIONS}
        t={t}
        tc={tc}
      />

      <UserTable
        sortedUsers={sortedUsers}
        isLoading={isLoading}
        selectedIds={selectedIds}
        toggleSelect={toggleSelect}
        toggleSelectAll={toggleSelectAll}
        sortField={sortField}
        sortDir={sortDir}
        handleSort={handleSort}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        total={total}
        perPage={perPage}
        locale={locale}
        handleToggleStatus={handleToggleStatus}
        handleImpersonate={handleImpersonate}
        setPlanChangeTarget={setPlanChangeTarget}
        setNewPlan={setNewPlan}
        planBadgeColors={PLAN_BADGE_COLORS}
        t={t}
        tc={tc}
      />

      {/* Ban Reason Modal */}
      <BanModal
        banTarget={banTarget}
        banReason={banReason}
        setBanReason={setBanReason}
        handleConfirmBan={handleConfirmBan}
        setBanTarget={setBanTarget}
        t={t}
        tc={tc}
      />
      </LazySection>

      {/* Plan Change Modal */}
      <PlanChangeModal
        planChangeTarget={planChangeTarget}
        newPlan={newPlan}
        setNewPlan={setNewPlan}
        handleChangePlan={handleChangePlan}
        setPlanChangeTarget={setPlanChangeTarget}
        planOptions={PLAN_OPTIONS}
        t={t}
        tc={tc}
      />
    </div>
  );
}
