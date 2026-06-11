'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle } from '@/components/icons';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('error');

  useEffect(() => {
    console.error('Page error:', error);

    // Auto-reload on ChunkLoadError (stale Vercel cache after deploy)
    // Only once per session to prevent infinite reload loops
    if (
      error.name === 'ChunkLoadError' ||
      error.message?.includes('ChunkLoadError') ||
      error.message?.includes('Failed to load chunk')
    ) {
      const reloaded = sessionStorage.getItem('chunk_error_reloaded');
      if (!reloaded) {
        sessionStorage.setItem('chunk_error_reloaded', '1');
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
      <div className="text-center px-6">
        <div className="flex justify-center mb-6 text-amber-500"><AlertTriangle size={72} strokeWidth={1.5} /></div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t('somethingWentWrong')}</h1>
        <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
          {t('unexpectedError')}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-medium transition"
        >
          {t('tryAgain')}
        </button>
      </div>
    </div>
  );
}
