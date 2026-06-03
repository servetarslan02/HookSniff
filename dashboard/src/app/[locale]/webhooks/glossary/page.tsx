import { Suspense } from 'react';
import { GlossaryContent } from './GlossaryContent';

export const metadata = {
  title: 'Webhook Glossary — Terms & Definitions | HookSniff',
  description: 'Comprehensive glossary of webhook and event-driven architecture terms. From HMAC signatures to dead letter queues, understand every concept.',
};

export default function GlossaryPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[40vh]"><div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <GlossaryContent />
    </Suspense>
  );
}
