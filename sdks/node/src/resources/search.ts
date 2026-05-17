/**
 * HookSniff SDK — Search Resource
 */

import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";
import type { SearchResult } from "../models";

export interface SearchOptions {
  q: string;
  type?: string;
  limit?: number;
}

export class Search {
  constructor(private readonly requestCtx: HookSniffRequestContext) {}

  /** Search across endpoints, deliveries, teams, etc. */
  public query(options: SearchOptions): Promise<SearchResult[]> {
    const request = new HookSniffRequest(HttpMethod.GET, "/v1/search");
    request.setQueryParams({
      q: options.q,
      type: options.type,
      limit: options.limit,
    });
    return request.send(this.requestCtx, (json) => json as SearchResult[]);
  }
}
