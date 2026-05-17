/**
 * HookSniff SDK — Main Entry Point
 *
 * A clean, modern SDK for the HookSniff webhook delivery API.
 * Architecture based on Svix SDK (MIT License), adapted for HookSniff.
 *
 * Usage:
 *   import { HookSniff } from 'hooksniff-sdk';
 *
 *   const hs = new HookSniff({ apiKey: 'hooksniff_xxx' });
 *
 *   // List endpoints
 *   const endpoints = await hs.endpoints.list();
 *
 *   // Auto-paginate through all endpoints
 *   for await (const ep of hs.endpoints.listAll()) {
 *     console.log(ep.url);
 *   }
 *
 *   // Send a webhook
 *   const delivery = await hs.webhooks.send({
 *     endpoint_id: 'ep_123',
 *     event: 'order.created',
 *     data: { order_id: '12345' },
 *   });
 *
 *   // Verify incoming webhook signature
 *   import { Webhook } from 'hooksniff-sdk';
 *   const wh = new Webhook('whsec_...');
 *   const payload = wh.verify(rawBody, headers);
 */

import type { HookSniffRequestContext } from "./request";
import type { XOR } from "./util";

// Resources
import { Endpoints } from "./resources/endpoints";
import { Webhooks } from "./resources/webhooks";
import { Auth } from "./resources/auth";
import { ApiKeys } from "./resources/apiKeys";
import { Teams } from "./resources/teams";
import { Alerts } from "./resources/alerts";
import { Analytics } from "./resources/analytics";
import { Billing } from "./resources/billing";
import { Health } from "./resources/health";
import { Search } from "./resources/search";
import { Notifications } from "./resources/notifications";
import { Admin } from "./resources/admin";

// Re-export types
export { type PostOptions, ApiException } from "./util";
export { HttpErrorOut, HTTPValidationError, ValidationError } from "./HttpErrors";
export { Webhook, WebhookVerificationError } from "./webhook";
export type {
  WebhookRequiredHeaders,
  WebhookUnbrandedRequiredHeaders,
  WebhookOptions,
} from "./webhook";
export * from "./models/index";

// Default base URL
const DEFAULT_BASE_URL = "https://hooksniff-api-1046140057667.europe-west1.run.app";

export type HookSniffOptions = {
  /** The API base URL. Defaults to production. */
  serverUrl?: string;
  /** Time in milliseconds to wait for requests. */
  requestTimeout?: number;
  /** Debug mode — logs requests/responses. */
  debug?: boolean;
  /**
   * Custom fetch implementation.
   * Useful for testing or non-standard environments.
   */
  fetch?: typeof fetch;
} & XOR<
  {
    /** List of delays (in ms) before each retry attempt. */
    retryScheduleInMs?: number[];
  },
  {
    /** Number of retries on 5xx errors. Default: 2 */
    numRetries?: number;
  }
>;

/**
 * HookSniff API Client
 *
 * @example
 * ```ts
 * const hs = new HookSniff({ apiKey: 'hooksniff_xxx' });
 *
 * // List endpoints
 * const { data } = await hs.endpoints.list();
 *
 * // Send a webhook
 * const delivery = await hs.webhooks.send({
 *   endpoint_id: 'ep_123',
 *   event: 'order.created',
 *   data: { order_id: '12345' },
 * });
 * ```
 */
export class HookSniff {
  protected readonly requestCtx: HookSniffRequestContext;

  /** Endpoints CRUD */
  public readonly endpoints: Endpoints;
  /** Webhook sending & delivery management */
  public readonly webhooks: Webhooks;
  /** Authentication & account management */
  public readonly auth: Auth;
  /** API key management */
  public readonly apiKeys: ApiKeys;
  /** Team management */
  public readonly teams: Teams;
  /** Alert rules */
  public readonly alerts: Alerts;
  /** Analytics & stats */
  public readonly analytics: Analytics;
  /** Billing & subscription */
  public readonly billing: Billing;
  /** API health check */
  public readonly health: Health;
  /** Search */
  public readonly search: Search;
  /** Notifications & push devices */
  public readonly notifications: Notifications;
  /** Admin operations (requires admin API key) */
  public readonly admin: Admin;

  /**
   * Create a new HookSniff client.
   *
   * @param apiKey - Your HookSniff API key (starts with `hooksniff_`)
   * @param options - Optional configuration
   */
  public constructor(apiKey: string, options: HookSniffOptions = {}) {
    const baseUrl: string = options.serverUrl ?? DEFAULT_BASE_URL;

    if (options.retryScheduleInMs) {
      this.requestCtx = {
        baseUrl,
        token: apiKey,
        timeout: options.requestTimeout,
        retryScheduleInMs: options.retryScheduleInMs,
        fetch: options.fetch,
      };
    } else {
      this.requestCtx = {
        baseUrl,
        token: apiKey,
        timeout: options.requestTimeout,
        numRetries: options.numRetries ?? 2,
        fetch: options.fetch,
      };
    }

    this.endpoints = new Endpoints(this.requestCtx);
    this.webhooks = new Webhooks(this.requestCtx);
    this.auth = new Auth(this.requestCtx);
    this.apiKeys = new ApiKeys(this.requestCtx);
    this.teams = new Teams(this.requestCtx);
    this.alerts = new Alerts(this.requestCtx);
    this.analytics = new Analytics(this.requestCtx);
    this.billing = new Billing(this.requestCtx);
    this.health = new Health(this.requestCtx);
    this.search = new Search(this.requestCtx);
    this.notifications = new Notifications(this.requestCtx);
    this.admin = new Admin(this.requestCtx);
  }
}
