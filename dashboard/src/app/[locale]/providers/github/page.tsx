import { Suspense } from 'react';
import type { Metadata } from 'next';
import { GitHubWebhooksPageContent } from './content';

export const metadata: Metadata = {
  title: 'GitHub Webhooks',
  description: 'Automate your CI/CD with reliable GitHub webhook delivery',
};

export default function GitHubWebhooksPage() {
  return (
      <Suspense fallback={<div className="flex items-center justify-center min-h-[40vh]"><div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>}>
        <GitHubWebhooksPageContent />
      </Suspense>
    );
}
