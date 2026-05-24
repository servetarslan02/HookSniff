'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsApi, type AlertRule } from '@/lib/api';
import { useAuth } from '@/lib/store';

// ── User Alerts ──
export function useAlerts() {
  const { token } = useAuth();
  return useQuery<AlertRule[]>({
    queryKey: ['alerts'],
    queryFn: async () => {
      const data = await alertsApi.list(token!);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!token,
    staleTime: 30_000,
  });
}

export function useCreateAlert() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; condition: string; threshold: number; channels: string[] }) =>
      alertsApi.create(token!, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

export function useUpdateAlert() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ name: string; condition: string; threshold: number; channels: string[]; is_active: boolean }> }) =>
      alertsApi.update(token!, id, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

export function useDeleteAlert() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => alertsApi.delete(token!, id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

export function useTestAlert() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => alertsApi.test(token!, id),
  });
}
