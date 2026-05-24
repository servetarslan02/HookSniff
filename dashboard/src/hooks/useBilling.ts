'use client';

import { useQuery } from '@tanstack/react-query';
import { billingApiExtended } from '@/lib/api';
import { useAuth } from '@/lib/store';
import {
  BillingUsageSchema,
  BillingSubscriptionSchema,
  OverageSettingsSchema,
  InvoiceSchema,
  type BillingUsageValidated,
  type BillingSubscriptionValidated,
  type OverageSettingsValidated,
  type InvoiceValidated,
} from '@/schemas/api';

// ── Schema-validated fetcher wrapper ──
function validated<T>(
  fetcher: () => Promise<unknown>,
  schema: { parse: (data: unknown) => T }
): () => Promise<T> {
  return async () => {
    const data = await fetcher();
    return schema.parse(data);
  };
}

// ── Billing Usage ──
export function useBillingUsage() {
  const { token } = useAuth();
  return useQuery<BillingUsageValidated>({
    queryKey: ['billing', 'usage'],
    queryFn: validated(() => billingApiExtended.getUsage(token!), BillingUsageSchema),
    enabled: !!token,
    staleTime: 60_000,
  });
}

// ── Billing Invoices ──
export function useBillingInvoices() {
  const { token } = useAuth();
  return useQuery<InvoiceValidated[]>({
    queryKey: ['billing', 'invoices'],
    queryFn: validated(() => billingApiExtended.getInvoices(token!), InvoiceSchema.array()),
    enabled: !!token,
    staleTime: 60_000,
  });
}

// ── Billing Subscription ──
export function useBillingSubscription() {
  const { token } = useAuth();
  return useQuery<BillingSubscriptionValidated>({
    queryKey: ['billing', 'subscription'],
    queryFn: validated(() => billingApiExtended.getSubscription(token!), BillingSubscriptionSchema),
    enabled: !!token,
    staleTime: 60_000,
  });
}

// ── Overage Settings ──
export function useOverageSettings() {
  const { token } = useAuth();
  return useQuery<OverageSettingsValidated>({
    queryKey: ['billing', 'overage'],
    queryFn: validated(() => billingApiExtended.getOverageSettings(token!), OverageSettingsSchema),
    enabled: !!token,
    staleTime: 60_000,
  });
}
