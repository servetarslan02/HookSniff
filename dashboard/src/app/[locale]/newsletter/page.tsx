import { Suspense } from 'react';
import type { Metadata } from 'next';
import { NewsletterPageContent } from './content';

export const metadata: Metadata = {
  title: 'Newsletter',
  description: 'Stay updated with the latest HookSniff news and webhook insights',
};

// ISR: revalidate every hour
export const revalidate = 3600;

export default function NewsletterPage() {
  return (
      <Suspense fallback={<div className="flex items-center justify-center min-h-[40vh]"><div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>}>
        <NewsletterPageContent />
      </Suspense>
    );
}
