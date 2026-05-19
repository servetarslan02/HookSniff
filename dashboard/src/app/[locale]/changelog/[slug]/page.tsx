import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

// ISR: revalidate every hour
export const revalidate = 3600;
import {
  changelog,
  getChangelogBySlug,
  typeConfig,
  areaConfig,
} from '@/lib/changelog-data';

/* ─── Static Generation ─── */

export function generateStaticParams() {
  return changelog.map((r) => ({ slug: r.slug }));
}

/* ─── Metadata ─── */

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

/* ─── Page ─── */

export default async function ChangelogEntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const t = await getTranslations('changelog');
  const { slug } = await params;
  const release = getChangelogBySlug(slug);
  if (!release) notFound();

  const areaCfg = areaConfig[release.area];
  const releaseIndex = changelog.findIndex((r) => r.slug === slug);
  const prevRelease = changelog[releaseIndex + 1];
  const nextRelease = changelog[releaseIndex - 1];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Nav */}
      <nav className="border-b border-gray-200/50 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="items-center gap-3 flex">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">🪝 HookSniff</Link>
            <span className="text-gray-500 dark:text-slate-500">/</span>
            <Link href="/changelog" className="text-gray-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Changelog</Link>
            <span className="text-gray-500 dark:text-slate-500">/</span>
            <span className="text-gray-900 dark:text-white font-medium">{release.version}</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm font-mono font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2.5 py-1 rounded-md">
              {release.version}
            </span>
            {release.tag === 'latest' && (
              <span className="text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">{t("latest")}</span>
            )}
            <span className="text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
              {areaCfg.icon} {areaCfg.label}
            </span>
            <span className="text-sm text-gray-500 dark:text-slate-500 ml-auto">{release.date}</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{release.title}</h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 leading-relaxed">{release.summary}</p>

          {/* Share */}
          <div className="flex items-center gap-3 mt-4">
            <span className="text-xs text-gray-500 dark:text-slate-600">Share:</span>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${release.version}: ${release.title}`)}&url=${encodeURIComponent(`https://hooksniff.vercel.app/changelog/${release.slug}`)}`}
              target="_blank"
             rel="noopener noreferrer"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              𝕏 Twitter
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://hooksniff.vercel.app/changelog/${release.slug}`)}`}
              target="_blank"
             rel="noopener noreferrer"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              LinkedIn
            </a>
            <a
              href={`https://news.ycombinator.com/submitlink?u=${encodeURIComponent(`https://hooksniff.vercel.app/changelog/${release.slug}`)}&t=${encodeURIComponent(`${release.version}: ${release.title}`)}`}
              target="_blank"
             rel="noopener noreferrer"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              HN
            </a>
          </div>
        </div>

        {/* Hero Image */}
        {release.heroImage && (
          <div className="mb-10 relative w-full h-[400px]">
            <Image src={release.heroImage} alt={release.title} fill className="rounded-xl border border-gray-200 dark:border-slate-700 object-cover" />
          </div>
        )}

        {/* Entries */}
        <div className="space-y-4">
          {release.entries.map((entry, i) => {
            const cfg = typeConfig[entry.type];
            return (
              <div key={i} className="rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
                <div className="flex items-start gap-4">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full shrink-0 mt-0.5 ${cfg.bg} ${cfg.color}`}>
                    {cfg.icon} {cfg.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 dark:text-white text-base font-medium leading-relaxed">{entry.text}</p>

                    {entry.commit && (
                      <a href={`https://github.com/servetarslan02/HookSniff/commit/${entry.commit}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-2 text-xs font-mono text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" /></svg>
                        {entry.commit}
                      </a>
                    )}

                    {entry.detail && (
                      <p className="text-sm text-gray-600 dark:text-slate-400 mt-2 leading-relaxed">{entry.detail}</p>
                    )}

                    {entry.code && (
                      <div className="mt-3 relative group">
                        <pre className="bg-gray-900 dark:bg-slate-800 rounded-lg p-4 text-xs text-green-400 font-mono overflow-x-auto">{entry.code.snippet}</pre>
                      </div>
                    )}

                    {entry.image && (
                      <div className="mt-4 relative w-full h-[300px]">
                        <Image src={entry.image.src} alt={entry.image.alt} fill className="rounded-lg border border-gray-200 dark:border-slate-700 object-cover" loading="lazy" />
                        {entry.image.caption && <p className="text-xs text-gray-500 dark:text-slate-500 mt-2 text-center">{entry.image.caption}</p>}
                      </div>
                    )}

                    {entry.video && (
                      <div className="mt-4">
                        <video src={entry.video.src} poster={entry.video.poster} controls className="rounded-lg border border-gray-200 dark:border-slate-700 w-full" />
                        {entry.video.caption && <p className="text-xs text-gray-500 dark:text-slate-500 mt-2 text-center">{entry.video.caption}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
          {prevRelease ? (
            <Link href={`/changelog/${prevRelease.slug}`} className="group">
              <p className="text-xs text-gray-500 dark:text-slate-600 mb-1">← Previous</p>
              <p className="text-sm font-medium text-gray-700 dark:text-slate-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                {prevRelease.version} — {prevRelease.title}
              </p>
            </Link>
          ) : <div />}
          {nextRelease ? (
            <Link href={`/changelog/${nextRelease.slug}`} className="group text-right">
              <p className="text-xs text-gray-500 dark:text-slate-600 mb-1">Next →</p>
              <p className="text-sm font-medium text-gray-700 dark:text-slate-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                {nextRelease.version} — {nextRelease.title}
              </p>
            </Link>
          ) : <div />}
        </div>

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link href="/changelog" className="text-sm text-brand-600 dark:text-brand-400 hover:underline">{t('backToList')}</Link>
        </div>
      </main>
    </div>
  );
}
