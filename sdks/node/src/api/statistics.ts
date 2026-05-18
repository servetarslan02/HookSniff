import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";

/**
 * Usage statistics.
 *
 * Get aggregate statistics about your webhook usage.
 *
 * @example
 * ```ts
 * const hs = new HookSniff("hooksniff_xxx");
 *
 * // Get app usage stats
 * const stats = await hs.statistics.aggregateAppStats();
 * ```
 */
export class Statistics {
  public constructor(private readonly requestCtx: HookSniffRequestContext) {}

  /**
   * Get aggregate application statistics.
   *
   * Returns message delivery counts and other usage metrics.
   */
  public aggregateAppStats(): Promise<any> {
    const request = new HookSniffRequest(HttpMethod.GET, "/api/v1/stats/usage/app");
    return request.send(this.requestCtx, (x) => x);
  }
}
