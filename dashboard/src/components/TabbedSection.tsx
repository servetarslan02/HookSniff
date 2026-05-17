'use client';

import { useState, useCallback, type ReactNode } from 'react';

export interface Tab {
  key: string;
  label: string;
  icon?: string;
  /** Either a ReactNode or a factory function for lazy rendering */
  content: ReactNode | (() => ReactNode);
}

interface TabbedSectionProps {
  tabs: Tab[];
  defaultTab?: string;
}

export function TabbedSection({ tabs, defaultTab }: TabbedSectionProps) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.key || '');
  const [visited, setVisited] = useState<Set<string>>(() => new Set([defaultTab || tabs[0]?.key || '']));

  const handleTabClick = useCallback((key: string) => {
    setActive(key);
    setVisited((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  // Prefetch on hover — start loading tab content before click
  const handleTabHover = useCallback((key: string) => {
    setVisited((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Tab Bar */}
      <div className="border-b border-gray-200 dark:border-slate-700 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabClick(tab.key)}
              onMouseEnter={() => handleTabHover(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                active === tab.key
                  ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400'
                  : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'
              }`}
            >
              {tab.icon && <span className="mr-1.5">{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content — render visited tabs, hide inactive ones */}
      {tabs.map((tab) => {
        if (!visited.has(tab.key)) return null;
        const content = typeof tab.content === 'function' ? (tab.content as () => ReactNode)() : tab.content;
        return (
          <div key={tab.key} style={{ display: tab.key === active ? 'block' : 'none' }}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
