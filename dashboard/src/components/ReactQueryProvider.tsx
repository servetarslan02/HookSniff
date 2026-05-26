'use client';

import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, focusManager, onlineManager } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // ── Performans Cache Stratejisi ──
            staleTime: 60_000,               // 60 sn: Veri 1 dakika boyunca "taze" sayılır
            gcTime: 10 * 60 * 1000,          // 10 dk: Bellekte tutulur
            refetchOnWindowFocus: 'always',  // Sekmeye geri gelince arka planda yenile
            refetchOnReconnect: 'always',    // İnternet geri gelince arka planda yenile
            refetchOnMount: 'always',        // Sayfa açıldığında arka planda yenile (cache varsa anında gösterir)
            retry: 1,                        // Başarısız olursa 1 kez dene
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
  // useEffect içinde — prerender sırasında çalışmaz
  useEffect(() => {
    focusManager.setEventListener(() => () => {});
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
