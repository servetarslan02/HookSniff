'use client';

import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Script from 'next/script';

const LS_KEY = 'hooksniff_cookie_consent';

function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;

  // Check localStorage (set by ConsentToggle as "true"/"false", or CookieConsent as "accepted"/"rejected")
  const lsValue = localStorage.getItem(LS_KEY);
  if (lsValue === 'false' || lsValue === 'rejected') return false;
  if (lsValue === 'true' || lsValue === 'accepted') return true;

  // Check cookie (set by either component)
  const cookies = document.cookie.split(';');
  for (const c of cookies) {
    const [name, val] = c.trim().split('=');
    if (name === LS_KEY || name === 'cookie_consent') {
      if (val === 'rejected' || val === 'false') return false;
      if (val === 'accepted' || val === 'true') return true;
    }
  }

  // No consent recorded — GDPR-safe default: don't load
  return false;
}

/**
 * Conditionally loads analytics scripts based on cookie consent.
 * Only loads Vercel Analytics, GA4, Cloudflare Insights when user accepted cookies.
 */
export function AnalyticsWrapper() {
  const [consent, setConsent] = useState<boolean | null>(null);

  useEffect(() => {
    setConsent(hasAnalyticsConsent());

    // Listen for cross-tab consent changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LS_KEY) {
        setConsent(hasAnalyticsConsent());
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Poll for same-tab changes (localStorage doesn't fire events in same tab)
    const interval = setInterval(() => {
      const current = hasAnalyticsConsent();
      setConsent(prev => (prev !== current ? current : prev));
    }, 1500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  if (!consent) return null;

  return (
    <>
      <Analytics />
      <SpeedInsights />
      <Script
        defer
        src="https://static.cloudflareinsights.com/beacon.min.js"
        data-cf-beacon='{"token": "27a349759d954a7c84fe74ded3846abe"}'
      />
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-BKZM7CMBJR"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-BKZM7CMBJR');
        `}
      </Script>
    </>
  );
}
