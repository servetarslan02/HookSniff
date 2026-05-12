import { Suspense } from 'react';
import type { Metadata } from 'next';
import { StripeWebhooksPageContent } from './content';

export const metadata: Metadata = {
  title: 'Stripe Webhooks',
  description: 'Never miss a Stripe payment event with reliable webhook delivery',
};

export default function StripeWebhooksPage() {
  return (
      <Suspense fallback={<div className="flex items-center justify-center min-h-[40vh]"><div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>}>
        <StripeWebhooksPageContent />
      </Suspense>
    );
}
