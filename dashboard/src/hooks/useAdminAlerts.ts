'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { useAuth } from '@/lib/store';
import type { AlertRuleAdmin } from '@/lib/api';

// ── Admin Alerts ──
export function useAdminAlerts() {
  const { token } = useAuth();
  return useQuery<AlertRuleAdmin[]>({
    queryKey: ['admin', 'alerts'],
    queryFn: async () => {
      const data = await adminApi.listAlerts(token!);
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
      adminApi.createAlert(token!, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'alerts'] });
    },
  });
}

export function useUpdateAlert() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AlertRuleAdmin> }) =>
      adminApi.updateAlert(token!, id, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'alerts'] });
    },
  });
}

export function useDeleteAlert() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.deleteAlert(token!, id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'alerts'] });
    },
  });
}
