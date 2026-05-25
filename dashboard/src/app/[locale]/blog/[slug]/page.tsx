import { Suspense } from 'react';
import { BlogPostContent } from './BlogPostContent';

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

export default function BlogPostPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[40vh]"><div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <BlogPostContent />
    </Suspense>
  );
}
