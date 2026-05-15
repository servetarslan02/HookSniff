'use client';

import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualTableProps<T> {
  data: T[];
  estimateSize?: number;
  overscan?: number;
  header: React.ReactNode;
  renderRow: (item: T, index: number) => React.ReactNode;
  emptyState?: React.ReactNode;
  className?: string;
}

export function VirtualTable<T>({
  data,
  estimateSize = 56,
  overscan = 10,
  header,
  renderRow,
  emptyState,
  className = '',
}: VirtualTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className={`overflow-hidden ${className}`}>
      {header}
      <div
        ref={parentRef}
        className="overflow-auto max-h-[600px]"
        style={{ contain: 'strict' }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {renderRow(data[virtualRow.index], virtualRow.index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
