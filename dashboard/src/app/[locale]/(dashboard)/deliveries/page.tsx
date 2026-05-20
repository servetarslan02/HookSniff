'use client';

import dynamic from 'next/dynamic';

const DeliveriesContent = dynamic(() => import('./DeliveriesContent').then(m => ({ default: m.default })), {
  ssr: false,
  loading: () => (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 dark:bg-slate-700 rounded-lg" />
      <div className="h-12 bg-gray-200 dark:bg-slate-700 rounded-xl" />
      <div className="h-10 w-80 bg-gray-200 dark:bg-slate-700 rounded-xl" />
      <div className="h-64 bg-gray-200 dark:bg-slate-700 rounded-xl" />
    </div>
  ),
});

export default function DeliveriesPage() {
  return <DeliveriesContent />;
}
