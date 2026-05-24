'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi, webhooksApi, type NotificationListResponse } from '@/lib/api';
import { useAuth } from '@/lib/store';

// ── Notifications ──
export function useNotifications(params?: {
  page?: number;
  type?: string;
  read?: boolean;
}) {
  const { token } = useAuth();
  return useQuery<NotificationListResponse>({
    queryKey: ['notifications', params],
    queryFn: () =>
      notificationsApi.list(token!, {
        page: params?.page,
        type: params?.type,
        read: params?.read,
      }),
    enabled: !!token,
    staleTime: 15_000,
  });
}

// ── Notification Mutations ──

export function useMarkNotificationAsRead() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(token!, id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueriesData<NotificationListResponse>({
        queryKey: ['notifications'],
      });
      queryClient.setQueriesData<NotificationListResponse>(
        { queryKey: ['notifications'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            notifications: old.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            ),
          };
        }
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        for (const [key, data] of context.previous) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(token!),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueriesData<NotificationListResponse>({
        queryKey: ['notifications'],
      });
      queryClient.setQueriesData<NotificationListResponse>(
        { queryKey: ['notifications'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            notifications: old.notifications.map((n) => ({ ...n, read: true })),
          };
        }
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        for (const [key, data] of context.previous) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useDeleteNotification() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.deleteNotification(token!, id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueriesData<NotificationListResponse>({
        queryKey: ['notifications'],
      });
      queryClient.setQueriesData<NotificationListResponse>(
        { queryKey: ['notifications'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            notifications: old.notifications.filter((n) => n.id !== id),
            total: old.total - 1,
          };
        }
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        for (const [key, data] of context.previous) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useReplayWebhook() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => webhooksApi.replay(token!, id),
    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: ['delivery', id] });
      queryClient.invalidateQueries({ queryKey: ['delivery', id, 'attempts'] });
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-logs'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
