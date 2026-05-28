'use client';

import { useState, useCallback, useEffect, useRef, useMemo, Activity, type ReactNode } from 'react';
import dynamic from 'next/dynamic';

export interface Tab {
  key: string;
  label: string;
  icon?: ReactNode;
  /** Component to render (supports dynamic import factories) */
  content: ReactNode | (() => ReactNode);
  /** Prefetch this tab's content on hover (default: true) */
  prefetch?: boolean;
  /** Badge or count to show next to label */
  badge?: string | number;
}

interface TabbedSectionProps {
  tabs: Tab[];
  defaultTab?: string;
  /** URL param key for tab state persistence (default: 'tab') */
  urlParam?: string;
  /** Callback when tab changes */
  onTabChange?: (key: string) => void;
  /** Fade-in animation duration in ms (default: 200) */
  fadeMs?: number;
  /** Extra class names for the tab bar */
  tabClassName?: string;
  /** Extra class names for the content area */
  contentClassName?: string;
  /** Persist active tab in URL (default: true). Disable for nested tabs to avoid param conflicts. */
  persistUrl?: boolean;
}

/**
 * Read a URL search param safely (client-only).
 */
function getUrlParam(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get(key);
}

/**
 * Production-grade tabbed section with lazy rendering and hover prefetch.
 */
export function TabbedSection({
  tabs,
  defaultTab,
  urlParam = 'tab',
  onTabChange,
  fadeMs: _fadeMs = 150,
  tabClassName,
  contentClassName,
  persistUrl = true,
}: TabbedSectionProps) {
  const tabsMap = useMemo(() => new Map(tabs.map(t => [t.key, t])), [tabs]);

  // Resolve initial tab: URL param > default > first tab
  const resolveInitial = useCallback((): string => {
    if (persistUrl) {
      const urlTab = getUrlParam(urlParam);
      if (urlTab && tabsMap.has(urlTab)) return urlTab;
    }
    return defaultTab || tabs[0]?.key || '';
  }, [urlParam, tabs, defaultTab, persistUrl, tabsMap]);

  const [active, setActive] = useState<string>(resolveInitial);

  // FIX: visited includes the active tab from URL on init
  const [visited, setVisited] = useState<Set<string>>(() => new Set([resolveInitial()]));

  const contentRef = useRef<HTMLDivElement>(null);

  // Sync with URL on popstate (browser back/forward)
  useEffect(() => {
    if (!persistUrl) return;

    const handlePopState = () => {
      const urlTab = getUrlParam(urlParam);
      const resolved = urlTab && tabsMap.has(urlTab)
        ? urlTab
        : defaultTab || tabs[0]?.key || '';
      setActive(resolved);
      setVisited((prev) => prev.has(resolved) ? prev : new Set(prev).add(resolved));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [persistUrl, urlParam, tabs, defaultTab, tabsMap]);

  // Mark tab as visited
  const visit = useCallback((key: string) => {
    setVisited((prev) => prev.has(key) ? prev : new Set(prev).add(key));
  }, []);

  // Handle tab click
  const handleTabClick = useCallback(
    (key: string) => {
      if (key === active) return;
      setActive(key);
      visit(key);
      onTabChange?.(key);

      // Update URL param
      if (persistUrl && typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        if (key === (defaultTab || tabs[0]?.key)) {
          url.searchParams.delete(urlParam);
        } else {
          url.searchParams.set(urlParam, key);
        }
        window.history.replaceState(null, '', url.toString());
      }
    },
    [active, visit, onTabChange, urlParam, defaultTab, tabs, persistUrl]
  );

  // Prefetch on hover
  const handleTabHover = useCallback((key: string) => visit(key), [visit]);

  // Guard: if active tab no longer exists, reset to first
  useEffect(() => {
    if (!tabsMap.has(active) && tabs.length > 0) {
      const fallback = defaultTab || tabs[0].key;
      setActive(fallback);
      visit(fallback);
    }
  }, [tabs, active, defaultTab, visit, tabsMap]);

  return (
    <div className="space-y-6">
      {/* Tab Bar */}
      <div className={`border-b border-gray-200 dark:border-slate-700 overflow-x-auto ${tabClassName ?? ''}`}>
        <nav className="flex gap-1 min-w-max" role="tablist">
          {tabs.map((tab) => {
            const isActive = tab.key === active;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.key}`}
                onClick={() => handleTabClick(tab.key)}
                onMouseEnter={tab.prefetch !== false ? () => handleTabHover(tab.key) : undefined}
                className={`
                  relative px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap inline-flex items-center
                  ${isActive
                    ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400'
                    : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'
                  }
                `}
              >
                {tab.icon && <span className="mr-1.5 inline-flex items-center">{tab.icon}</span>}
                {tab.label}
                {tab.badge != null && (
                  <span className={`ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium rounded-full ${
                    isActive ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div ref={contentRef} className={`${contentClassName} transition-opacity duration-150`}>
        {tabs.map((tab) => {
          if (!visited.has(tab.key)) return null;
          const isActive = tab.key === active;
          return (
            <Activity key={tab.key} mode={isActive ? 'visible' : 'hidden'}>
              <div id={`tabpanel-${tab.key}`} role="tabpanel" className={isActive ? 'animate-in fade-in duration-200' : ''}>
                {typeof tab.content === 'function' ? (tab.content as () => ReactNode)() : tab.content}
              </div>
            </Activity>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Helper: Create a lazy-loaded tab content using dynamic import.
 */
export function createLazyTab(importFn: () => Promise<{ default: React.ComponentType }>) {
  return dynamic(importFn, {
    ssr: false,
    loading: () => (
      <div className="glass-card p-6 animate-pulse space-y-4">
        <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded-md w-1/3" />
        <div className="space-y-2.5">
          <div className="h-3.5 bg-gray-200 dark:bg-slate-700 rounded-md w-full" />
          <div className="h-3.5 bg-gray-200 dark:bg-slate-700 rounded-md w-5/6" />
          <div className="h-3.5 bg-gray-200 dark:bg-slate-700 rounded-md w-2/3" />
        </div>
      </div>
    ),
  });
}
