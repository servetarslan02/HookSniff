import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import './globals.css';
import { AuthProvider } from '@/lib/store';
import { ToastProvider } from '@/components/Toast';
import { ThemeProvider } from '@/components/ThemeProvider';

const locales = ['en', 'tr', 'de', 'ja', 'pt-BR', 'es', 'fr', 'ko'];

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
    openGraph: {
      title: 'HookSniff — Webhook Delivery Service',
      description: t('hero.subtitle'),
      url: 'https://hooksniff.is-a.dev',
      siteName: 'HookSniff',
      type: 'website',
      locale: locale === 'pt-BR' ? 'pt_BR' : `${locale}_${locale.toUpperCase()}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'HookSniff — Webhook Delivery Service',
      description: t('hero.subtitle'),
    },
    robots: {
      index: true,
      follow: true,
    },
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || 'https://hooksniff.is-a.dev'
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
      <body className="h-full antialiased font-sans bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <AuthProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </AuthProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
