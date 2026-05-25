import { Suspense } from 'react';
import { CustomerStoryContent } from './CustomerStoryContent';

export const metadata = { title: 'Customer Stories — HookSniff' };

export function generateStaticParams() {
  return [{ slug: 'ecommerce-platform' }, { slug: 'fintech-startup' }, { slug: 'ai-agent-fleet' }];
}

export default function CustomerStoryPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[40vh]"><div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <CustomerStoryContent />
    </Suspense>
  );
}
