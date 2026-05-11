/**
 * HookSniff API Resource: Analytics
 */

import { HookSniffRequest, HttpMethod, type HookSniffRequestContext } from "../request";

export interface TrendPoint {
  date: string;
  total: number;
  delivered: number;
  failed: number;
}

export interface TrendResponse {
  data: TrendPoint[];
}

export interface SuccessRateResponse {
  rate: number;
  total: number;
  delivered: number;
  failed: number;
}

export interface LatencyResponse {
  p50: number;
  p95: number;
  p99: number;
  avg: number;
}

export class Analytics {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** Get delivery trend data */
  async trends(options?: { since?: string; until?: string }): Promise<TrendResponse> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/analytics/deliveries");
    if (options?.since) req.setQueryParams({ since: options.since });
    if (options?.until) req.setQueryParams({ until: options.until });
    return req.send<TrendResponse>(this.ctx);
  }

  /** Get success rate metrics */
  async successRate(options?: { since?: string; until?: string }): Promise<SuccessRateResponse> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/analytics/success-rate");
    if (options?.since) req.setQueryParams({ since: options.since });
    if (options?.until) req.setQueryParams({ until: options.until });
    return req.send<SuccessRateResponse>(this.ctx);
  }

  /** Get latency metrics */
  async latency(options?: { since?: string; until?: string }): Promise<LatencyResponse> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/analytics/latency");
    if (options?.since) req.setQueryParams({ since: options.since });
    if (options?.until) req.setQueryParams({ until: options.until });
    return req.send<LatencyResponse>(this.ctx);
  }
}
