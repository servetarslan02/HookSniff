// this file is @generated

import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";

export class Health {
  public constructor(private readonly requestCtx: HookSniffRequestContext) {}

  /** Verify the API server is up and running. */
  public get(): Promise<void> {
    const request = new HookSniffRequest(HttpMethod.GET, "/api/v1/health");

    return request.sendNoResponseBody(this.requestCtx);
  }
}
