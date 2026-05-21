import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { posts, authors, categoryGradients, getRelatedPosts, getAdjacentPosts, tokenizeCode } from '@/lib/blog/data';
import { sanitizeHighlightHtml } from '@/lib/sanitize';

// Revalidate every hour for ISR
export const revalidate = 3600;



export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = posts[slug];
  if (!post) return {};

  const description = post.content.split('\n\n').find(p => !p.startsWith('#') && !p.startsWith('```') && !p.startsWith('-'))?.slice(0, 160) || post.title;

  return {
    title: `${post.title} — HookSniff Blog`,
    description,
    metadataBase: new URL('https://hooksniff.vercel.app'),
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      images: [
        {
          url: '/og-blog.png',
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const t = await getTranslations('blog');
  const { slug } = await params;
  const post = posts[slug];
  if (!post) notFound();

  const related = getRelatedPosts(slug, post.tags);
  const { prev, next } = getAdjacentPosts(slug);
  const author = authors[post.author] || authors['HookSniff Team'];
  const gradient = categoryGradients[post.category] || 'from-gray-600 to-slate-700';

  // Extract ### headings for TOC
  const headings = post.content
    .split('\n\n')
    .filter(p => p.startsWith('### '))
    .map(p => p.replace('### ', ''));

  const hasTOC = headings.length >= 5;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Syntax highlighting styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .code-keyword { color: #c678dd; }
        .code-string { color: #98c379; }
        .code-comment { color: #5c6370; font-style: italic; }
        .code-function { color: #61afef; }
        .code-number { color: #d19a66; }
        .dark .code-keyword { color: #c678dd; }
        .dark .code-string { color: #98c379; }
        .dark .code-comment { color: #5c6370; font-style: italic; }
        .dark .code-function { color: #61afef; }
        .dark .code-number { color: #d19a66; }
      `}} />

      <nav className="border-b border-gray-200/50 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="items-center gap-3 flex">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">🪝 HookSniff</Link>
            <span className="text-gray-500 dark:text-slate-500">/</span>
            <Link href="/blog" className="text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors">{t("title")}</Link>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      <article className={`max-w-3xl mx-auto px-6 py-16 ${hasTOC ? 'lg:mr-64' : ''}`}>
        {/* Article Schema Markup for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: post.title,
              description: post.content.split('\n\n').find((p: string) => !p.startsWith('#') && !p.startsWith('```') && !p.startsWith('-'))?.slice(0, 160) || post.title,
              datePublished: post.date,
              dateModified: post.date,
              author: {
                '@type': 'Person',
                name: post.author,
              },
              publisher: {
                '@type': 'Organization',
                name: 'HookSniff',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://hooksniff.vercel.app/favicon.svg',
                },
              },
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': `https://hooksniff.vercel.app/blog/${slug}`,
              },
              keywords: post.tags.join(', '),
            }),
          }}
        />
        {/* Cover Image / Gradient Header */}
        <div className={`relative rounded-xl bg-linear-to-br ${gradient} p-8 mb-8 overflow-hidden`}>
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.5" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots)" />
            </svg>
          </div>
          <div className="relative z-10">
            <span className="inline-block text-xs font-medium bg-white/20 text-white px-3 py-1 rounded-full backdrop-blur-xs mb-4">
              {post.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">{post.title}</h1>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="text-sm text-gray-500 dark:text-slate-500">{post.date}</span>
            <span className="text-sm text-gray-500 dark:text-slate-600">·</span>
            <span className="text-sm text-gray-500 dark:text-slate-500">{post.readTime}</span>
          </div>
          {/* Author */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold">{author.initials}</div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">By {author.name}</p>
              <p className="text-xs text-gray-500 dark:text-slate-500">{author.role} · Published on {post.date}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {post.tags.map(tag => (
              <span key={tag} className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-500 px-2 py-0.5 rounded-sm">#{tag}</span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          {post.content.split('\n\n').map((paragraph, i) => {
            if (paragraph.startsWith('### ')) {
              const headingText = paragraph.replace('### ', '');
              const headingId = headingText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
              return <h3 key={i} id={headingId} className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4 scroll-mt-24">{headingText}</h3>;
            }
            if (paragraph.startsWith('```')) {
              const firstLine = paragraph.split('\n')[0];
              const language = firstLine.replace('```', '').trim() || 'text';
              const lines = paragraph.split('\n').slice(1, -1);
              const rawCode = lines.join('\n');
              const highlighted = tokenizeCode(rawCode, language);
              return (
                <div key={i} className="my-4 rounded-lg overflow-hidden">
                  <div className="bg-gray-200 dark:bg-slate-700 px-4 py-1.5 flex items-center justify-between">
                    <span className="text-xs font-mono text-gray-600 dark:text-slate-400">{language}</span>
                    <span className="text-xs text-gray-500 dark:text-slate-500">{lines.length} lines</span>
                  </div>
                  <pre className="bg-gray-100 dark:bg-slate-800 p-4 overflow-x-auto text-sm">
                    <code className="text-gray-800 dark:text-slate-200" dangerouslySetInnerHTML={{ __html: sanitizeHighlightHtml(highlighted) }} />
                  </pre>
                </div>
              );
            }
            if (paragraph.startsWith('> ')) {
              const lines = paragraph.split('\n');
              return (
                <blockquote key={i} className="border-l-4 border-brand-300 dark:border-brand-600 pl-4 my-4 italic text-gray-600 dark:text-slate-400">
                  {lines.map((line, j) => (
                    <p key={j}>{line.replace(/^>\s*/, '')}</p>
                  ))}
                </blockquote>
              );
            }
            if (paragraph.startsWith('| ')) {
              const rows = paragraph.split('\n').filter(r => r.startsWith('|'));
              const headerRow = rows[0];
              const dataRows = rows.slice(2); // skip header and separator
              const headers = headerRow.split('|').filter(Boolean).map(h => h.trim());
              return (
                <div key={i} className="overflow-x-auto my-4">
                  <table className="min-w-full text-sm border border-gray-200 dark:border-slate-700 rounded-lg">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-slate-800">
                        {headers.map((h, j) => (
                          <th key={j} className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-slate-300 border-b border-gray-200 dark:border-slate-700">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dataRows.map((row, j) => {
                        const cells = row.split('|').filter(Boolean).map(c => c.trim());
                        return (
                          <tr key={j} className="border-b border-gray-200 dark:border-slate-700 last:border-0">
                            {cells.map((cell, k) => (
                              <td key={k} className="px-3 py-2 text-gray-600 dark:text-slate-400">{cell}</td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            }
            if (paragraph.startsWith('- **')) {
              const items = paragraph.split('\n');
              return (
                <ul key={i} className="space-y-2 my-4">
                  {items.map((item, j) => (
                    <li key={j} className="text-gray-600 dark:text-slate-400 leading-relaxed">{item.replace('- ', '')}</li>
                  ))}
                </ul>
              );
            }
            if (paragraph.startsWith('- ')) {
              const items = paragraph.split('\n');
              return (
                <ul key={i} className="list-disc list-inside space-y-1 my-4 text-gray-600 dark:text-slate-400">
                  {items.map((item, j) => <li key={j}>{item.replace('- ', '')}</li>)}
                </ul>
              );
            }
            if (paragraph.match(/^\d+\./)) {
              const items = paragraph.split('\n');
              return (
                <ol key={i} className="list-decimal list-inside space-y-1 my-4 text-gray-600 dark:text-slate-400">
                  {items.map((item, j) => <li key={j}>{item.replace(/^\d+\.\s*/, '')}</li>)}
                </ol>
              );
            }
            if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
              return <p key={i} className="text-gray-900 dark:text-white font-semibold my-4">{paragraph.replace(/\*\*/g, '')}</p>;
            }
            if (paragraph.startsWith('*') && paragraph.endsWith('*')) {
              return <p key={i} className="text-gray-500 dark:text-slate-400 italic my-4">{paragraph.replace(/^\*|\*$/g, '')}</p>;
            }
            return <p key={i} className="text-gray-600 dark:text-slate-400 leading-relaxed my-4">{paragraph}</p>;
          })}
        </div>

        {/* Share */}
        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-slate-700 flex items-center gap-4">
          <span className="text-sm text-gray-500 dark:text-slate-500">Share:</span>
          <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://hooksniff.vercel.app/blog/${slug}`)}`} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">{t("twitter")}</a>
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://hooksniff.vercel.app/blog/${slug}`)}`} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">{t("linkedin")}</a>
          <a href={`https://news.ycombinator.com/submitlink?u=${encodeURIComponent(`https://hooksniff.vercel.app/blog/${slug}`)}&t=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">{t("hackerNews")}</a>
        </div>

        {/* Related Posts */}
        {related.length > 0 && (
          <div className="mt-10 pt-6 border-t border-gray-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("relatedPosts")}</h3>
            <div className="grid gap-4">
              {related.map((r) => (
                <Link key={r.slug} href={`/blog/${r.slug}`} className="block group">
                  <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4 hover:border-brand-300 dark:hover:border-brand-500/40 transition-colors">
                    <span className="text-xs text-brand-600 dark:text-brand-400">{r.category}</span>
                    <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mt-1">{r.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-slate-500 mt-1">{r.date} · {r.readTime}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Previous / Next Navigation */}
        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prev ? (
              <Link href={`/blog/${prev.slug}`} className="group block bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4 hover:border-brand-300 dark:hover:border-brand-500/40 transition-colors">
                <span className="text-xs text-gray-500 dark:text-slate-500">← Previous</span>
                <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mt-1 text-sm">{prev.title}</h4>
                <span className="text-xs text-brand-600 dark:text-brand-400">{prev.category}</span>
              </Link>
            ) : <div />}
            {next && (
              <Link href={`/blog/${next.slug}`} className="group block bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4 hover:border-brand-300 dark:hover:border-brand-500/40 transition-colors text-right">
                <span className="text-xs text-gray-500 dark:text-slate-500">Next →</span>
                <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mt-1 text-sm">{next.title}</h4>
                <span className="text-xs text-brand-600 dark:text-brand-400">{next.category}</span>
              </Link>
            )}
          </div>
        </div>

        <div className="mt-8">
          <Link href="/blog" className="text-brand-600 dark:text-brand-400 hover:underline">{t('backToList')}</Link>
        </div>
      </article>

      {/* Floating Table of Contents (desktop only) */}
      {hasTOC && (
        <nav className="hidden lg:block fixed right-4 top-24 w-56 max-h-[calc(100vh-8rem)] overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider mb-3">{t("onThisPage")}</h4>
            <ul className="space-y-1.5">
              {headings.map((h, i) => {
                const headingId = h.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                return (
                  <li key={i}>
                    <a
                      href={`#${headingId}`}
                      className="block text-sm text-gray-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors truncate"
                    >
                      {h}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      )}
    </div>
  );
}
