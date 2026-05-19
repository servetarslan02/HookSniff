'use client';

import { useTranslations } from 'next-intl';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Check } from 'lucide-react';
import {
  changelog,
  typeConfig,
  areaConfig,
  allTypes,
  allAreas,
  getYears,
  getReleasesByYear,
  type ChangeType,
  type ProductArea,
} from '@/lib/changelog-data';

export function ChangelogPageContent() {
  const t = useTranslations('changelog');
  const tc = useTranslations('common');
  const [activeType, setActiveType] = useState<ChangeType | 'all'>('all');
  const [activeArea, setActiveArea] = useState<ProductArea | 'all'>('all');
  const [expandedVersion, setExpandedVersion] = useState<string | null>(
    changelog.find((r) => r.tag === 'latest')?.version || null
  );
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribeError, setSubscribeError] = useState('');

  const years = getYears();

  const typeLabelMap: Record<string, string> = {
    feature: t('typeFeature'),
    fix: t('typeFix'),
    improvement: t('typeImprovement'),
    security: t('typeSecurity'),
    breaking: t('typeBreaking'),
  };
  const areaLabelMap: Record<string, string> = {
    api: t('areaApi'),
    dashboard: t('areaDashboard'),
    sdk: t('areaSdk'),
    worker: t('areaWorker'),
    infra: t('areaInfra'),
    docs: t('areaDocs'),
  };

  const filteredChangelog = changelog
    .map((release) => ({
      ...release,
      entries:
        activeType === 'all'
          ? release.entries
          : release.entries.filter((e) => e.type === activeType),
    }))
    .filter((release) => release.entries.length > 0)
    .filter((release) => activeArea === 'all' || release.area === activeArea);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribeError('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubscribed(true);
      } else {
        setSubscribeError(tc('somethingWentWrong'));
      }
    } catch {
      setSubscribeError(t('networkError'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Nav */}
      <nav className="border-b border-gray-200/50 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="items-center gap-3 flex">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">🪝 HookSniff</Link>
            <span className="text-gray-500 dark:text-slate-500">/</span>
            <span className="text-gray-600 dark:text-slate-400">{t("title")}</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t("title")}</h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
            {t('desc')}
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <a href="/blog/rss" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a1 1 0 000 2c5.523 0 10 4.477 10 10a1 1 0 102 0C17 8.373 11.627 3 5 3z" /><path d="M4 9a1 1 0 000 2 4 4 0 014 4 1 1 0 102 0 6 6 0 00-6-6z" /><circle cx="5" cy="15" r="2" /></svg>
              RSS
            </a>
            <a href="https://github.com/servetarslan02/HookSniff/releases" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" /></svg>
              GitHub Releases
            </a>
          </div>
        </div>

        {/* Email Subscribe */}
        <div className="max-w-md mx-auto mb-10">
          {subscribed ? (
            <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
              <p className="text-sm text-emerald-700 dark:text-emerald-400"><Check size={14} strokeWidth={1.75} className="inline-block align-text-bottom mr-1 text-emerald-500" /> {t('subscribeSuccess')}</p>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input type="email" placeholder={t('emailPlaceholder')} value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-hidden" required />
                <button type="submit" className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors shrink-0">{t("subscribe")}</button>
              </form>
              {subscribeError && <p className="text-xs text-red-500 dark:text-red-400 mt-2 text-center">{subscribeError}</p>}
            </>
          )}
        </div>

        {/* Filters — Type */}
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          <button onClick={() => setActiveType('all')} className={`px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors ${activeType === 'all' ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-500'}`}>{t("allTypes")}</button>
          {allTypes.map((type) => {
            const cfg = typeConfig[type];
            const count = changelog.reduce((acc, r) => acc + r.entries.filter((e) => e.type === type).length, 0);
            if (count === 0) return null;
            return (
              <button key={type} onClick={() => setActiveType(type)} className={`px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors ${activeType === type ? `${cfg.bg} ${cfg.color} border border-current` : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-500'}`}>
                {cfg.icon} {typeLabelMap[type] || cfg.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Filters — Product Area */}
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          <button onClick={() => setActiveArea('all')} className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${activeArea === 'all' ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-500'}`}>{t("allAreas")}</button>
          {allAreas.map((area) => {
            const cfg = areaConfig[area];
            const count = changelog.filter((r) => r.area === area).length;
            if (count === 0) return null;
            return (
              <button key={area} onClick={() => setActiveArea(area)} className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${activeArea === area ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border border-brand-300 dark:border-brand-500/40' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-500'}`}>
                {cfg.icon} {areaLabelMap[area] || cfg.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Content with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[160px_1fr] gap-10">
          {/* Year/Month Sidebar Nav */}
          <aside className="hidden lg:block">
            <div className="sticky top-8 space-y-4">
              <p className="text-xs font-bold text-gray-500 dark:text-slate-600 uppercase tracking-wider">{t("navigate")}</p>
              {years.map((year) => {
                const yearReleases = getReleasesByYear(year);
                return (
                  <div key={year}>
                    <a href={`#year-${year}`} className="text-sm font-bold text-gray-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                      {year}
                    </a>
                    <ul className="mt-1 space-y-0.5 ml-2">
                      {yearReleases.map((r) => (
                        <li key={r.version}>
                          <a
                            href={`#release-${r.slug}`}
                            className="text-xs text-gray-500 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors block py-0.5"
                          >
                            {r.version} <span className="text-gray-500 dark:text-slate-600">· {new Date(r.date).toLocaleString('en', { month: 'short' })}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-[18px] md:left-[22px] top-0 bottom-0 w-px bg-gray-200 dark:bg-slate-800" />

            <div className="space-y-12">
              {years.map((year) => {
                const yearReleases = filteredChangelog.filter((r) => new Date(r.date).getFullYear() === year);
                if (yearReleases.length === 0) return null;
                return (
                  <div key={year} id={`year-${year}`}>
                    {/* Year header */}
                    <div className="relative pl-12 md:pl-14 mb-8">
                      <div className="absolute left-[10px] md:left-[12px] top-0 w-[18px] h-[18px] rounded-full bg-gray-200 dark:bg-slate-700 border-[3px] border-gray-50 dark:border-slate-950 flex items-center justify-center">
                        <span className="text-[8px] font-bold text-gray-500 dark:text-slate-400">{year.toString().slice(2)}</span>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{year}</h2>
                    </div>

                    {yearReleases.map((release) => {
                      const isExpanded = expandedVersion === release.version;
                      const areaCfg = areaConfig[release.area];
                      return (
                        <div key={release.version} id={`release-${release.slug}`} className="relative pl-12 md:pl-14 scroll-mt-24">
                          {/* Timeline dot */}
                          <div className="absolute left-[12px] md:left-[14px] top-1 w-[14px] h-[14px] rounded-full bg-brand-600 border-[3px] border-gray-50 dark:border-slate-950" />

                          {/* Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                            <div className="flex items-center gap-3">
                              <Link href={`/changelog/${release.slug}`} className="text-sm font-mono font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2.5 py-1 rounded-md hover:bg-brand-100 dark:hover:bg-brand-500/20 transition-colors">
                                {release.version}
                              </Link>
                              {release.tag === 'latest' && (
                                <span className="text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">{t("latest")}</span>
                              )}
                              <span className="text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                                {areaCfg.icon} {areaLabelMap[release.area] || areaCfg.label}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500 dark:text-slate-500">{release.date}</span>
                          </div>

                          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            <Link href={`/changelog/${release.slug}`} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                              {release.title}
                            </Link>
                          </h2>

                          <p className="text-sm text-gray-600 dark:text-slate-400 mb-4 leading-relaxed">{release.summary}</p>

                          {/* Expand/Collapse toggle */}
                          <button onClick={() => setExpandedVersion(isExpanded ? null : release.version)} className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline mb-4">
                            {isExpanded ? 'Hide details ↑' : `Show ${release.entries.length} changes →`}
                          </button>

                          {/* Entries (expandable) */}
                          {isExpanded && (
                            <div className="space-y-3 mt-2">
                              {release.entries.map((entry, i) => {
                                const cfg = typeConfig[entry.type];
                                return (
                                  <div key={i} className="rounded-lg border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-3">
                                    <div className="flex items-start gap-3">
                                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${cfg.bg} ${cfg.color}`}>
                                        {cfg.icon} {typeLabelMap[entry.type] || cfg.label}
                                      </span>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed">{entry.text}</p>
                                        {entry.commit && (
                                          <a href={`https://github.com/servetarslan02/HookSniff/commit/${entry.commit}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-1 text-xs font-mono text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" /></svg>
                                            {entry.commit}
                                          </a>
                                        )}
                                        {entry.detail && <p className="text-xs text-gray-500 dark:text-slate-500 mt-1.5 leading-relaxed">{entry.detail}</p>}
                                        {entry.code && (
                                          <div className="mt-2 relative group">
                                            <pre className="bg-gray-900 dark:bg-slate-800 rounded-lg p-3 text-xs text-green-400 font-mono overflow-x-auto">{entry.code.snippet}</pre>
                                          </div>
                                        )}
                                        {entry.image && (
                                          <div className="mt-3 relative w-full h-[200px]">
                                            <Image src={entry.image.src} alt={entry.image.alt} fill className="rounded-lg border border-gray-200 dark:border-slate-700 object-cover" loading="lazy" />
                                            {entry.image.caption && <p className="text-xs text-gray-500 dark:text-slate-500 mt-1 text-center">{entry.image.caption}</p>}
                                          </div>
                                        )}
                                        {entry.video && (
                                          <div className="mt-3">
                                            <video src={entry.video.src} poster={entry.video.poster} controls className="rounded-lg border border-gray-200 dark:border-slate-700 w-full" />
                                            {entry.video.caption && <p className="text-xs text-gray-500 dark:text-slate-500 mt-1 text-center">{entry.video.caption}</p>}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 pt-10 border-t border-gray-200 dark:border-slate-700 text-center">
          <p className="text-gray-600 dark:text-slate-400 mb-4">{t('subscribeRss')}</p>
          <div className="flex items-center justify-center gap-4">
            <a href="https://github.com/servetarslan02/HookSniff" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" /></svg>
              GitHub
            </a>
            <Link href="/blog" className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:border-gray-400 dark:hover:border-slate-500 transition-colors">← Blog</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
