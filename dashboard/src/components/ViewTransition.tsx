'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * View Transitions API — sayfa geçişlerinde fade animasyonu
 * 
 * Tarayıcı destekliyorsa (Chrome 111+, Edge 111+) yumuşak geçiş sağlar.
 * Desteklemeyen tarayıcılarda hiçbir şey yapmaz — graceful degradation.
 */
export function ViewTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (prevPath.current !== pathname && 'startViewTransition' in document) {
      (document as any).startViewTransition(() => {
        // React otomatik DOM günceller
      });
    }
    prevPath.current = pathname;
  }, [pathname]);

  return <>{children}</>;
}
