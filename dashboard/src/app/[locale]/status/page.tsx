import { Suspense } from 'react';
import type { Metadata } from 'next';
import { StatusPageContent } from './content';

export const metadata: Metadata = {
  title: 'System Status',
  description: 'Real-time status and uptime monitoring for HookSniff services',
};

export default function StatusPage() {
  return (
      <Suspense fallback={<div className="flex items-center justify-center min-h-[40vh]"><div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>}>
        <StatusPageContent />
      </Suspense>
    );
}
