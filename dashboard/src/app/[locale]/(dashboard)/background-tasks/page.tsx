'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/store';
import { backgroundTasksApi } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Ban, CheckCircle2, Clock, RefreshCw, XCircle } from 'lucide-react';

const statusColors: Record<string, React.ReactNode> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400',
  running: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400',
  failed: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  cancelled: 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400',
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock size={16} strokeWidth={1.75} />,
  running: <RefreshCw size={16} strokeWidth={1.75} />,
  completed: <CheckCircle2 size={16} strokeWidth={1.75} />,
  failed: <XCircle size={16} strokeWidth={1.75} />,
  cancelled: <Ban size={14} className="text-gray-500" />,
};

function formatDate(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleString();
}

export default function BackgroundTasksPage() {
  const t = useTranslations('backgroundTasks');
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['background-tasks'],
    queryFn: () => backgroundTasksApi.list(token!),
    enabled: !!token,
    refetchInterval: 5000,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => backgroundTasksApi.cancel(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['background-tasks'] });
      toast(t('taskCancelled'), 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const handleCancel = () => {
    if (!cancelTarget) return;
    cancelMutation.mutate(cancelTarget);
    setCancelTarget(null);
  };

  const activeTasks = tasks.filter(t => t.status === 'pending' || t.status === 'running');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
        </div>
        {activeTasks.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-medium">
            <span className="animate-pulse">●</span>
            {t('activeTasks', { count: activeTasks.length })}
          </div>
        )}
      </div>


      {/* Task list */}
      {isLoading ? (
        <div className="glass-card p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full mx-auto mb-4" />
          <p className="text-gray-500 dark:text-slate-400">{t('loading')}</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-5xl mb-4"><Clock size={18} strokeWidth={1.75} /></div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('noTasks')}</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{t('noTasksDesc')}</p>
          <p className="text-xs text-gray-400 dark:text-slate-500">{t('tasksCreatedHint')}</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          {/* Table header */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">{t('allTasks')} ({tasks.length})</h3>
          </div>

          {/* Task rows */}
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {tasks.map(task => (
              <div key={task.id}>
                {/* Main row */}
                <div className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition cursor-pointer"
                  onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}>
                  <div className="flex items-center gap-4">
                    {/* Status icon */}
                    <span className="text-lg">{statusIcons[task.status] || '⏳'}</span>

                    {/* Type */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{task.task_type}</div>
                      {task.error && (
                        <div className="text-xs text-red-500 dark:text-red-400 truncate max-w-md">{task.error}</div>
                      )}
                    </div>

                    {/* Status badge */}
                    <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${statusColors[task.status] || ''}`}>
                      {task.status}
                    </span>

                    {/* Progress bar */}
                    <div className="w-32 flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                        <div className={`h-2 rounded-full transition-all ${task.status === 'failed' ? 'bg-red-500' : task.status === 'completed' ? 'bg-green-500' : 'bg-brand-600'}`}
                          style={{ width: `${task.progress}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-slate-400 w-8 text-right">{task.progress}%</span>
                    </div>

                    {/* Created */}
                    <span className="text-xs text-gray-500 dark:text-slate-400 w-32 text-right">{formatDate(task.created_at)}</span>

                    {/* Expand arrow */}
                    <span className="text-gray-400 text-xs">{expandedTask === task.id ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* Expanded detail */}
                {expandedTask === task.id && (
                  <div className="px-6 py-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-700 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Timing */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">{t('timing')}</label>
                        <div className="space-y-1 text-xs text-gray-600 dark:text-slate-400">
                          <div>{t('created')}: {formatDate(task.created_at)}</div>
                          <div>{t('started')}: {formatDate(task.started_at)}</div>
                          <div>{t('finished')}: {formatDate(task.finished_at)}</div>
                        </div>
                      </div>

                      {/* Task Data */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">{t('taskData')}</label>
                        {task.data ? (
                          <pre className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs font-mono overflow-x-auto text-gray-800 dark:text-slate-300 max-h-32">
                            {JSON.stringify(task.data, null, 2)}
                          </pre>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-slate-500">—</span>
                        )}
                      </div>

                      {/* Result */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">{t('result')}</label>
                        {task.result ? (
                          <pre className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs font-mono overflow-x-auto text-gray-800 dark:text-slate-300 max-h-32">
                            {JSON.stringify(task.result, null, 2)}
                          </pre>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-slate-500">—</span>
                        )}
                      </div>
                    </div>

                    {/* Error */}
                    {task.error && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">{t('error')}</label>
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs text-red-700 dark:text-red-400">
                          {task.error}
                        </div>
                      </div>
                    )}

                    {/* Cancel action */}
                    {(task.status === 'pending' || task.status === 'running') && (
                      <button onClick={(e) => { e.stopPropagation(); setCancelTarget(task.id); }}
                        className="px-4 py-2 text-xs font-medium bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-500/20 transition">
                        {t('cancelTask')}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cancel confirmation */}
      <ConfirmDialog
        open={cancelTarget !== null}
        title={t('cancelTitle')}
        message={t('cancelConfirm')}
        variant="danger"
        onConfirm={handleCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
