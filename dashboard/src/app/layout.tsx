import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/store';
import { ToastProvider } from '@/components/Toast';

export const metadata: Metadata = {
  title: 'Hookrelay — Webhook Delivery Service',
  description: 'Reliable webhook delivery for developers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className="h-full antialiased font-sans">
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
