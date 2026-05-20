'use client';

import dynamic from 'next/dynamic';

const SsoContent = dynamic(() => import('./SsoContent').then(m => ({ default: m.SsoContent })), {
  ssr: false,
  loading: () => (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 dark:bg-slate-700 rounded-lg" />
      <div className="h-64 bg-gray-200 dark:bg-slate-700 rounded-xl" />
    </div>
  ),
});

export default function SsoSettingsPage({ teamId }: { teamId?: string } = {}) {
  return <SsoContent teamId={teamId} />;
}
