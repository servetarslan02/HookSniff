'use client';

import { useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { BarChart3, ClipboardList, Heart } from 'lucide-react';

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
}

/**
 * Production-grade tabbed section with lazy rendering and hover prefetch.
 *
 * Stripe/Linear pattern:
 * - Only the active tab's content is mounted (saves memory)
 * - Hover over a tab → content starts loading before click
 * - Smooth fade-in when switching tabs
 * - URL param persistence (deep-linkable tabs)
 * - Visited tabs stay mounted (no re-fetch on switch)
 *
 * @example
 * <TabbedSection
 *   tabs={[
 *     { key: 'overview', label: 'Overview', icon: <BarChart3 size={16} strokeWidth={1.75} />, content: <OverviewTab /> },
 *     { key: 'activity', label: 'Activity', icon: <ClipboardList size={16} strokeWidth={1.75} />, content: () => <ActivityTab /> },
 *     { key: 'health', label: 'Health', icon: <Heart size={16} strokeWidth={1.75} />, content: <HealthTab /> },
 *   ]}
 *   urlParam="section"
 * />
 */
export function TabbedSection({
  tabs,
  defaultTab,
  urlParam = 'tab',
  onTabChange,
  fadeMs = 200,
  tabClassName,
  contentClassName,
}: TabbedSectionProps) {
  const [active, setActive] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get(urlParam);
      if (urlTab && tabs.some((t) => t.key === urlTab)) return urlTab;
    }
    return defaultTab || tabs[0]?.key || '';
  });

  const [visited, setVisited] = useState<Set<string>>(
    () => new Set([defaultTab || tabs[0]?.key || ''])
  );
  const [fadingIn, setFadingIn] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Mark tab as visited (triggers lazy render)
  const visit = useCallback((key: string) => {
    setVisited((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  // Handle tab click
  const handleTabClick = useCallback(
    (key: string) => {
      setActive(key);
      visit(key);
      onTabChange?.(key);

      // Update URL param
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        if (key === defaultTab || key === tabs[0]?.key) {
          url.searchParams.delete(urlParam);
        } else {
          url.searchParams.set(urlParam, key);
        }
        window.history.replaceState(null, '', url.toString());
      }
    },
    [visit, onTabChange, urlParam, defaultTab, tabs]
  );

  // Prefetch on hover (Stripe pattern)
  const handleTabHover = useCallback(
    (key: string) => {
      visit(key);
    },
    [visit]
  );

  // Fade-in effect when tab changes
  useEffect(() => {
    setFadingIn(active);
    const timer = setTimeout(() => setFadingIn(null), fadeMs);
    return () => clearTimeout(timer);
  }, [active, fadeMs]);

  // Resolve tab content (supports factory functions)
  const resolveContent = useCallback((tab: Tab): ReactNode => {
    if (typeof tab.content === 'function') {
      return (tab.content as () => ReactNode)();
    }
    return tab.content;
  }, []);

  return (
    <div className="space-y-6">
      {/* Tab Bar */}
      <div className={`border-b border-gray-200 dark:border-slate-700 overflow-x-auto ${tabClassName ?? ''}`}>
        <nav className="flex gap-1 min-w-max" role="tablist">
          {tabs.map((tab) => {
            const isActive = tab.key === active;
            const prefetch = tab.prefetch !== false; // default true

            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.key}`}
                onClick={() => handleTabClick(tab.key)}
                onMouseEnter={prefetch ? () => handleTabHover(tab.key) : undefined}
                className={`
                  relative px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2
                  ${
                    isActive
                      ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400'
                      : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'
                  }
                `}
              >
                {tab.icon && <span className="mr-1.5">{tab.icon}</span>}
                {tab.label}
                {tab.badge != null && (
                  <span
                    className={`
                      ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium rounded-full
                      ${
                        isActive
                          ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400'
                      }
                    `}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div ref={contentRef} className={contentClassName}>
        {tabs.map((tab) => {
          if (!visited.has(tab.key)) return null;

          const isActive = tab.key === active;
          const isFading = fadingIn === tab.key;

          return (
            <div
              key={tab.key}
              id={`tabpanel-${tab.key}`}
              role="tabpanel"
              aria-labelledby={tab.key}
              style={{
                display: isActive ? 'block' : 'none',
                opacity: isFading ? 0 : 1,
                transition: `opacity ${fadeMs}ms ease-out`,
              }}
            >
              {resolveContent(tab)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Helper: Create a lazy-loaded tab content using dynamic import.
 * Use this in parent components to code-split tab content.
 *
 * @example
 * const OverviewTab = createLazyTab(() => import('./components/OverviewTab'));
 * const ActivityTab = createLazyTab(() => import('./components/ActivityTab'));
 *
 * <TabbedSection tabs={[
 *   { key: 'overview', label: 'Overview', content: <OverviewTab /> },
 *   { key: 'activity', label: 'Activity', content: <ActivityTab /> },
 * ]} />
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
