'use client';

import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api';
import { useAuth } from '@/lib/store';

// ── Notification Unread Count ──
export function useNotificationUnreadCount() {
  const { token } = useAuth();
  return useQuery<{ unread_count: number }>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationsApi.getUnreadCount(token!),
    enabled: !!token,
    staleTime: 120_000,
    placeholderData: (previousData) => previousData,
  });
}
