'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
      <div className="text-center px-6">
        <div className="text-8xl mb-6">⚠️</div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Something went wrong</h1>
        <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-medium transition"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
