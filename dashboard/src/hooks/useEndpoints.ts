'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { endpointsApi } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { validated } from './validated';
import { EndpointSchema, type EndpointValidated } from '@/schemas/api';

// ── Endpoints ──
export function useEndpoints() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['endpoints'],
    queryFn: validated(() => endpointsApi.list(token!), EndpointSchema.array()),
    enabled: !!token,
    staleTime: 30_000,
  });
}

// ── Endpoint Detail ──
export function useEndpointDetail(id: string) {
  const { token } = useAuth();
  return useQuery<EndpointValidated>({
    queryKey: ['endpoint', id],
    queryFn: validated(() => endpointsApi.get(token!, id), EndpointSchema),
    enabled: !!token && !!id,
    staleTime: 15_000,
  });
}

export function useDeleteEndpoint() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => endpointsApi.delete(token!, id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['endpoints'] });
    },
  });
}

export function useToggleEndpoint() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      endpointsApi.update(token!, id, { is_active }),
    onMutate: async ({ id, is_active }) => {
      await queryClient.cancelQueries({ queryKey: ['endpoint', id] });
      await queryClient.cancelQueries({ queryKey: ['endpoints'] });

      const previousDetail = queryClient.getQueryData(['endpoint', id]);
      const previousList = queryClient.getQueryData(['endpoints']);

      queryClient.setQueryData(['endpoint', id], (old: unknown) => ({
        ...(old as Record<string, unknown>),
        is_active,
      }));

      queryClient.setQueryData(['endpoints'], (old: unknown) => {
        if (!Array.isArray(old)) return old;
        return old.map((ep: Record<string, unknown>) =>
          ep.id === id ? { ...ep, is_active } : ep
        );
      });

      return { previousDetail, previousList };
    },
    onError: (_err, { id }, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(['endpoint', id], context.previousDetail);
      }
      if (context?.previousList) {
        queryClient.setQueryData(['endpoints'], context.previousList);
      }
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['endpoint', id] });
      queryClient.invalidateQueries({ queryKey: ['endpoints'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
