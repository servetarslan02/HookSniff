'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type PlatformSettings } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { validated } from './validated';
import {
  FeatureFlagsResponseSchema,
  PlatformSettingsSchema,
} from '@/schemas/api';

// ── Admin Feature Flags ──
export function useAdminFeatureFlags(enabled = true) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'feature-flags'],
    queryFn: validated(
      () => adminApi.listFeatureFlags(token!),
      FeatureFlagsResponseSchema
    ),
    enabled: !!token && enabled,
    staleTime: 30_000,
  });
}

export function useCreateFeatureFlag() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      description?: string | null;
      is_enabled?: boolean;
      rollout_percentage?: number;
      enabled_for_plans?: string[];
    }) => adminApi.createFeatureFlag(token!, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'feature-flags'] });
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
    },
  });
}

export function useUpdateFeatureFlag() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        name?: string;
        description?: string | null;
        is_enabled?: boolean;
        rollout_percentage?: number;
        enabled_for_plans?: string[];
      };
    }) => adminApi.updateFeatureFlag(token!, id, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'feature-flags'] });
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
    },
  });
}

export function useDeleteFeatureFlag() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.deleteFeatureFlag(token!, id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'feature-flags'] });
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
    },
  });
}

// ════════════════════════════════════════════════════════════════
// Public Feature Flags — no auth required
// ════════════════════════════════════════════════════════════════

export function useFeatureFlags() {
  return useQuery({
    queryKey: ['feature-flags'],
    queryFn: async () => {
      const res = await fetch('/api/v1/feature-flags');
      if (!res.ok) return { enabled_flags: [] as string[] };
      return res.json() as Promise<{ enabled_flags: string[] }>;
    },
    staleTime: 60_000,
  });
}

export function useIsFeatureEnabled(flagName: string): boolean {
  const { data } = useFeatureFlags();
  return data?.enabled_flags?.includes(flagName) ?? false;
}

// ── Admin Platform Settings ──
export function useAdminSettings() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: validated(() => adminApi.getSettings(token!), PlatformSettingsSchema),
    enabled: !!token,
    staleTime: 5 * 60_000,
  });
}

export function useUpdateSettings() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<PlatformSettings>) => adminApi.updateSettings(token!, data as PlatformSettings),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
    },
  });
}

// ── Test Webhook Mutation ──
export function useTestWebhook() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: { endpoint_url: string; event_type: string; payload: Record<string, unknown> }) =>
      adminApi.testWebhook(token!, data),
  });
}

// ── Admin Broadcasts ──
export function useAdminBroadcasts(params?: { is_active?: string; broadcast_type?: string }) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'broadcasts', params],
    queryFn: async () => {
      const qs: Record<string, string> = { per_page: '100' };
      if (params?.is_active) qs.is_active = params.is_active;
      if (params?.broadcast_type) qs.broadcast_type = params.broadcast_type;
      return adminApi.listBroadcasts(token!, qs);
    },
    enabled: !!token,
    staleTime: 30_000,
  });
}
