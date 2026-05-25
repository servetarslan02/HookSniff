import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AboutPageContent } from './content';

export const metadata: Metadata = {
  title: 'About HookSniff',
  description: 'Learn about HookSniff\'s mission to simplify webhook delivery for developers',
};

export default function AboutPage() {
  return (
      <Suspense fallback={<div className="flex items-center justify-center min-h-[40vh]"><div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>}>
        <AboutPageContent />
      </Suspense>
    );
}
