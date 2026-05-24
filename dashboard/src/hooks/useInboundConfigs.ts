'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inboundApi } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { validated } from './validated';
import { InboundConfigSchema, type InboundConfigValidated } from '@/schemas/api';

// ── Inbound Configs ──
export function useInboundConfigs() {
  const { token } = useAuth();
  return useQuery<InboundConfigValidated[]>({
    queryKey: ['inbound-configs'],
    queryFn: validated(
      () => inboundApi.listConfigs(token!),
      InboundConfigSchema.array()
    ),
    enabled: !!token,
    staleTime: 30_000,
  });
}

export function useCreateInboundConfig() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { provider: string; endpoint_id?: string | null; secret: string }) =>
      inboundApi.createConfig(token!, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['inbound-configs'] });
    },
  });
}

export function useUpdateInboundConfig() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { secret?: string; endpoint_id?: string | null; enabled?: boolean } }) =>
      inboundApi.updateConfig(token!, id, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['inbound-configs'] });
    },
  });
}

export function useDeleteInboundConfig() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      inboundApi.deleteConfig(token!, id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['inbound-configs'] });
    },
  });
}
