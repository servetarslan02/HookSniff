/**
 * HookSniff SDK — Main Entry Point
 *
 * A clean, modern SDK for the HookSniff webhook delivery API.
 *
 * Usage:
 *   import { HookSniff } from 'hooksniff-sdk';
 *
 *   const hs = new HookSniff({ apiKey: 'your-api-key' });
 *
 *   // List endpoints
 *   const endpoints = await hs.endpoints.list();
 *
 *   // Send a webhook
 *   const delivery = await hs.webhooks.send({
 *     endpoint_id: 'ep_123',
 *     event: 'order.created',
 *     data: { order_id: '12345' }
 *   });
 *
 *   // Verify incoming webhook signature
 *   import { Webhook } from 'hooksniff-sdk';
 *   const wh = new Webhook('whsec_...');
 *   const payload = wh.verify(rawBody, headers);
 */

import type { HookSniffRequestContext } from "./request";

import { Endpoints } from "./resources/endpoints";
import { Webhooks } from "./resources/webhooks";
import { Auth } from "./resources/auth";
import { Analytics } from "./resources/analytics";
import { ApiKeys } from "./resources/apiKeys";
import { Alerts } from "./resources/alerts";
import { Teams } from "./resources/teams";
import { Search } from "./resources/search";
import { Billing } from "./resources/billing";
import { Health } from "./resources/health";
import { Applications } from "./resources/applications";
import { ServiceTokens } from "./resources/serviceTokens";
import { Inbound } from "./resources/inbound";
import { Admin } from "./resources/admin";

const DEFAULT_BASE_URL = "https://hooksniff-api-1046140057667.europe-west1.run.app";

export interface HookSniffOptions {
  /** Your API key (JWT token or API key) */
  apiKey: string;

  /** Base URL of the HookSniff API (default: production) */
  baseUrl?: string;

  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;

  /** Number of retries for 5xx errors (default: 2) */
  numRetries?: number;

  /** Custom fetch implementation (default: globalThis.fetch) */
  fetch?: typeof globalThis.fetch;
}

export class HookSniff {
  private readonly ctx: HookSniffRequestContext;

  /** Webhook endpoints management */
  public readonly endpoints: Endpoints;

  /** Webhook send, list, replay */
  public readonly webhooks: Webhooks;

  /** Authentication (register, login, 2FA) */
  public readonly auth: Auth;

  /** Delivery analytics */
  public readonly analytics: Analytics;

  /** API key management */
  public readonly apiKeys: ApiKeys;

  /** Alert rules and notifications */
  public readonly alerts: Alerts;

  /** Team management */
  public readonly teams: Teams;

  /** Search deliveries */
  public readonly search: Search;

  /** Billing and subscription */
  public readonly billing: Billing;

  /** API health check */
  public readonly health: Health;

  /** Application management (Hook0-style) */
  public readonly applications: Applications;

  /** Service token management */
  public readonly serviceTokens: ServiceTokens;

  /** Inbound webhook configs */
  public readonly inbound: Inbound;

  /** Admin-only endpoints (stats, users, settings, feature flags) */
  public readonly admin: Admin;

  constructor(options: HookSniffOptions) {
    if (!options.apiKey) {
      throw new Error("HookSniff: apiKey is required");
    }

    this.ctx = {
      baseUrl: (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, ""),
      token: options.apiKey,
      timeout: options.timeout ?? 30000,
      numRetries: options.numRetries ?? 2,
      fetch: options.fetch,
    };

    this.endpoints = new Endpoints(this.ctx);
    this.webhooks = new Webhooks(this.ctx);
    this.auth = new Auth(this.ctx);
    this.analytics = new Analytics(this.ctx);
    this.apiKeys = new ApiKeys(this.ctx);
    this.alerts = new Alerts(this.ctx);
    this.teams = new Teams(this.ctx);
    this.search = new Search(this.ctx);
    this.billing = new Billing(this.ctx);
    this.health = new Health(this.ctx);
    this.applications = new Applications(this.ctx);
    this.serviceTokens = new ServiceTokens(this.ctx);
    this.inbound = new Inbound(this.ctx);
    this.admin = new Admin(this.ctx);
  }
}

// Re-export core
export { Webhook, WebhookVerificationError } from "./webhook";
export type { WebhookHeaders, WebhookSvixHeaders } from "./webhook";
export { ApiException } from "./request";
export type { HookSniffRequestContext } from "./request";

// Re-export all models and types
export * from "./models";

// Re-export pagination utilities
export { paginate, collectAll } from "./pagination";
export type { Page, PaginationOptions } from "./pagination";
