import {
  type ListResponseMessageAttemptOut,
  ListResponseMessageAttemptOutSerializer,
} from "../models/listResponseMessageAttemptOut";
import {
  type MessageAttemptOut,
  MessageAttemptOutSerializer,
} from "../models/messageAttemptOut";
import type { MessageStatus } from "../models/messageStatus";
import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";

/** Options for listing attempts by endpoint */
export interface MessageAttemptListByEndpointOptions {
  limit?: number;
  iterator?: string | null;
  status?: MessageStatus;
  channel?: string;
  tag?: string;
  before?: Date | null;
  after?: Date | null;
  withContent?: boolean;
  withMsg?: boolean;
  expandedStatuses?: boolean;
  eventTypes?: string[];
}

/** Options for listing attempts by message */
export interface MessageAttemptListByMsgOptions {
  limit?: number;
  iterator?: string | null;
  status?: MessageStatus;
  channel?: string;
  tag?: string;
  endpointId?: string;
  before?: Date | null;
  after?: Date | null;
  withContent?: boolean;
  expandedStatuses?: boolean;
  eventTypes?: string[];
}

/**
 * Inspect webhook delivery attempts.
 *
 * Use this to debug failed deliveries, check delivery status,
 * and resend messages to specific endpoints.
 *
 * @example
 * ```ts
 * const hs = new HookSniff("hooksniff_xxx");
 *
 * // List failed attempts for an endpoint
 * const { data } = await hs.messageAttempt.listByEndpoint("ep_abc123", {
 *   status: "failed",
 * });
 *
 * // List all attempts for a message
 * const { data } = await hs.messageAttempt.listByMsg("msg_xyz");
 *
 * // Get attempt details
 * const attempt = await hs.messageAttempt.get("msg_xyz", "atm_123");
 *
 * // Resend a failed attempt
 * await hs.messageAttempt.resend("msg_xyz", "ep_abc123");
 * ```
 */
export class MessageAttempt {
  public constructor(private readonly requestCtx: HookSniffRequestContext) {}

  /**
   * List delivery attempts for a specific endpoint.
   *
   * @param endpointId - The endpoint to list attempts for
   * @param options - Filtering and pagination options
   * @returns A paginated list of delivery attempts
   *
   * @example
   * ```ts
   * // Get failed attempts
   * const { data } = await hs.messageAttempt.listByEndpoint("ep_123", {
   *   status: "failed",
   *   limit: 50,
   * });
   *
   * for (const attempt of data) {
   *   console.log(`Attempt ${attempt.id}: ${attempt.responseStatusCode}`);
   * }
   * ```
   */
  public listByEndpoint(
    endpointId: string,
    options?: MessageAttemptListByEndpointOptions
  ): Promise<ListResponseMessageAttemptOut> {
    const request = new HookSniffRequest(
      HttpMethod.GET,
      "/api/v1/attempt/endpoint/{endpoint_id}"
    );

    request.setPathParam("endpoint_id", endpointId);
    request.setQueryParams({
      limit: options?.limit,
      iterator: options?.iterator,
      status: options?.status,
      channel: options?.channel,
      tag: options?.tag,
      before: options?.before,
      after: options?.after,
      with_content: options?.withContent,
      with_msg: options?.withMsg,
      expanded_statuses: options?.expandedStatuses,
      event_types: options?.eventTypes,
    });

    return request.send(
      this.requestCtx,
      ListResponseMessageAttemptOutSerializer._fromJsonObject
    );
  }

  /**
   * List delivery attempts for a specific message.
   *
   * @param msgId - The message to list attempts for
   * @param options - Filtering and pagination options
   * @returns A paginated list of delivery attempts
   */
  public listByMsg(
    msgId: string,
    options?: MessageAttemptListByMsgOptions
  ): Promise<ListResponseMessageAttemptOut> {
    const request = new HookSniffRequest(
      HttpMethod.GET,
      "/api/v1/attempt/msg/{msg_id}"
    );

    request.setPathParam("msg_id", msgId);
    request.setQueryParams({
      limit: options?.limit,
      iterator: options?.iterator,
      status: options?.status,
      channel: options?.channel,
      tag: options?.tag,
      endpoint_id: options?.endpointId,
      before: options?.before,
      after: options?.after,
      with_content: options?.withContent,
      expanded_statuses: options?.expandedStatuses,
      event_types: options?.eventTypes,
    });

    return request.send(
      this.requestCtx,
      ListResponseMessageAttemptOutSerializer._fromJsonObject
    );
  }

  /**
   * Get a specific delivery attempt by ID.
   *
   * @param msgId - The message ID
   * @param attemptId - The attempt ID
   * @returns The attempt details including response status and body
   *
   * @example
   * ```ts
   * const attempt = await hs.messageAttempt.get("msg_123", "atm_456");
   * console.log(attempt.responseStatusCode); // 200
   * console.log(attempt.response); // Response body from your endpoint
   * ```
   */
  public get(msgId: string, attemptId: string): Promise<MessageAttemptOut> {
    const request = new HookSniffRequest(
      HttpMethod.GET,
      "/api/v1/msg/{msg_id}/attempt/{attempt_id}"
    );

    request.setPathParam("msg_id", msgId);
    request.setPathParam("attempt_id", attemptId);

    return request.send(this.requestCtx, MessageAttemptOutSerializer._fromJsonObject);
  }

  /**
   * Resend a message to a specific endpoint.
   *
   * This creates a new delivery attempt for the message.
   *
   * @param msgId - The message ID
   * @param endpointId - The endpoint to resend to
   *
   * @example
   * ```ts
   * // Resend after fixing endpoint URL
   * await hs.messageAttempt.resend("msg_123", "ep_abc123");
   * ```
   */
  public resend(msgId: string, endpointId: string): Promise<void> {
    const request = new HookSniffRequest(
      HttpMethod.POST,
      "/api/v1/msg/{msg_id}/endpoint/{endpoint_id}/resend"
    );

    request.setPathParam("msg_id", msgId);
    request.setPathParam("endpoint_id", endpointId);

    return request.sendNoResponseBody(this.requestCtx);
  }
}
