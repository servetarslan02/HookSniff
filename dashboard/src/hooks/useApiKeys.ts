'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type ApiKeyResponse } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { validated } from './validated';
import { ApiKeySchema } from '@/schemas/api';
import { useFriendlyToast } from './useFriendlyToast';

// ── API Keys ──
export function useApiKeys() {
  const { token } = useAuth();
  return useQuery<ApiKeyResponse[]>({
    queryKey: ['api-keys'],
    queryFn: validated(() => api.getApiKeys(token!), ApiKeySchema.array()),
    enabled: !!token,
    staleTime: 180_000,
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateApiKey() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { showError } = useFriendlyToast();
  return useMutation({
    mutationFn: (name: string) => api.createApiKey(token!, name),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
    onError: (err) => showError(err),
  });
}

export function useDeleteApiKey() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { showError } = useFriendlyToast();
  return useMutation({
    mutationFn: (id: string) => api.deleteApiKey(token!, id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
    onError: (err) => showError(err),
  });
}

export function useRotateApiKey() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { showError } = useFriendlyToast();
  return useMutation({
    mutationFn: (id: string) => api.rotateApiKey(token!, id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
    onError: (err) => showError(err),
  });
}
