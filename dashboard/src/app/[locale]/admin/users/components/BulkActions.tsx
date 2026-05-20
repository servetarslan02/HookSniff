'use client';

import { Ban, CheckCircle2, ClipboardList, X } from '@/components/icons';

interface PlanOption {
 value: string;
 labelKey: string;
}

interface BulkActionsProps {
 selectedIds: Set<string>;
 bulkAction: 'ban' | 'unban' | 'plan' | null;
 setBulkAction: (action: 'ban' | 'unban' | 'plan' | null) => void;
 bulkPlan: string;
 setBulkPlan: (plan: string) => void;
 bulkProcessing: boolean;
 clearSelection: () => void;
 handleBulkAction: () => void;
 planOptions: PlanOption[];
 t: any;
 tc: any;
}

export function BulkActions({
 selectedIds,
 bulkAction,
 setBulkAction,
 bulkPlan,
 setBulkPlan,
 bulkProcessing,
 clearSelection,
 handleBulkAction,
 planOptions,
 t,
 tc,
}: BulkActionsProps) {
 return (
  <>
   {/* Bulk Action Bar */}
   {selectedIds.size > 0 && (
    <div className="glass-card p-4 flex flex-wrap items-center gap-3 border-2 border-red-200 dark:border-red-500/30">
     <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
      {t('selectedCount', { count: selectedIds.size }) || `${selectedIds.size} selected`}
     </span>
     <div className="flex items-center gap-2 ml-auto">
      <button type="button"
       onClick={() => setBulkAction('ban')}
       className="px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition"
      >
       <Ban size={14} className="inline mr-1 -mt-0.5" /> {t('bulkBan') || 'Ban Selected'}
      </button>
      <button type="button"
       onClick={() => setBulkAction('unban')}
       className="px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition"
      >
       <CheckCircle2 size={16} strokeWidth={1.75} className="inline mr-1" /> {t('bulkUnban') || 'Unban Selected'}
      </button>
      <button type="button"
       onClick={() => { setBulkAction('plan'); setBulkPlan('developer'); }}
       className="px-3 py-1.5 text-xs font-medium text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-500/20 transition"
      >
       <ClipboardList size={16} strokeWidth={1.75} className="inline mr-1" /> {t('bulkChangePlan') || 'Change Plan'}
      </button>
      <button type="button"
       onClick={clearSelection}
       className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition"
      >
       <X size={16} strokeWidth={1.75} className="inline mr-1" /> {tc('cancel')}
      </button>
     </div>
    </div>
   )}

   {/* Bulk Action Confirm Modal */}
   {bulkAction && (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
     <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setBulkAction(null)} />
     <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
       {bulkAction === 'ban' ? t('bulkBan') || 'Ban Selected' :
        bulkAction === 'unban' ? t('bulkUnban') || 'Unban Selected' :
        t('bulkChangePlan') || 'Change Plan'}
      </h3>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
       {t('bulkActionConfirm', { count: selectedIds.size }) || `This will affect ${selectedIds.size} user(s).`}
      </p>
      {bulkAction === 'plan' && (
       <select
        value={bulkPlan}
        onChange={(e) => setBulkPlan(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white mb-4"
       >
        {planOptions.map((p) => (
         <option key={p.value} value={p.value}>{t(p.labelKey)}</option>
        ))}
       </select>
      )}
      <div className="flex gap-3 justify-end">
       <button type="button"
        onClick={() => setBulkAction(null)}
        className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition"
       >
        {tc('cancel')}
       </button>
       <button type="button"
        onClick={handleBulkAction}
        disabled={bulkProcessing}
        className={`px-4 py-2.5 text-sm font-medium text-white rounded-xl transition disabled:opacity-60 ${
         bulkAction === 'ban' ? 'bg-red-600 hover:bg-red-700' :
         bulkAction === 'unban' ? 'bg-emerald-600 hover:bg-emerald-700' :
         'bg-violet-600 hover:bg-violet-700'
        }`}
       >
        {bulkProcessing ? tc('saving') : tc('confirm') || 'Confirm'}
       </button>
      </div>
     </div>
    </div>
   )}
  </>
 );
}
