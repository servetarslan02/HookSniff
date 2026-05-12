import { Suspense } from 'react';
import type { Metadata } from 'next';
import { GetStartedPageContent } from './content';

export const metadata: Metadata = {
  title: 'Get Started',
  description: 'Get up and running with HookSniff in minutes',
};

export default function GetStartedPage() {
  return (
      <Suspense fallback={<div className="flex items-center justify-center min-h-[40vh]"><div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>}>
        <GetStartedPageContent />
      </Suspense>
    );
}
