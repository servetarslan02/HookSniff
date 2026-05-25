import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SecurityPageContent } from './content';

export const metadata: Metadata = {
  title: 'Security',
  description: 'Learn how HookSniff secures your webhook deliveries',
};

export default function SecurityPage() {
  return (
      <Suspense fallback={<div className="flex items-center justify-center min-h-[40vh]"><div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>}>
        <SecurityPageContent />
      </Suspense>
    );
}
