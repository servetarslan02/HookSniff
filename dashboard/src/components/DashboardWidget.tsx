'use client';

import { type ReactNode, type DragEvent } from 'react';
import { clsx } from 'clsx';

export interface WidgetConfig {
  id: string;
  visible: boolean;
}

interface DashboardWidgetProps {
  id: string;
  title?: string;
  children: ReactNode;
  dragHandleProps?: {
    onDragStart: (e: DragEvent) => void;
    onDragEnd: (e: DragEvent) => void;
    onDragOver: (e: DragEvent) => void;
    onDrop: (e: DragEvent) => void;
    isDragging: boolean;
    isOver: boolean;
  };
  className?: string;
}

export function DashboardWidget({ id, title, children, dragHandleProps, className }: DashboardWidgetProps) {
  return (
    <div
      id={id}
      draggable={!!dragHandleProps}
      onDragStart={dragHandleProps?.onDragStart}
      onDragEnd={dragHandleProps?.onDragEnd}
      onDragOver={dragHandleProps?.onDragOver}
      onDrop={dragHandleProps?.onDrop}
      className={clsx(
        'relative group transition-all duration-200',
        dragHandleProps?.isDragging && 'opacity-50 scale-[0.98]',
        dragHandleProps?.isOver && 'ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-gray-900 rounded-2xl',
        className
      )}
    >
      {dragHandleProps && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full px-2 py-1 shadow-xs cursor-grab active:cursor-grabbing">
            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="9" cy="5" r="1.5" />
              <circle cx="15" cy="5" r="1.5" />
              <circle cx="9" cy="12" r="1.5" />
              <circle cx="15" cy="12" r="1.5" />
              <circle cx="9" cy="19" r="1.5" />
              <circle cx="15" cy="19" r="1.5" />
            </svg>
            <span className="text-xs text-gray-500 dark:text-slate-400 select-none">{title || '⋮⋮'}</span>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

// Widget order/toggle management
const STORAGE_KEY = 'hooksniff-dashboard-widgets';

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'stat-cards', visible: true },
  { id: 'charts', visible: true },
  { id: 'recent-deliveries', visible: true },
];

export function loadWidgetConfig(): WidgetConfig[] {
  if (typeof window === 'undefined') return DEFAULT_WIDGETS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as WidgetConfig[];
      // Merge with defaults: preserve saved order + visibility, add any new widgets at end
      const savedIds = parsed.map((p) => p.id);
      const defaultIds = DEFAULT_WIDGETS.map((d) => d.id);
      // Keep saved items in their saved order
      const merged = parsed
        .filter((p) => defaultIds.includes(p.id))
        .map((p) => {
          const def = DEFAULT_WIDGETS.find((d) => d.id === p.id);
          return { id: p.id, visible: p.visible ?? def?.visible ?? true };
        });
      // Append any new default widgets not in saved config
      for (const def of DEFAULT_WIDGETS) {
        if (!savedIds.includes(def.id)) {
          merged.push(def);
        }
      }
      return merged;
    }
  } catch {
    // ignore
  }
  return DEFAULT_WIDGETS;
}

export function saveWidgetConfig(config: WidgetConfig[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // ignore
  }
}
