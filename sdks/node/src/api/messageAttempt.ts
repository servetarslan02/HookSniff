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

export class MessageAttempt {
  public constructor(private readonly requestCtx: HookSniffRequestContext) {}

  /**
   * List attempts by endpoint id.
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
   * List attempts by message ID.
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

  /** Get a message attempt by ID. */
  public get(msgId: string, attemptId: string): Promise<MessageAttemptOut> {
    const request = new HookSniffRequest(
      HttpMethod.GET,
      "/api/v1/msg/{msg_id}/attempt/{attempt_id}"
    );

    request.setPathParam("msg_id", msgId);
    request.setPathParam("attempt_id", attemptId);

    return request.send(this.requestCtx, MessageAttemptOutSerializer._fromJsonObject);
  }

  /** Resend a message to the specified endpoint. */
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
