/**
 * HookSniff API Resource: Health
 */

import { HookSniffRequest, HttpMethod, type HookSniffRequestContext } from "../request";
import { HealthModel, type HealthOutput } from "../models";

export type { HealthOutput };

export class Health {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** Check API health */
  async check(): Promise<HealthOutput> {
    const req = new HookSniffRequest(HttpMethod.GET, "/health");
    return req.send<HealthOutput>(this.ctx, (json) =>
      HealthModel._fromJsonObject(json as Record<string, unknown>)
    );
  }
}
