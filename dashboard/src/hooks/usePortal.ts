'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  PortalConfigResponse,
  PortalEmbedCodeResponse,
  PortalProfileResponse,
  PortalUsageResponse,
} from '@/lib/api';
import { useAuth } from '@/lib/store';
import { validated } from './validated';
import {
  PortalConfigSchema,
  PortalEmbedCodeSchema,
  PortalProfileSchema,
  PortalUsageSchema,
} from '@/schemas/api';

// ── Portal ──
export function usePortalConfig() {
  const { token } = useAuth();
  return useQuery<PortalConfigResponse>({
    queryKey: ['portal-config'],
    queryFn: validated(() => api.getPortalConfig(token!), PortalConfigSchema) as () => Promise<PortalConfigResponse>,
    enabled: !!token,
    staleTime: 30_000,
  });
}

export function usePortalEmbedCode() {
  const { token } = useAuth();
  return useQuery<PortalEmbedCodeResponse>({
    queryKey: ['portal-embed-code'],
    queryFn: validated(() => api.getPortalEmbedCode(token!), PortalEmbedCodeSchema),
    enabled: !!token,
    staleTime: 60_000,
  });
}

export function useUpdatePortalConfig() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (config: Partial<PortalConfigResponse>) => api.updatePortalConfig(token!, config),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['portal-config'] }),
  });
}

export function usePortalProfile() {
  const { token } = useAuth();
  return useQuery<PortalProfileResponse>({
    queryKey: ['portal-profile'],
    queryFn: validated(() => api.getPortalProfile(token!), PortalProfileSchema),
    enabled: !!token,
    staleTime: 30_000,
  });
}

export function usePortalUsage() {
  const { token } = useAuth();
  return useQuery<PortalUsageResponse>({
    queryKey: ['portal-usage'],
    queryFn: validated(() => api.getPortalUsage(token!), PortalUsageSchema),
    enabled: !!token,
    staleTime: 30_000,
  });
}
