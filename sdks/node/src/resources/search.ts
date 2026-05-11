/**
 * HookSniff API Resource: Search
 */

import { HookSniffRequest, HttpMethod, type HookSniffRequestContext } from "../request";
import { SearchModel, type SearchResult } from "../models";

export type { SearchResult };

export class Search {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** Search webhook deliveries */
  async query(q: string, options?: { limit?: number }): Promise<SearchResult[]> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/search");
    req.setQueryParams({ q, ...options });
    return req.send<SearchResult[]>(this.ctx, (json) => {
      const arr = Array.isArray(json) ? json : [];
      return arr.map((item) =>
        typeof item === "object" && item !== null
          ? SearchModel._fromJsonObject(item as Record<string, unknown>)
          : item
      );
    });
  }
}
