import { Suspense } from 'react';
import { GuidesContent } from './GuidesContent';

export const metadata = {
  title: 'Webhook Guides — Everything You Need to Know | HookSniff',
  description: 'Comprehensive webhook guides covering implementation, security, best practices, and troubleshooting. From beginner to advanced.',
};

export default function WebhookGuidesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[40vh]"><div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <GuidesContent />
    </Suspense>
  );
}
