/**
 * HookSniff SDK — Health Resource
 */

import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";
import type { SystemStatus } from "../models";

export class Health {
  constructor(private readonly requestCtx: HookSniffRequestContext) {}

  /** Check API health. */
  public check(): Promise<SystemStatus> {
    const request = new HookSniffRequest(HttpMethod.GET, "/v1/health");
    return request.send(this.requestCtx, (json) => json as SystemStatus);
  }
}
