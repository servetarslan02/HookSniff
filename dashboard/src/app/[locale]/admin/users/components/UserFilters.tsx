'use client';

interface PlanOption {
  value: string;
  labelKey: string;
}

interface UserFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  planFilter: string;
  setPlanFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  dateRange: string;
  setDateRange: (value: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  handleExportCSV: () => void;
  setPage: (page: number) => void;
  planOptions: PlanOption[];
  t: (key: string) => string;
  tc: (key: string) => string;
}

export function UserFilters({
  search,
  setSearch,
  planFilter,
  setPlanFilter,
  statusFilter,
  setStatusFilter,
  dateRange,
  setDateRange,
  handleSearch,
  handleExportCSV,
  setPage,
  planOptions,
  t,
  tc,
}: UserFiltersProps) {
  return (
    <form onSubmit={handleSearch} className="glass-card p-4">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        <div className="md:col-span-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchByEmail')}
            aria-label={t('searchByEmail')}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-red-500 transition text-sm"
          />
        </div>
        <div>
          <label htmlFor="plan-filter" className="sr-only">{t('filterByPlan')}</label>
          <select
            id="plan-filter"
            value={planFilter}
            onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
            aria-label={t('filterByPlan')}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="">{t('allPlans')}</option>
            {planOptions.map((p) => (
              <option key={p.value} value={p.value}>{t(p.labelKey)}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status-filter" className="sr-only">{t('filterByStatus')}</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            aria-label={t('filterByStatus')}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="">{t('allStatuses')}</option>
            <option value="active">{t('active')}</option>
            <option value="banned">{t('banned')}</option>
          </select>
        </div>
        <div>
          <label htmlFor="date-filter" className="sr-only">{t('filterByDate') || 'Date range'}</label>
          <select
            id="date-filter"
            value={dateRange}
            onChange={(e) => { setDateRange(e.target.value); setPage(1); }}
            aria-label={t('filterByDate') || 'Date range'}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="">{t('allTime') || 'All time'}</option>
            <option value="7d">{t('last7Days') || 'Last 7 days'}</option>
            <option value="30d">{t('last30Days') || 'Last 30 days'}</option>
            <option value="90d">{t('last90Days') || 'Last 90 days'}</option>
          </select>
        </div>
        <button
          type="button"
          onClick={handleExportCSV}
          className="px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2"
        >
          <span aria-hidden="true">⬇</span> {t('exportCSV')}
        </button>
      </div>
    </form>
  );
}
