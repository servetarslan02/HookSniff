import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/store';
import { ToastProvider } from '@/components/Toast';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ReactQueryProvider } from './providers';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Script from 'next/script';
import { CookieConsent } from '@/components/CookieConsent';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
});

import { routing } from '@/i18n/routing';

const locales = routing.locales;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'landing' });

  return {
    title: {
      default: 'HookSniff — Webhook Delivery Service',
      template: '%s | HookSniff',
    },
    description: t('hero.subtitle'),
    icons: {
      icon: '/favicon.svg',
      shortcut: '/favicon.svg',
      apple: '/apple-touch-icon.png',
    },
    openGraph: {
      title: 'HookSniff — Webhook Delivery Service',
      description: t('hero.subtitle'),
      url: 'https://hooksniff.vercel.app',
      siteName: 'HookSniff',
      type: 'website',
      locale: `${locale}_${locale.toUpperCase()}`,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'HookSniff — Webhook Delivery Service',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'HookSniff — Webhook Delivery Service',
      description: t('hero.subtitle'),
      images: ['/og-image.png'],
    },
    robots: {
      index: true,
      follow: true,
    },
    verification: {
      google: 'TQD51mWwYf0O3V5DviqzU5MZ4I-fKtrrEC66qPOPXzM',
    },
    alternates: {
      canonical: `https://hooksniff.vercel.app/${locale}`,
      languages: Object.fromEntries(
        locales.map((l) => [
          l,
          `https://hooksniff.vercel.app/${l}`,
        ])
      ),
    },
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || 'https://hooksniff.vercel.app'
    ),
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!(locales as readonly string[]).includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className="h-full" suppressHydrationWarning>
      <head>
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://static.cloudflareinsights.com" />
        {/* RSS Feed */}
        <link rel="alternate" type="application/rss+xml" title="HookSniff Blog RSS" href="/feed.xml" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('hooksniff-theme');
                  if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        {/* JSON-LD Structured Data — Organization + WebApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  name: 'HookSniff',
                  url: 'https://hooksniff.vercel.app',
                  logo: 'https://hooksniff.vercel.app/favicon.svg',
                  description: 'Webhook delivery service with automatic retries, signature verification, and real-time monitoring',
                  sameAs: [],
                },
                {
                  '@type': 'WebApplication',
                  name: 'HookSniff',
                  url: 'https://hooksniff.vercel.app',
                  description: 'Send, monitor, and manage webhooks with automatic retries, signature verification, and real-time delivery tracking',
                  applicationCategory: 'DeveloperApplication',
                  operatingSystem: 'Web',
                  offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'USD',
                    description: 'Free tier available',
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className={`h-full antialiased font-sans bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 ${inter.variable} ${jetbrainsMono.variable}`}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <AuthProvider>
              <ReactQueryProvider>
                <ToastProvider>
                  {children}
                  <CookieConsent />
                  <Analytics />
                  <SpeedInsights />
                  <Script
                    defer
                    src="https://static.cloudflareinsights.com/beacon.min.js"
                    data-cf-beacon='{"token": "27a349759d954a7c84fe74ded3846abe"}'
                  />
                  {/* Google Analytics 4 */}
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
                </ToastProvider>
              </ReactQueryProvider>
            </AuthProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
