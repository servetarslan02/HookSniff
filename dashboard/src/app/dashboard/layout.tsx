'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { useAuth } from '@/lib/store';
import { AuthGuard } from '@/components/AuthGuard';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: '📊' },
  { name: 'AI Merkezi', href: '/dashboard/ai-center', icon: '🧠' },
  { name: 'Endpoints', href: '/dashboard/endpoints', icon: '🔗' },
  { name: 'Deliveries', href: '/dashboard/deliveries', icon: '📦' },
  { name: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
];

function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-40">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-lg">
            🪝
          </div>
          <div>
            <div className="font-bold text-gray-900">Hookrelay</div>
            <div className="text-xs text-gray-500">Webhook Dashboard</div>
          </div>
        </div>
        <nav className="px-3 py-4 space-y-1">
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
      </aside>

      {/* Main content */}
      <div className="pl-64">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {navigation.find((n) => n.href === pathname)?.name || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              {user?.email || 'User'}
            </div>
            <button
              onClick={() => { logout(); router.push('/login'); }}
              className="text-sm text-gray-400 hover:text-red-600 transition"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
