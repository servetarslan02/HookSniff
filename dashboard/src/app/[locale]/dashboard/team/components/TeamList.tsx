'use client';

import { useTranslations, useLocale } from 'next-intl';
import type { Team } from '@/lib/api';

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
      <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('yourTeams')}</h3>
      </div>
      {loading ? (
        <div className="p-6 text-center text-gray-500 dark:text-slate-400 animate-pulse text-sm">
          {t('loadingTeams')}
        </div>
      ) : teams.length === 0 ? (
        <div className="p-6 text-center">
          <div className="text-3xl mb-2">👥</div>
          <p className="text-sm text-gray-500 dark:text-slate-400">{t('noTeams')}</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
          {teams.map((team) => (
            <button
              key={team.id}
              onClick={() => onSelect(team)}
              className={`w-full text-left px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition ${
                selectedTeamId === team.id ? 'bg-brand-50 dark:bg-brand-500/10' : ''
              }`}
            >
              <p className="text-sm font-medium text-gray-900 dark:text-white">{team.name}</p>
              {team.description && (
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 truncate">
                  {team.description}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                {t('membersCount', { count: team.member_count || 0 })} · {new Date(team.created_at).toLocaleDateString(locale)}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
