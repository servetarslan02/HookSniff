import {
  type ListResponseMessageOut,
  ListResponseMessageOutSerializer,
} from "../models/listResponseMessageOut";
import { type MessageOut, MessageOutSerializer } from "../models/messageOut";
import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";
import { type MessageIn, MessageInSerializer } from "../models/messageIn";

export interface MessageListOptions {
  limit?: number;
  iterator?: string | null;
  channel?: string;
  before?: Date | null;
  after?: Date | null;
  withContent?: boolean;
  tag?: string;
  eventTypes?: string[];
}

export interface MessageCreateOptions {
  withContent?: boolean;
  idempotencyKey?: string;
}

export interface MessageGetOptions {
  withContent?: boolean;
}

export class Message {
  public constructor(private readonly requestCtx: HookSniffRequestContext) {}

  /**
   * List all messages.
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

  /** Get a message by its ID or eventID. */
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
