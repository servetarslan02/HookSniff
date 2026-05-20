'use client';

import dynamic from 'next/dynamic';

const StreamingContent = dynamic(() => import('./StreamingContent').then(m => ({ default: m.StreamingContent })), {
  ssr: false,
  loading: () => (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 dark:bg-slate-700 rounded-lg" />
      <div className="h-64 bg-gray-200 dark:bg-slate-700 rounded-xl" />
    </div>
  ),
});

export default function StreamingPage() {
  return <StreamingContent />;
}
