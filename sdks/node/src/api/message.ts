import {
  type ListResponseMessageOut,
  ListResponseMessageOutSerializer,
} from "../models/listResponseMessageOut";
import { type MessageOut, MessageOutSerializer } from "../models/messageOut";
import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";
import { type MessageIn, MessageInSerializer } from "../models/messageIn";

/** Options for listing messages */
export interface MessageListOptions {
  /** Maximum number of messages to return */
  limit?: number;
  /** Cursor for pagination */
  iterator?: string | null;
  /** Filter by channel */
  channel?: string;
  /** Only include messages created before this date */
  before?: Date | null;
  /** Only include messages created after this date */
  after?: Date | null;
  /** Include message payloads in response */
  withContent?: boolean;
  /** Filter by tag */
  tag?: string;
  /** Filter by event types */
  eventTypes?: string[];
}

/** Options for creating a message */
export interface MessageCreateOptions {
  /** Include message payload in response */
  withContent?: boolean;
  /** Idempotency key for safe retries */
  idempotencyKey?: string;
}

/** Options for getting a message */
export interface MessageGetOptions {
  /** Include message payload in response */
  withContent?: boolean;
}

/**
 * Manage messages (webhook events).
 *
 * Messages are the webhook payloads that HookSniff delivers to your endpoints.
 * Create a message to trigger webhook delivery to all matching endpoints.
 *
 * @example
 * ```ts
 * const hs = new HookSniff("hooksniff_xxx");
 *
 * // Create and send a webhook message
 * const message = await hs.message.create({
 *   eventType: "order.created",
 *   payload: { orderId: "12345", total: 99.99 },
 * });
 *
 * // List recent messages
 * const { data } = await hs.message.list({ limit: 10 });
 *
 * // Get a specific message
 * const details = await hs.message.get(message.id);
 * ```
 */
export class Message {
  public constructor(private readonly requestCtx: HookSniffRequestContext) {}

  /**
   * List all messages.
   *
   * Note: By default, this endpoint returns the last 90 days of data.
   * Use `before`/`after` to filter by date range.
   *
   * @param options - Filtering and pagination options
   * @returns A paginated list of messages
   *
   * @example
   * ```ts
   * // List last 10 messages
   * const { data } = await hs.message.list({ limit: 10 });
   *
   * // Filter by event type
   * const { data: orders } = await hs.message.list({
   *   eventTypes: ["order.created", "order.updated"],
   * });
   * ```
   */
  public list(options?: MessageListOptions): Promise<ListResponseMessageOut> {
    const request = new HookSniffRequest(HttpMethod.GET, "/api/v1/msg");

    request.setQueryParams({
      limit: options?.limit,
      iterator: options?.iterator,
      channel: options?.channel,
      before: options?.before,
      after: options?.after,
      with_content: options?.withContent,
      tag: options?.tag,
      event_types: options?.eventTypes,
    });

    return request.send(
      this.requestCtx,
      ListResponseMessageOutSerializer._fromJsonObject
    );
  }

  /**
   * Create a new message and dispatch it to all matching endpoints.
   *
   * The `eventType` determines which endpoints receive the webhook.
   * Endpoints can filter by event type and channel.
   *
   * @param messageIn - The message to create
   * @param options - Request options
   * @returns The created message with its ID
   *
   * @example
   * ```ts
   * // Simple message
   * const msg = await hs.message.create({
   *   eventType: "user.signup",
   *   payload: { userId: "u_123", email: "user@example.com" },
   * });
   *
   * // Message with channels and tags
   * const msg = await hs.message.create({
   *   eventType: "order.created",
   *   payload: { orderId: "o_456" },
   *   channels: ["orders"],
   *   tags: ["priority"],
   * });
   *
   * // Schedule delivery for later
   * const msg = await hs.message.create({
   *   eventType: "reminder.send",
   *   payload: { message: "Your appointment is tomorrow" },
   *   deliverAt: new Date(Date.now() + 3600000), // 1 hour from now
   * });
   * ```
   */
  public create(
    messageIn: MessageIn,
    options?: MessageCreateOptions
  ): Promise<MessageOut> {
    const request = new HookSniffRequest(HttpMethod.POST, "/api/v1/msg");

    request.setQueryParams({
      with_content: options?.withContent,
    });
    request.setHeaderParam("idempotency-key", options?.idempotencyKey);
    request.setBody(MessageInSerializer._toJsonObject(messageIn));

    return request.send(this.requestCtx, MessageOutSerializer._fromJsonObject);
  }

  /**
   * Get a message by its ID.
   *
   * @param msgId - The message's unique ID
   * @param options - Options (include payload)
   * @returns The message details
   *
   * @example
   * ```ts
   * const msg = await hs.message.get("msg_abc123");
   * console.log(msg.eventType, msg.payload);
   * ```
   */
  public get(msgId: string, options?: MessageGetOptions): Promise<MessageOut> {
    const request = new HookSniffRequest(HttpMethod.GET, "/api/v1/msg/{msg_id}");

    request.setPathParam("msg_id", msgId);
    request.setQueryParams({
      with_content: options?.withContent,
    });

    return request.send(this.requestCtx, MessageOutSerializer._fromJsonObject);
  }
}

/**
 * Creates a `MessageIn` with a raw string payload.
 *
 * Use this when you need to send non-JSON payloads or preserve
 * the exact formatting of your payload.
 *
 * @param eventType - The event type name
 * @param payload - The raw payload string
 * @param contentType - Optional Content-Type header override
 * @returns A MessageIn object ready for `hs.message.create()`
 *
 * @example
 * ```ts
 * import { messageInRaw } from "hooksniff";
 *
 * const msg = messageInRaw("webhook.received", '{"raw": true}', "application/json");
 * await hs.message.create(msg);
 * ```
 */
export function messageInRaw(
  eventType: string,
  payload: string,
  contentType?: string
): MessageIn {
  const headers = contentType ? { "content-type": contentType } : undefined;

  return {
    eventType,
    payload: {},
    transformationsParams: {
      rawPayload: payload,
      headers,
    },
  };
}
