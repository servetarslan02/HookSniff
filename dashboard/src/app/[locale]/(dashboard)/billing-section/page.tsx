'use client';

import dynamic from 'next/dynamic';

const BillingPage = dynamic(() => import('../billing/page'), {
  ssr: false,
  loading: () => (
    <div className="max-w-5xl space-y-10 animate-pulse">
      <div>
        <div className="h-8 w-48 bg-gray-200 dark:bg-slate-700 rounded" />
        <div className="h-4 w-64 bg-gray-200 dark:bg-slate-700 rounded mt-2" />
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-4">
          <div className="h-5 w-40 bg-gray-200 dark:bg-slate-700 rounded" />
          <div className="h-32 bg-gray-200 dark:bg-slate-700 rounded-xl" />
        </div>
      ))}
    </div>
  ),
});

export default function BillingSectionPage() {
  return <BillingPage />;
}
