import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Newsletter — HookSniff',
  description:
    'Get webhook tips, product updates, and engineering insights delivered to your inbox. 1-2x per week. No spam. Unsubscribe anytime.',
  openGraph: {
    title: 'The Webhook Digest — HookSniff Newsletter',
    description: 'Webhook tips, product updates, and engineering insights. Delivered to your inbox. No spam.',
    type: 'website',
    url: 'https://hooksniff.vercel.app/newsletter',
    siteName: 'HookSniff',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Webhook Digest — HookSniff Newsletter',
    description: 'Webhook tips, product updates, and engineering insights. Delivered to your inbox.',
  },
};

export default function NewsletterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
