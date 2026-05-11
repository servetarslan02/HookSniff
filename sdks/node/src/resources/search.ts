/**
 * HookSniff API Resource: Search
 */

import { HookSniffRequest, HttpMethod, type HookSniffRequestContext } from "../request";

export interface SearchResult {
  id: string;
  type: string;
  data: unknown;
  score: number;
}

export class Search {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** Search webhook deliveries */
  async query(q: string, options?: { limit?: number }): Promise<SearchResult[]> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/search");
    req.setQueryParams({ q, ...options });
    return req.send<SearchResult[]>(this.ctx);
  }
}
