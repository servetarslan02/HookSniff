'use client';

import { useTranslations } from 'next-intl';
import type { ComponentStatus } from './types';
import { StatusBadge } from './StatusBadge';
import { Zap, Monitor, Settings, Database, HardDrive, Mail, Cloud, Wrench } from '@/components/icons';
import type { LucideIcon } from '@/components/icons';

const ICON_MAP: Record<string, LucideIcon> = {
  zap: Zap,
  monitor: Monitor,
  settings: Settings,
  database: Database,
  harddrive: HardDrive,
  mail: Mail,
  cloud: Cloud,
};

function resolveIcon(icon: React.ReactNode | string | null | undefined): React.ReactNode {
  if (!icon) return <Wrench size={16} strokeWidth={1.75} />;
  if (typeof icon === 'string') {
    const Icon = ICON_MAP[icon.toLowerCase()];
    return Icon ? <Icon size={16} strokeWidth={1.75} /> : <Wrench size={16} strokeWidth={1.75} />;
  }
  return icon;
}

export function ComponentRow({ component: _component, responseTimes: _responseTimes }: { component: ComponentStatus; responseTimes: number[] }) {
  const t = useTranslations('status');
  const uptime = _component.uptime_30d;

  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg">{resolveIcon(_component.icon)}</span>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{_component.name}</div>
            <div className="text-sm text-gray-500 dark:text-slate-400">{_component.description}</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Uptime % */}
          {uptime !== undefined && uptime !== null && (
            <div className="text-right hidden sm:block">
              <div className="text-xs text-gray-500 dark:text-slate-500">{t("uptime")}</div>
              <div className={`text-sm font-semibold ${uptime >= 99.5 ? 'text-emerald-600 dark:text-emerald-400' : uptime >= 95 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                {uptime.toFixed(2)}%
              </div>
            </div>
          )}
          <StatusBadge status={_component.status} />
        </div>
      </div>
    </div>
  );
}
