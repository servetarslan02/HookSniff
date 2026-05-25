import { Suspense } from 'react';
import type { Metadata } from 'next';
import { CustomersPageContent } from './content';

export const metadata: Metadata = {
  title: 'Customer Stories',
  description: 'See how companies rely on HookSniff for webhook delivery',
};

export default function CustomersPage() {
  return (
      <Suspense fallback={<div className="flex items-center justify-center min-h-[40vh]"><div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>}>
        <CustomersPageContent />
      </Suspense>
    );
}
