'use client';

import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // ── Performans Cache Stratejisi ──
            staleTime: 5 * 60 * 1000,        // 5 dk: Veri 5 dakika boyunca "taze" sayılır, refetch yapılmaz
            gcTime: 30 * 60 * 1000,           // 30 dk: Bellekte tutulur (sayfalar arası geçişte cache korunur)
            refetchOnWindowFocus: false,       // Sekmeye geri gelince refetch yapma (cache taze ise)
            refetchOnReconnect: 'always',     // İnternet geri gelince arka planda yenile
            refetchOnMount: false,            // Sayfa açıldığında refetch yapma (cache varsa anında gösterir)
            retry: 1,                         // Başarısız olursa 1 kez dene
            retryDelay: 1000,                 // 1 sn bekle, tekrar dene
            networkMode: 'online',            // Offline ise istek gönderme
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
