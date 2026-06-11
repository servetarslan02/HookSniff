'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type RateLimitResponse } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { validated } from './validated';
import { RateLimitSchema } from '@/schemas/api';
import { useFriendlyToast } from './useFriendlyToast';

// ── Rate Limits ──
export function useRateLimits() {
  const { token } = useAuth();
  return useQuery<RateLimitResponse[]>({
    queryKey: ['rate-limits'],
    queryFn: validated(() => api.getRateLimits(token!), RateLimitSchema.array()),
    enabled: !!token,
    staleTime: 180_000,
    placeholderData: (previousData) => previousData,
  });
}

export function useSetRateLimit() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { showError } = useFriendlyToast();
  return useMutation({
    mutationFn: ({ endpointId, config }: { endpointId: string; config: { requests_per_second: number; burst_size: number; enabled: boolean } }) =>
      api.setRateLimit(token!, endpointId, config),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['rate-limits'] }),
    onError: (err) => showError(err),
  });
}

export function useDeleteRateLimit() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { showError } = useFriendlyToast();
  return useMutation({
    mutationFn: (endpointId: string) => api.deleteRateLimit(token!, endpointId),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['rate-limits'] }),
    onError: (err) => showError(err),
  });
}
