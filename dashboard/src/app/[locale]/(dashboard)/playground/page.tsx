import { Suspense } from 'react';
import { PlaygroundPageContent } from './content';

export default function PlaygroundPage() {
  return (
      <Suspense fallback={<div className="flex items-center justify-center min-h-[40vh]"><div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>}>
        <PlaygroundPageContent />
      </Suspense>
    );
}
