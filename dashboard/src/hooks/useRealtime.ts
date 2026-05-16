'use client';
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from './useWebSocket';
import type { WsEvent } from '@/schemas/api';

export function useRealtime() {
  const queryClient = useQueryClient();
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const handleEvent = (event: WsEvent) => {
    switch (event.type) {
      case 'delivery.created':
      case 'delivery.status_changed':
        queryClient.invalidateQueries({ queryKey: ['deliveries'] });
        queryClient.invalidateQueries({ queryKey: ['webhooks'] });
        queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
        queryClient.invalidateQueries({ queryKey: ['admin', 'revenue'] });
        queryClient.invalidateQueries({ queryKey: ['analytics'] });
        queryClient.invalidateQueries({ queryKey: ['stats'] });
        break;

      case 'queue.updated':
        queryClient.invalidateQueries({ queryKey: ['admin', 'queue-status'] });
        break;

      case 'user.created':
        queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
        queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
        break;

      case 'endpoint.created':
      case 'endpoint.updated':
      case 'endpoint.deleted':
      case 'endpoint.status_changed':
        queryClient.invalidateQueries({ queryKey: ['endpoints'] });
        queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
        break;

      case 'application.created':
      case 'application.updated':
      case 'application.deleted':
        queryClient.invalidateQueries({ queryKey: ['applications'] });
        queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
        break;

      case 'alert.triggered':
        queryClient.invalidateQueries({ queryKey: ['alerts'] });
        queryClient.invalidateQueries({ queryKey: ['admin', 'alerts'] });
        break;

      default:
        // Bilinmeyen event — genel cache temizle
        queryClient.invalidateQueries({ queryKey: ['admin'] });
        break;
    }
  };

  const { state } = useWebSocket({
    onEvent: handleEvent,
    onConnected: () => {
      // WS bağlandıysa polling'i durdur
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    },
  });

  // Fallback polling — WS bağlantısı yoksa veya bağlanmaya çalışıyorsa
  useEffect(() => {
    if (state === 'fallback' || state === 'disconnected' || state === 'connecting') {
      if (!pollingRef.current) {
        console.log(`[Realtime] WS state: ${state}, starting fallback polling (30s)`);
        pollingRef.current = setInterval(() => {
          queryClient.invalidateQueries({ queryKey: ['deliveries'] });
          queryClient.invalidateQueries({ queryKey: ['webhooks'] });
          queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
          queryClient.invalidateQueries({ queryKey: ['endpoints'] });
          queryClient.invalidateQueries({ queryKey: ['stats'] });
        }, 30_000);
      }
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [state, queryClient]);

  return { connectionState: state };
}
