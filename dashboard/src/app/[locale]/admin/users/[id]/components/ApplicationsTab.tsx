'use client';

import { LazySection, Skeletons } from '@/components/LazySection';
import type { ApplicationsTabProps } from './types';
import { Smartphone } from '@/components/icons';

export function ApplicationsTab({ userApps, t }: ApplicationsTabProps) {
  return (
    <LazySection fallback={Skeletons.card} rootMargin={300}>
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white"><Smartphone size={16} strokeWidth={1.75} className="inline mr-1" /> {t("applications") || "Applications"}</h2>
      {userApps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userApps.map((app) => (
            <div key={app.id} className="glass-card p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{app.name}</h3>
                <span className="text-xs text-gray-500 dark:text-slate-400">{app.endpoint_count} endpoints</span>
              </div>
              {app.description && <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">{app.description}</p>}
              <p className="text-xs text-gray-400 dark:text-slate-500">{new Date(app.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-slate-400">{t("noApplications") || "No applications"}</p>
      )}
    </div>
    </LazySection>
  );
}
