import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { SkeletonDocs } from '@/components/LoadingSkeletons';
import { DocsShell } from '@/components/DocsShell';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function DocsLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<SkeletonDocs />}>
      <DocsShell>{children}</DocsShell>
    </Suspense>
  );
}
