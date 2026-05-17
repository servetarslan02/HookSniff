'use client';

import type { AdminUser } from '@/lib/api';

interface PlanOption {
  value: string;
  labelKey: string;
}

interface PlanChangeModalProps {
  planChangeTarget: AdminUser | null;
  newPlan: string;
  setNewPlan: (plan: string) => void;
  handleChangePlan: () => void;
  setPlanChangeTarget: (user: AdminUser | null) => void;
  planOptions: PlanOption[];
  t: (key: string, params?: Record<string, unknown>) => string;
  tc: (key: string) => string;
}

export function PlanChangeModal({
  planChangeTarget,
  newPlan,
  setNewPlan,
  handleChangePlan,
  setPlanChangeTarget,
  planOptions,
  t,
  tc,
}: PlanChangeModalProps) {
  if (!planChangeTarget) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setPlanChangeTarget(null)} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {t('changePlan')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
          {t('changePlanFor', { email: planChangeTarget.email })}
        </p>
        <select
          value={newPlan}
          onChange={(e) => setNewPlan(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white mb-4"
        >
          {planOptions.map((p) => (
            <option key={p.value} value={p.value}>{t(p.labelKey)}</option>
          ))}
        </select>
        <div className="flex gap-3 justify-end">
          <button type="button"
            onClick={() => setPlanChangeTarget(null)}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition"
          >
            {tc('cancel')}
          </button>
          <button type="button"
            onClick={handleChangePlan}
            className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition"
          >
            {t('updatePlan')}
          </button>
        </div>
      </div>
    </div>
  );
}
