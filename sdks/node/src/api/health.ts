import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";

/**
 * Health check operations.
 *
 * Verify connectivity to the HookSniff API.
 *
 * @example
 * ```ts
 * const hs = new HookSniff("hooksniff_xxx");
 *
 * // Check API health
 * await hs.health.ping(); // throws on failure
 * ```
 */
export class Health {
  public constructor(private readonly requestCtx: HookSniffRequestContext) {}

  /**
   * Ping the API to verify connectivity.
   *
   * @throws {HookSniffError} If the API is unreachable or returns an error
   */
  public ping(): Promise<void> {
    const request = new HookSniffRequest(HttpMethod.GET, "/api/v1/health/ping");
    return request.sendNoResponseBody(this.requestCtx);
  }
}
