import { Suspense } from 'react';
import { WebhooksContent } from './WebhooksContent';

export const metadata = {
  title: 'Webhooks — Guides, Glossary, Tools & Providers | HookSniff',
  description: 'Everything about webhooks: guides, glossary, comparison tools, and provider integrations. Learn, implement, and scale webhooks with HookSniff.',
};

export default function WebhooksPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[40vh]"><div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <WebhooksContent />
    </Suspense>
  );
}
