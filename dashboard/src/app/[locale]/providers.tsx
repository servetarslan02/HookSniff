'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider, focusManager, onlineManager } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // ── Zirve Cache Stratejisi ──
            staleTime: 5 * 60 * 1000,      // 5 dk: Bu süre içinde veri "taze" sayılır, API'ye gitmez
            gcTime: 30 * 60 * 1000,         // 30 dk: Bellekte tutulur (eskiden cacheTime)
            refetchOnWindowFocus: false,     // Sekmeye geri gelince yeniden çekme
            refetchOnReconnect: false,       // İnternet geri gelince yeniden çekme (lazy)
            refetchOnMount: false,           // Sayfa her açıldığında yeniden çekme (cache varsa)
            retry: 1,                        // Başarısız olursa 1 kez dene (2 değil — hız için)
            retryDelay: 1000,                // 1 sn bekle, tekrar dene
            networkMode: 'online',           // Offline ise istek gönderme
            // Placeholder: önceki veriyi göster, arka planda güncelle
            placeholderData: (previousData: unknown) => previousData,
          },
          mutations: {
            retry: 1,
            networkMode: 'online',
          },
        },
      })
  );

  // ── Focus Manager: Sekme odaklanınca refetch yapma ──
  // (Linear, Cal.com tarzı — sadece manuel refresh)
  if (typeof window !== 'undefined') {
    focusManager.setEventListener(() => () => {});
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
