'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { AuthProvider, useAuth } from '@/lib/store';
import { ToastProvider } from '@/components/Toast';
import Footer from '@/components/Footer';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: '📊' },
  { name: 'Endpoints', href: '/dashboard/endpoints', icon: '🔗' },
  { name: 'Deliveries', href: '/dashboard/deliveries', icon: '📦' },
  { name: 'Billing', href: '/dashboard/billing', icon: '💳' },
  { name: 'Playground', href: '/dashboard/playground', icon: '🧪' },
  { name: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
];

function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, apiKey } = useAuth();

  const maskedKey = apiKey ? `${apiKey.slice(0, 8)}••••••••` : 'hr_live_••••••••';
  const initials = user?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-40 flex flex-col">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-lg">
              🪝
            </div>
            <div>
              <div className="font-bold text-gray-900">Hookrelay</div>
              <div className="text-xs text-gray-500">Webhook Dashboard</div>
            </div>
          </Link>
        </div>
        <nav className="px-3 py-4 space-y-1 flex-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition',
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 pb-4 border-t border-gray-100 pt-3">
          <Link
            href="/docs"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition"
          >
            <span className="text-lg">📖</span>
            Documentation
          </Link>
        </div>
      </aside>

      <div className="pl-64 flex flex-col flex-1">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-30">
          <h1 className="text-lg font-semibold text-gray-900">
            {navigation.find((n) => n.href === pathname)?.name || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              API Key: <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">{maskedKey}</code>
            </div>
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-medium">
              {initials}
            </div>
            <button
              onClick={() => { logout(); router.push('/login'); }}
              className="text-xs text-gray-400 hover:text-gray-600 transition"
              title="Sign out"
            >
              ↗
            </button>
          </div>
        </header>

        <main className="p-8 flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <DashboardShell>{children}</DashboardShell>
      </ToastProvider>
    </AuthProvider>
  );
}
