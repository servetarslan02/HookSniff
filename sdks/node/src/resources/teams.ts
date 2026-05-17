/**
 * HookSniff SDK — Teams Resource
 */

import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";
import type {
  Team,
  TeamDetailResponse,
  CreateTeamRequest,
  InviteRequest,
  ChangeRoleRequest,
} from "../models";

export class Teams {
  constructor(private readonly requestCtx: HookSniffRequestContext) {}

  /** List all teams. */
  public list(): Promise<Team[]> {
    const request = new HookSniffRequest(HttpMethod.GET, "/v1/teams");
    return request.send(this.requestCtx, (json) => json as Team[]);
  }

  /** Get a team by ID (includes members and invites). */
  public get(teamId: string): Promise<TeamDetailResponse> {
    const request = new HookSniffRequest(HttpMethod.GET, "/v1/teams/{id}");
    request.setPathParam("id", teamId);
    return request.send(this.requestCtx, (json) => json as TeamDetailResponse);
  }

  /** Create a new team. */
  public create(body: CreateTeamRequest): Promise<Team> {
    const request = new HookSniffRequest(HttpMethod.POST, "/v1/teams");
    request.setBody(body);
    return request.send(this.requestCtx, (json) => json as Team);
  }

  /** Delete a team. */
  public delete(teamId: string): Promise<void> {
    const request = new HookSniffRequest(HttpMethod.DELETE, "/v1/teams/{id}");
    request.setPathParam("id", teamId);
    return request.sendNoResponseBody(this.requestCtx);
  }

  /** Invite a member to the team. */
  public invite(teamId: string, body: InviteRequest): Promise<void> {
    const request = new HookSniffRequest(HttpMethod.POST, "/v1/teams/{id}/invite");
    request.setPathParam("id", teamId);
    request.setBody(body);
    return request.sendNoResponseBody(this.requestCtx);
  }

  /** Remove a member from the team. */
  public removeMember(teamId: string, userId: string): Promise<void> {
    const request = new HookSniffRequest(HttpMethod.DELETE, "/v1/teams/{id}/members/{uid}");
    request.setPathParam("id", teamId);
    request.setPathParam("uid", userId);
    return request.sendNoResponseBody(this.requestCtx);
  }

  /** Change a member's role. */
  public changeMemberRole(teamId: string, userId: string, body: ChangeRoleRequest): Promise<void> {
    const request = new HookSniffRequest(HttpMethod.PUT, "/v1/teams/{id}/members/{uid}/role");
    request.setPathParam("id", teamId);
    request.setPathParam("uid", userId);
    request.setBody(body);
    return request.sendNoResponseBody(this.requestCtx);
  }
}
