/**
 * Message Poller — Cursor-based message polling.
 *
 * Allows consumers to poll for new messages using a cursor.
 * Each consumer tracks their position in the message stream.
 */
import {
  type MessagePollerPollResponse, MessagePollerPollResponseSerializer,
} from "../models/messagePollerPollResponse";
import {
  type MessagePollerCursorResponse, MessagePollerCursorResponseSerializer,
} from "../models/messagePollerCursorResponse";
import {
  type MessagePollerCommitResponse, MessagePollerCommitResponseSerializer,
} from "../models/messagePollerCommitResponse";
import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";

export interface PollOptions {
  limit?: number;
  endpointId?: string;
  eventType?: string;
  includePayload?: boolean;
}

export interface SeekOptions {
  endpointId?: string;
}

export interface CommitOptions {
  endpointId?: string;
}

export class MessagePoller {
  public constructor(private readonly requestCtx: HookSniffRequestContext) {}

  /**
   * Poll for new messages since the consumer's cursor.
   *
   * @param consumerId - Unique identifier for the consumer
   * @param options - Optional filters (limit, endpointId, eventType, includePayload)
   */
  public poll(consumerId: string, options?: PollOptions): Promise<MessagePollerPollResponse> {
    const request = new HookSniffRequest(HttpMethod.GET, "/api/v1/message-poller/poll");
    request.setQueryParam("consumer_id", consumerId);
    if (options?.limit !== undefined) request.setQueryParam("limit", options.limit.toString());
    if (options?.endpointId) request.setQueryParam("endpoint_id", options.endpointId);
    if (options?.eventType) request.setQueryParam("event_type", options.eventType);
    if (options?.includePayload !== undefined) request.setQueryParam("include_payload", options.includePayload.toString());
    return request.send(this.requestCtx, MessagePollerPollResponseSerializer._fromJsonObject);
  }

  /**
   * Seek cursor to a specific message.
   * Sets the consumer's cursor to the given message ID.
   *
   * @param consumerId - Unique identifier for the consumer
   * @param messageId - Message ID to seek to
   * @param options - Optional endpoint filter
   */
  public seek(consumerId: string, messageId: string, options?: SeekOptions): Promise<MessagePollerCursorResponse> {
    const request = new HookSniffRequest(HttpMethod.POST, "/api/v1/message-poller/seek");
    request.setBody({
      consumer_id: consumerId,
      message_id: messageId,
      endpoint_id: options?.endpointId,
    });
    return request.send(this.requestCtx, MessagePollerCursorResponseSerializer._fromJsonObject);
  }

  /**
   * Commit cursor — advance past a processed message.
   * Moves the cursor forward to the given message ID.
   *
   * @param consumerId - Unique identifier for the consumer
   * @param messageId - Message ID to commit past
   * @param options - Optional endpoint filter
   */
  public commit(consumerId: string, messageId: string, options?: CommitOptions): Promise<MessagePollerCommitResponse> {
    const request = new HookSniffRequest(HttpMethod.POST, "/api/v1/message-poller/commit");
    request.setBody({
      consumer_id: consumerId,
      message_id: messageId,
      endpoint_id: options?.endpointId,
    });
    return request.send(this.requestCtx, MessagePollerCommitResponseSerializer._fromJsonObject);
  }
}
