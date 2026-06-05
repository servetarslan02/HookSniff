'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { broadcastsApi, type UserBroadcast } from '@/lib/api';
import { useAuth } from '@/lib/store';

// ── Active Broadcasts ──
export function useBroadcasts() {
  const { token } = useAuth();
  return useQuery<UserBroadcast[]>({
    queryKey: ['broadcasts', 'active'],
    queryFn: () => broadcastsApi.listActive(token!),
    enabled: !!token,
    staleTime: 180_000, // 1 dk — broadcasts nadiren değişir
    placeholderData: (previousData) => previousData,
  });
}

// ── Broadcast Unread Count ──
export function useBroadcastUnreadCount() {
  const { token } = useAuth();
  return useQuery<{ unread_count: number }>({
    queryKey: ['broadcasts', 'unread-count'],
    queryFn: () => broadcastsApi.getUnreadCount(token!),
    enabled: !!token,
    staleTime: 120_000,
    placeholderData: (previousData) => previousData,
  });
}

// ── Dismiss Broadcast ──
export function useDismissBroadcast() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => broadcastsApi.dismiss(token!, id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['broadcasts'] });
      const previous = queryClient.getQueryData<UserBroadcast[]>(['broadcasts', 'active']);
      queryClient.setQueryData<UserBroadcast[]>(['broadcasts', 'active'], (old) =>
        (old || []).filter((b) => b.id !== id)
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['broadcasts', 'active'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcasts'] });
    },
  });
}
