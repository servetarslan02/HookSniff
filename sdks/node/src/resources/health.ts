/**
 * HookSniff API Resource: Health
 */

import { HookSniffRequest, HttpMethod, type HookSniffRequestContext } from "../request";

export interface HealthOutput {
  status: string;
  db: { status: string; latency_ms: number };
  queue: { status: string; latency_ms: number; pending: number };
  otel?: { enabled: boolean; endpoint: string; headers_configured: boolean };
  uptime_seconds: number;
}

export class Health {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** Check API health */
  async check(): Promise<HealthOutput> {
    const req = new HookSniffRequest(HttpMethod.GET, "/health");
    return req.send<HealthOutput>(this.ctx);
  }
}
