'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type RateLimitResponse } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { validated } from './validated';
import { RateLimitSchema } from '@/schemas/api';

// ── Rate Limits ──
export function useRateLimits() {
  const { token } = useAuth();
  return useQuery<RateLimitResponse[]>({
    queryKey: ['rate-limits'],
    queryFn: validated(() => api.getRateLimits(token!), RateLimitSchema.array()),
    enabled: !!token,
    staleTime: 15_000,
  });
}

export function useSetRateLimit() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ endpointId, config }: { endpointId: string; config: { requests_per_second: number; burst_size: number; enabled: boolean } }) =>
      api.setRateLimit(token!, endpointId, config),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['rate-limits'] }),
  });
}

export function useDeleteRateLimit() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (endpointId: string) => api.deleteRateLimit(token!, endpointId),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['rate-limits'] }),
  });
}
