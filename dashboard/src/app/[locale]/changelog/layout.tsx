import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Changelog — HookSniff',
  description:
    'What\'s new in HookSniff. Product updates, new features, SDK releases, security patches, and improvements. Reliable webhook delivery for developers.',
  openGraph: {
    title: 'HookSniff Changelog',
    description: 'Product updates, new features, and improvements for HookSniff webhook delivery platform.',
    type: 'website',
    url: 'https://hooksniff.vercel.app/changelog',
    siteName: 'HookSniff',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HookSniff Changelog',
    description: 'Product updates, new features, and improvements for HookSniff webhook delivery platform.',
  },
  alternates: {
    types: {
      'application/rss+xml': 'https://hooksniff.vercel.app/blog/rss',
    },
  },
};

export default function ChangelogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
