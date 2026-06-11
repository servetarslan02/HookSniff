'use client';

import { useTranslations } from 'next-intl';
import { PrefetchLink as Link } from '@/components/PrefetchLink';
import PublicNavbar from '@/components/PublicNavbar';
import { notFound, useParams } from 'next/navigation';
import { posts, authors, categoryGradients, getRelatedPosts, getAdjacentPosts } from '@/lib/blog/data';
import { sanitizeHighlightHtml } from '@/lib/sanitize';

export function BlogPostContent() {
  const params = useParams<{ slug: string }>();
  const t = useTranslations('blog');
  const slug = params?.slug;

  if (!slug || !posts[slug]) {
    notFound();
    return null;
  }

  const post = posts[slug];
  const author = authors[post.author] || { name: post.author, role: 'Author', initials: post.author.charAt(0) };
  const related = getRelatedPosts(slug, post.tags);
  const { prev, next } = getAdjacentPosts(slug);
  const gradient = categoryGradients[post.category] || 'from-gray-600 to-gray-700';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <PublicNavbar pageTitle={post.title} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${gradient} text-white`}>
              {post.category}
            </span>
            <span className="text-sm text-gray-500 dark:text-slate-500">{post.readTime}</span>
          </div>
          <h1 className="text-4xl md:text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-sm font-bold">
              {author.initials}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{author.name}</p>
              <p className="text-xs text-gray-500 dark:text-slate-500">{author.role} · {post.date}</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <article className="prose prose-gray dark:prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: sanitizeHighlightHtml(post.content) }} />
        </article>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-12">
            {post.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 rounded-full text-xs">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Prev/Next */}
        <div className="grid md:grid-cols-2 gap-4 mt-12">
          {prev && (
            <Link href={`/blog/${prev.slug}`} className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-500 transition group">
              <p className="text-xs text-gray-500 dark:text-slate-500 mb-1">← {t('previous')}</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">{prev.title}</p>
            </Link>
          )}
          {next && (
            <Link href={`/blog/${next.slug}`} className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-500 transition group text-right">
              <p className="text-xs text-gray-500 dark:text-slate-500 mb-1">{t('next')} →</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">{next.title}</p>
            </Link>
          )}
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('relatedPosts')}</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link key={r.slug} href={`/blog/${r.slug}`} className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-500 transition">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">{r.title}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-500">{r.readTime} · {r.date}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
