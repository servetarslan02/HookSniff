'use client';

import { useTranslations } from 'next-intl';
import React, { useState, useEffect, useRef } from 'react';
import { PrefetchLink as Link } from '@/components/PrefetchLink';
import PublicNavbar from '@/components/PublicNavbar';
import { Star } from '@/components/icons';

const POSTS_PER_PAGE = 6;

import { posts } from './posts';

const categoryKeys = ['catAll', 'catAnnouncement', 'catEngineering', 'catStandard', 'catChangelog', 'catIntegration', 'catAiAgents'];

export function BlogPageContent() {
  const t = useTranslations('blog');
  const tc = useTranslations('common');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('catAll');
  const [currentPage, setCurrentPage] = useState(1);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterMessage, setNewsletterMessage] = useState('');

  const filteredPosts = posts.filter(post => {
    const title = t(post.titleKey);
    const excerpt = t(post.excerptKey);
    const matchesSearch = !searchQuery.trim() || title.toLowerCase().includes(searchQuery.toLowerCase()) || excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'catAll' || post.categoryKey === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const [displayCount, setDisplayCount] = useState(POSTS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(0, displayCount);
  const hasMore = displayCount < filteredPosts.length;

  // Reset display count when filter changes
  const prevFilterRef = useRef(`${activeCategory}-${searchQuery}`);
  useEffect(() => {
    const key = `${activeCategory}-${searchQuery}`;
    if (key !== prevFilterRef.current) {
      setDisplayCount(POSTS_PER_PAGE);
      prevFilterRef.current = key;
    }
  }, [activeCategory, searchQuery]);

  const handleCategoryClick = (catKey: string) => {
    setActiveCategory(catKey);
    setCurrentPage(1);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterStatus('loading');
    setNewsletterMessage('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setNewsletterStatus('success');
        setNewsletterMessage(data.message);
        setNewsletterEmail('');
      } else {
        setNewsletterStatus('error');
        setNewsletterMessage(data.error || tc('somethingWentWrong'));
      }
    } catch {
      setNewsletterStatus('error');
      setNewsletterMessage(tc('networkError'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <PublicNavbar pageTitle={t("title")} />

      <main className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t("title")}</h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">{t('desc')}</p>
        </div>

        {/* Newsletter */}
        <div className="bg-linear-to-r from-brand-50 to-blue-50 dark:from-brand-500/10 dark:to-blue-500/10 rounded-xl border border-brand-100 dark:border-brand-500/20 p-6 mb-10">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">{t("subscribe")}</h3>
              <p className="text-sm text-gray-600 dark:text-slate-400">{t('desc')}</p>
            </div>
            <form className="flex gap-2" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                placeholder="you@example.com"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-hidden w-64"
              />
              <button
                type="submit"
                disabled={newsletterStatus === 'loading'}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {newsletterStatus === 'loading' ? t('subscribing') : t('subscribeBtn')}
              </button>
            </form>
          </div>
          {newsletterMessage && (
            <p className={`text-sm mt-3 ${newsletterStatus === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {newsletterMessage}
            </p>
          )}
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                aria-label={t("clearSearch")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
              >
                ✕
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-sm text-gray-500 dark:text-slate-500 mt-2">
              {t('postsFound', { count: filteredPosts.length })}
            </p>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categoryKeys.map((catKey) => (
            <button
              key={catKey}
              onClick={() => handleCategoryClick(catKey)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors ${
                activeCategory === catKey
                  ? 'bg-brand-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-500/40'
              }`}
            >
              {t(catKey)}
            </button>
          ))}
        </div>

        {/* Featured Post */}
        {currentPage === 1 && activeCategory === 'catAll' && !searchQuery && filteredPosts.filter((p) => p.featured).map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="block group mb-8">
            <article className="bg-linear-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-700 p-8 hover:border-brand-300 dark:hover:border-brand-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-medium bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 px-2.5 py-1 rounded-full"><Star size={14} strokeWidth={1.75} className="inline-block align-text-bottom mr-1 text-amber-500" /> {t('featured')}</span>
                <span className="text-xs font-medium bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 px-2.5 py-1 rounded-full">{t(post.categoryKey)}</span>
                <span className="text-sm text-gray-500 dark:text-slate-500">{post.date}</span>
                <span className="text-sm text-gray-500 dark:text-slate-600">·</span>
                <span className="text-sm text-gray-500 dark:text-slate-500">{post.readTime}</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{t(post.titleKey)}</h2>
              <p className="text-gray-600 dark:text-slate-400 leading-relaxed text-lg">{t(post.excerptKey)}</p>
              <div className="flex gap-2 mt-4">
                {post.tags.map(tag => (
                  <span key={tag} className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-500 px-2 py-0.5 rounded-sm">#{tag}</span>
                ))}
              </div>
            </article>
          </Link>
        ))}

        {/* Post Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {(currentPage === 1 && activeCategory === 'catAll' && !searchQuery
            ? paginatedPosts.filter((p) => !p.featured)
            : paginatedPosts
          ).map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
              <article className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 hover:border-brand-300 dark:hover:border-brand-500/40 transition-colors h-full">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-medium bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 px-2.5 py-1 rounded-full">{t(post.categoryKey)}</span>
                  <span className="text-sm text-gray-500 dark:text-slate-500">{post.date}</span>
                  <span className="text-sm text-gray-500 dark:text-slate-600">·</span>
                  <span className="text-sm text-gray-500 dark:text-slate-500">{post.readTime}</span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{t(post.titleKey)}</h2>
                <p className="text-gray-600 dark:text-slate-400 leading-relaxed text-sm">{t(post.excerptKey)}</p>
                <div className="flex gap-2 mt-3">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-500 px-2 py-0.5 rounded-sm">#{tag}</span>
                  ))}
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* Show More */}
        {hasMore && (
          <div className="flex items-center justify-center mt-10">
            <button
              onClick={() => setDisplayCount((c) => c + POSTS_PER_PAGE)}
              className="px-6 py-2.5 text-sm font-medium text-brand-600 dark:text-brand-400 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:border-brand-300 dark:hover:border-brand-500/40 transition-colors"
            >
              {t('showMore') || 'Show more'} ({filteredPosts.length - displayCount} {t('remaining') || 'remaining'})
            </button>
          </div>
        )}

        {/* RSS */}
        <div className="text-center mt-12">
          <a href="/blog/rss" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a1 1 0 000 2c5.523 0 10 4.477 10 10a1 1 0 102 0C17 8.373 11.627 3 5 3z"/><path d="M4 9a1 1 0 000 2 4 4 0 014 4 1 1 0 102 0 6 6 0 00-6-6z"/><circle cx="5" cy="15" r="2"/></svg>
            {t('subscribeRss')}
          </a>
        </div>
      </main>
    </div>
  );
}
