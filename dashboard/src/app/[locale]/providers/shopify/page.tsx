import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ShopifyWebhooksPageContent } from './content';

export const metadata: Metadata = {
  title: 'Shopify Webhooks',
  description: 'Reliably deliver Shopify webhooks with signature verification and retries',
};

export default function ShopifyWebhooksPage() {
  return (
      <Suspense fallback={<div className="flex items-center justify-center min-h-[40vh]"><div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>}>
        <ShopifyWebhooksPageContent />
      </Suspense>
    );
}
