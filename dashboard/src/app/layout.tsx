import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/store';
import { ToastProvider } from '@/components/Toast';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: {
    default: 'Hookrelay — Webhook Delivery Service',
    template: '%s | Hookrelay',
  },
  description: 'Reliable webhook delivery for developers. Monitor, retry, and manage webhooks with real-time analytics and intelligent routing.',
  openGraph: {
    title: 'Hookrelay — Webhook Delivery Service',
    description: 'Reliable webhook delivery for developers. Monitor, retry, and manage webhooks with real-time analytics and intelligent routing.',
    url: 'https://hookrelay.dev',
    siteName: 'Hookrelay',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hookrelay — Webhook Delivery Service',
    description: 'Reliable webhook delivery for developers. Monitor, retry, and manage webhooks with real-time analytics and intelligent routing.',
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://hookrelay.dev'
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('hookrelay-theme');
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
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
