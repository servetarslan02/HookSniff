/**
 * HookSniff API Resource: Applications
 *
 * Manage applications — create, list, update, delete.
 */

import { HookSniffRequest, HttpMethod, type HookSniffRequestContext } from "../request";

export interface ApplicationOutput {
  id: string;
  customer_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  endpoint_count: number;
  created_at: string;
  updated_at: string;
}

export interface ApplicationCreateInput {
  name: string;
  description?: string;
}

export interface ApplicationUpdateInput {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export class Applications {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** List all applications */
  async list(): Promise<ApplicationOutput[]> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/applications");
    return req.send<ApplicationOutput[]>(this.ctx, (json) => {
      return Array.isArray(json) ? json : [];
    });
  }

  /** Get a single application by ID */
  async get(id: string): Promise<ApplicationOutput> {
    const req = new HookSniffRequest(HttpMethod.GET, `/v1/applications/${id}`);
    return req.send<ApplicationOutput>(this.ctx);
  }

  /** Create a new application */
  async create(input: ApplicationCreateInput): Promise<ApplicationOutput> {
    const req = new HookSniffRequest(HttpMethod.POST, "/v1/applications");
    req.setBody(input);
    return req.send<ApplicationOutput>(this.ctx);
  }

  /** Update an application */
  async update(id: string, input: ApplicationUpdateInput): Promise<ApplicationOutput> {
    const req = new HookSniffRequest(HttpMethod.PUT, `/v1/applications/${id}`);
    req.setBody(input);
    return req.send<ApplicationOutput>(this.ctx);
  }

  /** Delete an application */
  async delete(id: string): Promise<{ message: string }> {
    const req = new HookSniffRequest(HttpMethod.DELETE, `/v1/applications/${id}`);
    return req.send<{ message: string }>(this.ctx);
  }
}
