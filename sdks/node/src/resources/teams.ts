/**
 * HookSniff API Resource: Teams
 */

import { HookSniffRequest, HttpMethod, type HookSniffRequestContext } from "../request";

export interface TeamMember {
  id: string;
  email: string;
  role: string;
  joined_at: string;
}

export class Teams {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** List team members */
  async list(): Promise<TeamMember[]> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/teams/members");
    return req.send<TeamMember[]>(this.ctx);
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
