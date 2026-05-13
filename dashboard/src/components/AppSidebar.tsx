'use client';

import { useState } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { clsx } from 'clsx';
import { useTranslations, useLocale } from 'next-intl';

interface NavItem {
  name: string;
  href?: string;
  icon: string;
  children?: { name: string; href: string }[];
}

interface NavSection {
  label: string;
  items: NavItem[];
}

export function AppSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const t = useTranslations('nav');
  const locale = useLocale();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const cleanPath = pathname.replace(new RegExp(`^/${locale}`), '') || '/';

  const isActive = (href: string) =>
    cleanPath === href || cleanPath.startsWith(href + '/');

  const toggleExpand = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const sections: NavSection[] = [
    {
      label: t('sectionCore') || 'Core',
      items: [
        { name: t('applications') || 'Applications', href: '/applications', icon: '📱' },
        { name: t('endpoints') || 'Endpoints', href: '/endpoints', icon: '🔗' },
        { name: 'Webhooks', href: '/webhooks', icon: '🪝' },
        { name: t('deliveries') || 'Deliveries', href: '/deliveries', icon: '📦' },
        {
          name: t('logs') || 'Events',
          icon: '📋',
          children: [
            { name: t('overview') || 'Overview', href: '/logs' },
            { name: t('live') || 'Live', href: '/deliveries' },
          ],
        },
      ],
    },
    {
      label: t('sectionTools') || 'Tools',
      items: [
        { name: t('playground') || 'Playground', href: '/playground', icon: '🧪' },
        { name: t('analytics') || 'Analytics', href: '/analytics', icon: '📊' },
        { name: t('schemas') || 'Schemas', href: '/schemas', icon: '📋' },
        { name: t('transforms') || 'Transforms', href: '/transforms', icon: '🔄' },
        { name: t('routing') || 'Routing', href: '/routing', icon: '🔀' },
        { name: t('inbound') || 'Inbound', href: '/inbound', icon: '📥' },
      ],
    },
    {
      label: t('sectionAdvanced') || 'Advanced',
      items: [
        { name: t('alerts') || 'Alerts', href: '/alerts', icon: '🚨' },
        { name: t('health') || 'Health', href: '/health', icon: '💚' },
        { name: t('rateLimiting') || 'Rate Limiting', href: '/rate-limiting', icon: '⚡' },
        { name: t('auditLog') || 'Audit Log', href: '/audit-log', icon: '📋' },
        { name: t('ssoSaml') || 'SSO / SAML', href: '/sso', icon: '🔐' },
        { name: t('customDomain') || 'Custom Domain', href: '/custom-domain', icon: '🌐' },
      ],
    },
    {
      label: t('sectionAccount') || 'Account',
      items: [
        { name: t('team') || 'Team', href: '/team', icon: '👥' },
        { name: t('billing') || 'Billing', href: '/billing', icon: '💳' },
        { name: t('apiKeys') || 'API Keys', href: '/api-keys', icon: '🔑' },
        { name: t('notifications') || 'Notifications', href: '/notifications', icon: '🔔' },
        { name: t('settings') || 'Settings', href: '/settings', icon: '⚙️' },
      ],
    },
  ];

  return (
    <aside className="flex flex-col h-full bg-gray-900 text-gray-300 w-64 min-w-[256px]">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700/50">
        <Link href="/" className="flex items-center space-x-2" onClick={onClose}>
          <span className="text-xl">🪝</span>
          <span className="text-lg font-bold text-white">HookSniff</span>
          <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-600 text-white rounded">
            Beta
          </span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-gray-400 hover:text-white"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const hasChildren = !!item.children?.length;
                const isExpanded = expanded[item.name];
                const itemActive = item.href
                  ? isActive(item.href)
                  : item.children?.some((c) => isActive(c.href));

                return (
                  <li key={item.name}>
                    {hasChildren ? (
                      <>
                        <button
                          onClick={() => toggleExpand(item.name)}
                          className={clsx(
                            'flex items-center justify-between w-full px-3 py-2 text-sm rounded-md transition-colors',
                            itemActive
                              ? 'text-white bg-gray-800'
                              : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
                          )}
                        >
                          <span className="flex items-center gap-3">
                            <span className="text-base">{item.icon}</span>
                            <span>{item.name}</span>
                          </span>
                          <svg
                            className={clsx(
                              'w-4 h-4 transition-transform',
                              isExpanded && 'rotate-90'
                            )}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        {isExpanded && (
                          <ul className="ml-9 mt-1 space-y-0.5">
                            {item.children!.map((child) => (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  onClick={onClose}
                                  className={clsx(
                                    'block px-3 py-1.5 text-sm rounded-md transition-colors',
                                    isActive(child.href)
                                      ? 'text-white bg-gray-800 border-l-2 border-indigo-500 -ml-3 pl-[calc(0.75rem+2px)]'
                                      : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
                                  )}
                                >
                                  {child.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : (
                      <Link
                        href={item.href!}
                        onClick={onClose}
                        className={clsx(
                          'flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors',
                          isActive(item.href!)
                            ? 'text-white bg-gray-800 border-l-2 border-indigo-500 -ml-3 pl-[calc(0.75rem+2px)]'
                            : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
                        )}
                      >
                        <span className="text-base">{item.icon}</span>
                        <span>{item.name}</span>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-700/50">
        <p className="text-[11px] text-gray-500">HookSniff v0.1.0</p>
      </div>
    </aside>
  );
}
