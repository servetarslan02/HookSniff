import { Suspense } from 'react';
import { SvixsContent } from './SvixsContent';

export const metadata = {
  title: 'Svix Alternatives — Best Webhook Services Compared (2026) | HookSniff',
  description: 'Looking for Svix alternatives? Compare HookSniff, Hookdeck, Hook0, and Convoy. Features, pricing, and honest pros/cons for each.',
};

export default function SvixAlternativesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[40vh]"><div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <SvixsContent />
    </Suspense>
  );
}
