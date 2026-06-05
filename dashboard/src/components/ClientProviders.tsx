'use client';

import dynamic from 'next/dynamic';

const CookieConsent = dynamic(() => import('@/components/CookieConsent').then(m => m.CookieConsent), { ssr: false });
const AnalyticsWrapper = dynamic(() => import('@/components/AnalyticsWrapper').then(m => m.AnalyticsWrapper), { ssr: false });
const ServiceWorkerRegister = dynamic(() => import('@/components/ServiceWorkerRegister').then(m => m.ServiceWorkerRegister), { ssr: false });
const TanStackDBProvider = dynamic(() => import('@/components/TanStackDBProvider').then(m => m.TanStackDBProvider), { ssr: false });

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <TanStackDBProvider>
      {children}
      <CookieConsent />
      <AnalyticsWrapper />
      <ServiceWorkerRegister />
    </TanStackDBProvider>
  );
}
