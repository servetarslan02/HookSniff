'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/lib/store';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  const router = useRouter();
  const t = useTranslations('common');

  useEffect(() => {
    if (!isLoading && !token) {
      router.push('/login');
    }
  }, [isLoading, token, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 h-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-gray-500">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-gray-500">{t('redirecting')}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
