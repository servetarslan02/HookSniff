import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ChangelogEntryContent } from './ChangelogEntryContent';
import { changelog, getChangelogBySlug } from '@/lib/changelog-data';

export function generateStaticParams() {
  return changelog.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const release = getChangelogBySlug(slug);
  if (!release) return { title: 'Not Found — HookSniff' };

  return {
    title: `${release.version} — ${release.title} | HookSniff Changelog`,
    description: release.summary,
    openGraph: {
      title: `${release.version}: ${release.title}`,
      description: release.summary,
      type: 'article',
      url: `https://hooksniff.vercel.app/changelog/${release.slug}`,
      siteName: 'HookSniff',
      publishedTime: release.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${release.version}: ${release.title}`,
      description: release.summary,
    },
  };
}

export default async function ChangelogEntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[40vh]"><div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <ChangelogEntryContent slug={slug} />
    </Suspense>
  );
}
