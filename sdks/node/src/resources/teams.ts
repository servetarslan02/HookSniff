/**
 * HookSniff API Resource: Teams
 */

import { HookSniffRequest, HttpMethod, type HookSniffRequestContext } from "../request";
import { TeamMemberModel, type TeamMember } from "../models";
import { paginate, collectAll, type PaginationOptions } from "../pagination";

export type { TeamMember };

export class Teams {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** List team members */
  async list(): Promise<TeamMember[]> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/teams/members");
    return req.send<TeamMember[]>(this.ctx, (json) => {
      const arr = Array.isArray(json) ? json : [];
      return arr.map((item) =>
        typeof item === "object" && item !== null
          ? TeamMemberModel._fromJsonObject(item as Record<string, unknown>)
          : item
      );
    });
  }

  /** Iterate through all team members with automatic pagination */
  listAll(options?: PaginationOptions): AsyncGenerator<TeamMember, void, undefined> {
    return paginate(async ({ limit, offset }) => {
      const req = new HookSniffRequest(HttpMethod.GET, "/v1/teams/members");
      req.setQueryParams({ limit, offset });
      return req.send<{ data: TeamMember[]; has_more: boolean }>(this.ctx, (json) => {
        const obj = json as Record<string, unknown>;
        const data = Array.isArray(obj.data)
          ? obj.data.map((item) =>
              typeof item === "object" && item !== null
                ? TeamMemberModel._fromJsonObject(item as Record<string, unknown>)
                : item
            )
          : [];
        return { data, has_more: Boolean(obj.has_more ?? false) };
      });
    }, options);
  }

  /** Invite a team member */
  async invite(email: string, role: string, idempotencyKey?: string): Promise<void> {
    const req = new HookSniffRequest(HttpMethod.POST, "/v1/teams/invite");
    if (idempotencyKey) req.setHeaderParam("idempotency-key", idempotencyKey);
    req.setBody({ email, role });
    return req.sendVoid(this.ctx);
  }

  /** Remove a team member */
  async remove(memberId: string): Promise<void> {
    const req = new HookSniffRequest(HttpMethod.DELETE, "/v1/teams/members/{id}");
    req.setPathParam("id", memberId);
    return req.sendVoid(this.ctx);
  }
}
