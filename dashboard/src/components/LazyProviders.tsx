'use client';

/**
 * Lazy-loaded non-critical providers.
 * Extracted to a client component so the layout (server component)
 * can import them without `ssr: false` restrictions.
 *
 * These components are not needed for initial render:
 * - CookieConsent: shows after page load
 * - AnalyticsWrapper: tracks events, no UI
 * - ServiceWorkerRegister: registers SW, no UI
 * - TanStackDBProvider: initializes DB collections
 */

import dynamic from 'next/dynamic';

const CookieConsent = dynamic(() => import('@/components/CookieConsent').then(m => m.CookieConsent), { ssr: false });
const AnalyticsWrapper = dynamic(() => import('@/components/AnalyticsWrapper').then(m => m.AnalyticsWrapper), { ssr: false });
const ServiceWorkerRegister = dynamic(() => import('@/components/ServiceWorkerRegister').then(m => m.ServiceWorkerRegister), { ssr: false });
const TanStackDBProvider = dynamic(() => import('@/components/TanStackDBProvider').then(m => m.TanStackDBProvider), { ssr: false });

export function LazyProviders({ children }: { children: React.ReactNode }) {
  return (
    <TanStackDBProvider>
      {children}
      <CookieConsent />
      <AnalyticsWrapper />
      <ServiceWorkerRegister />
    </TanStackDBProvider>
  );
}
