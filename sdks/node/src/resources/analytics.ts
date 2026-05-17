/**
 * HookSniff SDK — Analytics Resource
 */

import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";
import type {
  StatsResponse,
  AnalyticsTrendResponse,
  SuccessRateResponse,
  LatencyTrendResponse,
  DeliveryTrendResponse,
} from "../models";

export interface AnalyticsOptions {
  range?: "1h" | "24h" | "7d" | "30d" | "90d";
  endpoint_id?: string;
}

export class Analytics {
  constructor(private readonly requestCtx: HookSniffRequestContext) {}

  /** Get overall stats. */
  public stats(options?: AnalyticsOptions): Promise<StatsResponse> {
    const request = new HookSniffRequest(HttpMethod.GET, "/v1/stats");
    request.setQueryParams({ range: options?.range });
    return request.send(this.requestCtx, (json) => json as StatsResponse);
  }

  /** Get delivery trends over time. */
  public deliveryTrends(options?: AnalyticsOptions): Promise<DeliveryTrendResponse> {
    const request = new HookSniffRequest(HttpMethod.GET, "/v1/analytics/deliveries");
    request.setQueryParams({
      range: options?.range,
      endpoint_id: options?.endpoint_id,
    });
    return request.send(this.requestCtx, (json) => json as DeliveryTrendResponse);
  }

  /** Get success rate analytics. */
  public successRate(options?: AnalyticsOptions): Promise<SuccessRateResponse> {
    const request = new HookSniffRequest(HttpMethod.GET, "/v1/analytics/success-rate");
    request.setQueryParams({
      range: options?.range,
      endpoint_id: options?.endpoint_id,
    });
    return request.send(this.requestCtx, (json) => json as SuccessRateResponse);
  }

  /** Get latency trends. */
  public latency(options?: AnalyticsOptions): Promise<LatencyTrendResponse> {
    const request = new HookSniffRequest(HttpMethod.GET, "/v1/analytics/latency");
    request.setQueryParams({
      range: options?.range,
      endpoint_id: options?.endpoint_id,
    });
    return request.send(this.requestCtx, (json) => json as LatencyTrendResponse);
  }
}
