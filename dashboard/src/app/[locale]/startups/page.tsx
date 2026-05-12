import { Suspense } from 'react';
import type { Metadata } from 'next';
import { StartupsPageContent } from './content';

export const metadata: Metadata = {
  title: 'HookSniff for Startups',
  description: 'Affordable webhook infrastructure for growing startups',
};

export default function StartupsPage() {
  return (
      <Suspense fallback={<div className="flex items-center justify-center min-h-[40vh]"><div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>}>
        <StartupsPageContent />
      </Suspense>
    );
}
