/**
 * HookSniff API Resource: Analytics
 */

import { HookSniffRequest, HttpMethod, type HookSniffRequestContext } from "../request";
import {
  TrendResponseModel,
  SuccessRateModel,
  LatencyModel,
  type TrendResponse,
  type SuccessRateResponse,
  type LatencyResponse,
} from "../models";

export type { TrendResponse, SuccessRateResponse, LatencyResponse };

export class Analytics {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** Get delivery trend data */
  async trends(options?: { since?: string; until?: string }): Promise<TrendResponse> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/analytics/deliveries");
    if (options?.since) req.setQueryParams({ since: options.since });
    if (options?.until) req.setQueryParams({ until: options.until });
    return req.send<TrendResponse>(this.ctx, (json) =>
      TrendResponseModel._fromJsonObject(json as Record<string, unknown>)
    );
  }

  /** Get success rate metrics */
  async successRate(options?: { since?: string; until?: string }): Promise<SuccessRateResponse> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/analytics/success-rate");
    if (options?.since) req.setQueryParams({ since: options.since });
    if (options?.until) req.setQueryParams({ until: options.until });
    return req.send<SuccessRateResponse>(this.ctx, (json) =>
      SuccessRateModel._fromJsonObject(json as Record<string, unknown>)
    );
  }

  /** Get latency metrics */
  async latency(options?: { since?: string; until?: string }): Promise<LatencyResponse> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/analytics/latency");
    if (options?.since) req.setQueryParams({ since: options.since });
    if (options?.until) req.setQueryParams({ until: options.until });
    return req.send<LatencyResponse>(this.ctx, (json) =>
      LatencyModel._fromJsonObject(json as Record<string, unknown>)
    );
  }
}
