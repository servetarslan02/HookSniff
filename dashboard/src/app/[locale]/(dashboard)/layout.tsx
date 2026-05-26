import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { AuthGuard } from '@/components/AuthGuard';
import { SkeletonDashboard } from '@/components/LoadingSkeletons';
import { DashboardShell } from '@/components/DashboardShell';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function DashboardLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <AuthGuard>
      <Suspense fallback={<SkeletonDashboard />}>
        <DashboardShell>{children}</DashboardShell>
      </Suspense>
    </AuthGuard>
  );
}
