'use client';

import { useState, type ReactNode } from 'react';

export interface Tab {
  key: string;
  label: string;
  icon?: string;
  content: ReactNode;
}

interface TabbedSectionProps {
  tabs: Tab[];
  defaultTab?: string;
}

export function TabbedSection({ tabs, defaultTab }: TabbedSectionProps) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.key || '');

  const currentTab = tabs.find((t) => t.key === active) || tabs[0];

  return (
    <div className="space-y-6">
      {/* Tab Bar */}
      <div className="border-b border-gray-200 dark:border-slate-700 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActive(tab.key)}
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

      {/* Active Tab Content */}
      <div key={currentTab?.key}>
        {currentTab?.content}
      </div>
    </div>
  );
}
