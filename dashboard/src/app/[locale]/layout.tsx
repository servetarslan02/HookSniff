import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/store';
import { ToastProvider } from '@/components/Toast';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
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

const locales = ['en', 'tr'];

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
    alternates: {
      canonical: `https://hooksniff.vercel.app/${locale}`,
      languages: Object.fromEntries(
        ['en', 'tr'].map((l) => [
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
  if (!locales.includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className="h-full" suppressHydrationWarning>
      <head>
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
      </head>
      <body className={`h-full antialiased font-sans bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 ${inter.variable} ${jetbrainsMono.variable}`}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <AuthProvider>
              <ToastProvider>
                {children}
                <CookieConsent />
                <Analytics />
                <SpeedInsights />
              </ToastProvider>
            </AuthProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
