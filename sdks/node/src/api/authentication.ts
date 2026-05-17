import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";

export class Authentication {
  public constructor(private readonly requestCtx: HookSniffRequestContext) {}

  /**
   * Logout the current auth token.
   */
  public logout(): Promise<void> {
    const request = new HookSniffRequest(HttpMethod.POST, "/api/v1/auth/logout");
    return request.sendNoResponseBody(this.requestCtx);
  }
}
