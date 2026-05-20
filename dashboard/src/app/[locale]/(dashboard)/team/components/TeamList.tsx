'use client';

import { useTranslations, useLocale } from 'next-intl';
import type { Team } from '@/lib/api';
import { Users } from '@/components/icons';

function TeamAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-sm font-bold shadow-sm">
      {initials || 'T'}
    </div>
  );
}

export function TeamList({
  teams,
  loading,
  selectedTeamId,
  onSelect,
}: {
  teams: Team[];
  loading: boolean;
  selectedTeamId?: string;
  onSelect: (team: Team) => void;
}) {
  const t = useTranslations('team');
  const locale = useLocale();

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200/50 dark:border-slate-700/50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('yourTeams')}</h3>
        <span className="text-xs font-medium text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
          {teams.length}
        </span>
      </div>
      {loading ? (
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-slate-700" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-2/3 bg-gray-200 dark:bg-slate-700 rounded" />
                <div className="h-2.5 w-1/3 bg-gray-200 dark:bg-slate-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : teams.length === 0 ? (
        <div className="p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gray-100 dark:bg-slate-700/50 flex items-center justify-center">
            <span className="text-2xl"><Users size={18} strokeWidth={1.75} /></span>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{t('noTeams')}</p>
          <p className="text-xs text-gray-400 dark:text-slate-500">Create your first team to get started</p>
        </div>
      ) : (
        <div className="p-2">
          {teams.map((team) => {
            const isSelected = selectedTeamId === team.id;
            return (
              <button
                key={team.id}
                onClick={() => onSelect(team)}
                className={`w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 mb-0.5 ${
                  isSelected
                    ? 'bg-brand-50 dark:bg-brand-500/10 ring-1 ring-brand-200 dark:ring-brand-500/30'
                    : 'hover:bg-gray-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <TeamAvatar name={team.name} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${
                    isSelected ? 'text-brand-700 dark:text-brand-400' : 'text-gray-900 dark:text-white'
                  }`}>
                    {team.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      {t('membersCount', { count: team.member_count || 0 })}
                    </span>
                    <span className="text-xs text-gray-300 dark:text-slate-600">·</span>
                    <span className="text-xs text-gray-400 dark:text-slate-500">
                      {new Date(team.created_at).toLocaleDateString(locale, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
                {isSelected && (
                  <div className="w-1.5 h-8 rounded-full bg-brand-500" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
