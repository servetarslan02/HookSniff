'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type ServiceTokenResponse } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { validated } from './validated';
import { ServiceTokenSchema } from '@/schemas/api';

// ── Service Tokens ──
export function useServiceTokens() {
  const { token } = useAuth();
  return useQuery<ServiceTokenResponse[]>({
    queryKey: ['service-tokens'],
    queryFn: validated(() => api.getServiceTokens(token!), ServiceTokenSchema.array()),
    enabled: !!token,
    staleTime: 15_000,
  });
}

export function useCreateServiceToken() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api.createServiceToken(token!, name),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['service-tokens'] }),
  });
}

export function useDeleteServiceToken() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteServiceToken(token!, id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['service-tokens'] }),
  });
}

export function useRevealServiceToken() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => api.revealServiceToken(token!, id),
  });
}

export function useUpdateServiceToken() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { name?: string; is_active?: boolean } }) =>
      api.updateServiceToken(token!, id, body),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['service-tokens'] }),
  });
}
