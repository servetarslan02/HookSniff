import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";

/**
 * Authentication operations.
 *
 * Manage authentication tokens and sessions.
 *
 * @example
 * ```ts
 * const hs = new HookSniff("hooksniff_xxx");
 *
 * // Logout current session
 * await hs.authentication.logout();
 * ```
 */
export class Authentication {
  public constructor(private readonly requestCtx: HookSniffRequestContext) {}

  /**
   * Logout the current auth token.
   *
   * This invalidates the token used to authenticate this client.
   * After calling this, all subsequent API calls will fail with 401.
   */
  public logout(): Promise<void> {
    const request = new HookSniffRequest(HttpMethod.POST, "/api/v1/auth/logout");
    return request.sendNoResponseBody(this.requestCtx);
  }
}
