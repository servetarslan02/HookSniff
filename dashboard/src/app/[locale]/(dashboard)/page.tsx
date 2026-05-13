import dynamic from 'next/dynamic';

const DashboardOverview = dynamic(
  () => import('./DashboardOverview').then((m) => m.DashboardOverview),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-gray-500 dark:text-slate-400">Loading dashboard…</div>
      </div>
    ),
  }
);

export default function DashboardPage() {
  return <DashboardOverview />;
}
