'use client';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Platform-wide configuration and settings
        </p>
      </div>
      <div className="glass-card p-12 text-center">
        <div className="text-6xl mb-4">⚙️</div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Coming Soon</h2>
        <p className="text-gray-500 dark:text-slate-400 text-sm">
          Platform settings and configuration options will be available here.
        </p>
      </div>
    </div>
  );
}
