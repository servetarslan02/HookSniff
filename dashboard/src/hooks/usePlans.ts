/**
 * Public plan pricing hook.
 *
 * Fetches plan prices and limits from the public /v1/plans endpoint.
 * No auth required. Cached for 5 minutes.
 *
 * Usage:
 *   const { plans, getPlanPrice, getPlanLimits } = usePlans();
 */
import { useQuery } from '@tanstack/react-query';
import { API_BASE } from '@/lib/api';

export interface PlanInfo {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  max_endpoints: number;
  max_webhooks: number;
  rate_limit: number;
  retention_days: number;
  popular: boolean;
}

interface PlansResponse {
  plans: PlanInfo[];
}

async function fetchPlans(): Promise<PlanInfo[]> {
  const res = await fetch(`${API_BASE}/plans`);
  if (!res.ok) throw new Error('Failed to fetch plans');
  const data: PlansResponse = await res.json();
  return data.plans;
}

export function usePlans() {
  const { data: plans = [], isLoading, error } = useQuery({
    queryKey: ['public-plans'],
    queryFn: fetchPlans,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  });

  // Hardcoded fallback prices (used when API is unavailable / rate limited)
  const FALLBACK_PRICES: Record<string, { monthly: number; yearly: number }> = {
    developer: { monthly: 0, yearly: 0 },
    startup: { monthly: 29, yearly: 278 },
    pro: { monthly: 49, yearly: 470 },
    enterprise: { monthly: 0, yearly: 0 },
  };

  const getPlan = (id: string) => plans.find(p => p.id === id);

  const getPlanPrice = (id: string, yearly = false) => {
    const plan = getPlan(id);
    if (plan) {
      return yearly ? plan.price_yearly : plan.price_monthly;
    }
    // Fallback to hardcoded prices when API hasn't loaded
    const fallback = FALLBACK_PRICES[id];
    if (!fallback) return 0;
    return yearly ? fallback.yearly : fallback.monthly;
  };

  const getPlanLimits = (id: string) => {
    const plan = getPlan(id);
    if (!plan) return null;
    return {
      endpoints: plan.max_endpoints,
      webhooks: plan.max_webhooks,
      rateLimit: plan.rate_limit,
      retention: plan.retention_days,
    };
  };

  const formatPrice = (id: string, yearly = false) => {
    const price = getPlanPrice(id, yearly);
    if (price === 0) return 'Free';
    return `$${price}`;
  };

  return { plans, getPlan, getPlanPrice, getPlanLimits, formatPrice, isLoading, error };
}
