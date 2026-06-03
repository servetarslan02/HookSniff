import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { SkeletonAdmin } from '@/components/LoadingSkeletons';
import { AdminShellClient } from '@/components/AdminShellClient';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<SkeletonAdmin />}>
      <AdminShellClient>{children}</AdminShellClient>
    </Suspense>
  );
}
