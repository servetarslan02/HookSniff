/**
 * Streaming — Real-time event streaming with channels and SSE.
 */
import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";

export interface StreamChannel {
  id: string;
  customerId: string;
  name: string;
  description?: string | null;
  channelType: string;
  eventFilter?: string[] | null;
  enabled: boolean;
  maxSubscribers: number;
  currentSubscribers: number;
  totalMessages: number;
  createdAt: string;
  updatedAt: string;
}

export interface StreamChannelDetail extends StreamChannel {
  recentMessages: StreamMessage[];
}

export interface StreamMessage {
  id: string;
  channelId: string;
  eventType: string;
  payload: Record<string, unknown>;
  deliveredCount: number;
  createdAt: string;
}

export interface StreamSubscription {
  id: string;
  channelId: string;
  customerId: string;
  connectionType: string;
  clientId?: string | null;
  eventFilter?: string[] | null;
  connectedAt: string;
  lastHeartbeatAt: string;
  messagesSent: number;
  metadata: Record<string, unknown>;
}

export interface StreamChannelIn {
  name: string;
  description?: string;
  channelType?: string;
  eventFilter?: string[];
  maxSubscribers?: number;
  enabled?: boolean;
}

export interface StreamChannelUpdate {
  name?: string;
  description?: string;
  eventFilter?: string[];
  maxSubscribers?: number;
  enabled?: boolean;
}

export interface PublishEventIn {
  channelId: string;
  eventType: string;
  payload: Record<string, unknown>;
}

export interface MessageListOptions {
  eventType?: string;
  limit?: number;
}

const ChannelFromJson = (json: any): StreamChannel => ({
  id: json['id'], customerId: json['customer_id'], name: json['name'],
  description: json['description'], channelType: json['channel_type'],
  eventFilter: json['event_filter'], enabled: json['enabled'],
  maxSubscribers: json['max_subscribers'], currentSubscribers: json['current_subscribers'],
  totalMessages: json['total_messages'], createdAt: json['created_at'], updatedAt: json['updated_at'],
});

const ChannelDetailFromJson = (json: any): StreamChannelDetail => ({
  ...ChannelFromJson(json),
  recentMessages: (json['recent_messages'] || []).map(MessageFromJson),
});

const MessageFromJson = (json: any): StreamMessage => ({
  id: json['id'], channelId: json['channel_id'], eventType: json['event_type'],
  payload: json['payload'], deliveredCount: json['delivered_count'], createdAt: json['created_at'],
});

const SubscriptionFromJson = (json: any): StreamSubscription => ({
  id: json['id'], channelId: json['channel_id'], customerId: json['customer_id'],
  connectionType: json['connection_type'], clientId: json['client_id'],
  eventFilter: json['event_filter'], connectedAt: json['connected_at'],
  lastHeartbeatAt: json['last_heartbeat_at'], messagesSent: json['messages_sent'],
  metadata: json['metadata'],
});

export class StreamApi {
  public constructor(private readonly requestCtx: HookSniffRequestContext) {}

  /** List all stream channels. */
  public listChannels(): Promise<StreamChannel[]> {
    const req = new HookSniffRequest(HttpMethod.GET, "/api/v1/stream/channels");
    return req.send(this.requestCtx, (arr: any[]) => arr.map(ChannelFromJson));
  }

  /** Get channel details with recent messages. */
  public getChannel(id: string): Promise<StreamChannelDetail> {
    const req = new HookSniffRequest(HttpMethod.GET, "/api/v1/stream/channels/{id}");
    req.setPathParam("id", id);
    return req.send(this.requestCtx, ChannelDetailFromJson);
  }

  /** Create a stream channel. */
  public createChannel(body: StreamChannelIn): Promise<StreamChannel> {
    const req = new HookSniffRequest(HttpMethod.POST, "/api/v1/stream/channels");
    req.setBody({
      name: body.name, description: body.description, channel_type: body.channelType,
      event_filter: body.eventFilter, max_subscribers: body.maxSubscribers, enabled: body.enabled,
    });
    return req.send(this.requestCtx, ChannelFromJson);
  }

  /** Update a channel. */
  public updateChannel(id: string, body: StreamChannelUpdate): Promise<StreamChannel> {
    const req = new HookSniffRequest(HttpMethod.PUT, "/api/v1/stream/channels/{id}");
    req.setPathParam("id", id);
    const payload: any = {};
    if (body.name !== undefined) payload.name = body.name;
    if (body.description !== undefined) payload.description = body.description;
    if (body.eventFilter !== undefined) payload.event_filter = body.eventFilter;
    if (body.maxSubscribers !== undefined) payload.max_subscribers = body.maxSubscribers;
    if (body.enabled !== undefined) payload.enabled = body.enabled;
    req.setBody(payload);
    return req.send(this.requestCtx, ChannelFromJson);
  }

  /** Delete a channel. */
  public deleteChannel(id: string): Promise<void> {
    const req = new HookSniffRequest(HttpMethod.DELETE, "/api/v1/stream/channels/{id}");
    req.setPathParam("id", id);
    return req.sendNoResponseBody(this.requestCtx);
  }

  /** List recent messages for a channel. */
  public listMessages(id: string, options?: MessageListOptions): Promise<StreamMessage[]> {
    const req = new HookSniffRequest(HttpMethod.GET, "/api/v1/stream/channels/{id}/messages");
    req.setPathParam("id", id);
    if (options?.eventType) req.setQueryParam("event_type", options.eventType);
    if (options?.limit) req.setQueryParam("limit", options.limit);
    return req.send(this.requestCtx, (arr: any[]) => arr.map(MessageFromJson));
  }

  /** List active subscriptions. */
  public listSubscriptions(): Promise<StreamSubscription[]> {
    const req = new HookSniffRequest(HttpMethod.GET, "/api/v1/stream/subscriptions");
    return req.send(this.requestCtx, (arr: any[]) => arr.map(SubscriptionFromJson));
  }

  /** Disconnect a subscription. */
  public disconnectSubscription(id: string): Promise<void> {
    const req = new HookSniffRequest(HttpMethod.DELETE, "/api/v1/stream/subscriptions/{id}");
    req.setPathParam("id", id);
    return req.sendNoResponseBody(this.requestCtx);
  }

  /** Publish an event to a channel. */
  public publish(body: PublishEventIn): Promise<{ success: boolean; messageId: string; deliveredTo: number }> {
    const req = new HookSniffRequest(HttpMethod.POST, "/api/v1/stream/publish");
    req.setBody({ channel_id: body.channelId, event_type: body.eventType, payload: body.payload });
    return req.send(this.requestCtx, (json: any) => ({
      success: json['success'], messageId: json['message_id'], deliveredTo: json['delivered_to'],
    }));
  }
}
