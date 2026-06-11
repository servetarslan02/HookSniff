'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type ServiceTokenResponse } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { validated } from './validated';
import { ServiceTokenSchema } from '@/schemas/api';
import { useFriendlyToast } from './useFriendlyToast';

// ── Service Tokens ──
export function useServiceTokens() {
  const { token } = useAuth();
  return useQuery<ServiceTokenResponse[]>({
    queryKey: ['service-tokens'],
    queryFn: validated(() => api.getServiceTokens(token!), ServiceTokenSchema.array()),
    enabled: !!token,
    staleTime: 180_000,
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateServiceToken() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { showError } = useFriendlyToast();
  return useMutation({
    mutationFn: (name: string) => api.createServiceToken(token!, name),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['service-tokens'] }),
    onError: (err) => showError(err),
  });
}

export function useDeleteServiceToken() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { showError } = useFriendlyToast();
  return useMutation({
    mutationFn: (id: string) => api.deleteServiceToken(token!, id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['service-tokens'] }),
    onError: (err) => showError(err),
  });
}

export function useRevealServiceToken() {
  const { token } = useAuth();
  const { showError } = useFriendlyToast();
  return useMutation({
    mutationFn: (id: string) => api.revealServiceToken(token!, id),
    onError: (err) => showError(err),
  });
}

export function useUpdateServiceToken() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { showError } = useFriendlyToast();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { name?: string; is_active?: boolean } }) =>
      api.updateServiceToken(token!, id, body),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['service-tokens'] }),
    onError: (err) => showError(err),
  });
}
