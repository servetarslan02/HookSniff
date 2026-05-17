'use client';

import { useAuth } from '@/lib/store';
import { backgroundTasksApi, type BackgroundTaskOut } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  running: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  cancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
};

function formatDate(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleString();
}

export default function BackgroundTasksPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      toast({ title: 'Task cancelled', type: 'success' });
    },
    onError: (e: Error) => toast({ title: e.message, type: 'error' }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Background Tasks</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Monitor async operations like bulk replay and retry</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">⏳</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No background tasks</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Tasks will appear here when you run bulk operations</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Progress</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Created</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Finished</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {tasks.map(task => (
                <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{task.task_type}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${statusColors[task.status] || ''}`}>{task.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${task.progress}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 mt-1">{task.progress}%</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{formatDate(task.created_at)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{formatDate(task.finished_at)}</td>
                  <td className="px-4 py-3 text-right">
                    {(task.status === 'pending' || task.status === 'running') && (
                      <button onClick={() => cancelMutation.mutate(task.id)} className="text-xs text-red-500 hover:text-red-700">Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
