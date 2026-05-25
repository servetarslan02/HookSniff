import { Suspense } from 'react';
import type { Metadata } from 'next';
import { TermsPageContent } from './content';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'HookSniff terms of service and usage policies',
};

export default function TermsPage() {
  return (
      <Suspense fallback={<div className="flex items-center justify-center min-h-[40vh]"><div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>}>
        <TermsPageContent />
      </Suspense>
    );
}
