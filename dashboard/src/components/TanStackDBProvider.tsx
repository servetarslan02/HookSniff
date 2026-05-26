'use client';

/**
 * TanStack DB Provider — Katman 14
 *
 * Initializes TanStack DB collections and provides them to the app.
 * Wraps the existing React Query provider — no changes needed.
 */

import { createContext, useContext, type ReactNode } from 'react';
import { useAuth } from '@/lib/store';

interface TanStackDBContextValue {
  enabled: boolean;
}

const TanStackDBContext = createContext<TanStackDBContextValue>({
  enabled: false,
});

export function useTanStackDB() {
  return useContext(TanStackDBContext);
}

/**
 * TanStack DB works alongside React Query.
 * Collections are created per-hook using useMemo — no global state needed.
 * This provider signals to components that TanStack DB is available.
 */
export function TanStackDBProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();

  return (
    <TanStackDBContext.Provider value={{ enabled: !!token }}>
      {children}
    </TanStackDBContext.Provider>
  );
}
