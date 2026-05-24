'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type ApiKeyResponse } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { validated } from './validated';
import { ApiKeySchema } from '@/schemas/api';

// ── API Keys ──
export function useApiKeys() {
  const { token } = useAuth();
  return useQuery<ApiKeyResponse[]>({
    queryKey: ['api-keys'],
    queryFn: validated(() => api.getApiKeys(token!), ApiKeySchema.array()),
    enabled: !!token,
    staleTime: 15_000,
  });
}

export function useCreateApiKey() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api.createApiKey(token!, name),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
  });
}

export function useDeleteApiKey() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteApiKey(token!, id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
  });
}

export function useRotateApiKey() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.rotateApiKey(token!, id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
  });
}
