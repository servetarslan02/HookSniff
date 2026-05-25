import { Suspense } from 'react';
import type { Metadata } from 'next';
import { WhatIsWebhookPageContent } from './content';

export const metadata: Metadata = {
  title: 'What Is a Webhook?',
  description: 'Learn what webhooks are, how they work, and why they matter for modern applications',
};

export default function WhatIsWebhookPage() {
  return (
      <Suspense fallback={<div className="flex items-center justify-center min-h-[40vh]"><div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>}>
        <WhatIsWebhookPageContent />
      </Suspense>
    );
}
