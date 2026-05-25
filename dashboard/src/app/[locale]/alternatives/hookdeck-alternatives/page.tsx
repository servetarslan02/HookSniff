import { Suspense } from 'react';
import { HookdecksContent } from './HookdecksContent';

export const metadata = {
  title: 'Hookdeck Alternatives — Best Webhook Services Compared (2026) | HookSniff',
  description: 'Looking for Hookdeck alternatives? Compare HookSniff, Svix, Hook0, and Convoy. Open-source, self-hosted, and affordable options.',
};

export default function HookdeckAlternativesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[40vh]"><div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <HookdecksContent />
    </Suspense>
  );
}
