'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transformsApi } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { validated } from './validated';
import {
  TransformRuleSchema,
  type TransformRuleValidated,
} from '@/schemas/api';

// ── Transform Rules ──
export function useTransformRules(endpointId: string) {
  const { token } = useAuth();
  return useQuery<TransformRuleValidated[]>({
    queryKey: ['transforms', endpointId],
    queryFn: validated(
      () => transformsApi.list(token!, endpointId),
      TransformRuleSchema.array()
    ),
    enabled: !!token && !!endpointId,
    staleTime: 15_000,
  });
}

export function useCreateTransformRule() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ endpointId, rule }: { endpointId: string; rule: TransformRuleValidated['rule_json'] }) =>
      transformsApi.create(token!, endpointId, { rule }),
    onSettled: (_data, _error, { endpointId }) => {
      queryClient.invalidateQueries({ queryKey: ['transforms', endpointId] });
    },
  });
}

export function useDeleteTransformRule() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ endpointId, ruleId }: { endpointId: string; ruleId: string }) =>
      transformsApi.delete(token!, endpointId, ruleId),
    onSettled: (_data, _error, { endpointId }) => {
      queryClient.invalidateQueries({ queryKey: ['transforms', endpointId] });
    },
  });
}

export function useUpdateTransformRule() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ endpointId, ruleId, rule }: { endpointId: string; ruleId: string; rule: TransformRuleValidated['rule_json'] }) =>
      transformsApi.update(token!, endpointId, ruleId, { rule }),
    onSettled: (_data, _error, { endpointId }) => {
      queryClient.invalidateQueries({ queryKey: ['transforms', endpointId] });
    },
  });
}

export function useTestTransform() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ endpointId, payload, config }: { endpointId: string; payload: unknown; config: TransformRuleValidated['rule_json'] }) =>
      transformsApi.test(token!, endpointId, { payload, config }),
  });
}
