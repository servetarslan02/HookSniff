'use client';

import { useToast } from '@/components/Toast';
import { useQueryClient } from '@tanstack/react-query';

export default function DevTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return (
    <div className="space-y-6">
      {/* Dev Tools — Sentry Test */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🧪 Dev Tools</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
          Development and debugging tools. Only visible in dev mode.
        </p>

        <div className="space-y-4">
          {/* Sentry Error Test */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Sentry Error Test</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">Throw a test error to verify Sentry integration</p>
            </div>
            <button
              type="button"
              onClick={() => {
                try {
                  throw new Error('[HookSniff] Sentry test error from admin settings');
                } catch (e) {
                  import('@sentry/nextjs').then((Sentry) => {
                    Sentry.captureException(e);
                    toast('Test error sent to Sentry', 'success');
                  }).catch(() => {
                    toast('Sentry not available in this environment', 'error');
                  });
                }
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
            >
              Send Test Error
            </button>
          </div>

          {/* WS Connection Test */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">WebSocket Status</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">Check WebSocket connection state</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';
                const wsUrl = apiUrl.replace(/^http/, 'ws') + '/ws';
                toast(`WS: ${wsUrl}`, 'info');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 rounded-lg transition"
            >
              Check WS
            </button>
          </div>

          {/* Cache Clear */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Clear React Query Cache</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">Force invalidate all cached data</p>
            </div>
            <button
              type="button"
              onClick={() => {
                queryClient.clear();
                toast('React Query cache cleared', 'success');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 rounded-lg transition"
            >
              Clear Cache
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
