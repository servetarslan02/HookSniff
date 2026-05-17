/**
 * Integrations — Connect connectors to endpoints with event routing.
 */
import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";

export interface Integration {
  id: string;
  customerId: string;
  name: string;
  description?: string | null;
  connectorConfigId: string;
  connectorName: string;
  connectorDisplayName: string;
  endpointId: string;
  endpointUrl: string;
  enabled: boolean;
  eventFilter?: string[] | null;
  transformId?: string | null;
  retryPolicy: Record<string, unknown>;
  metadata: Record<string, unknown>;
  lastTriggeredAt?: string | null;
  lastSuccessAt?: string | null;
  lastFailureAt?: string | null;
  failureCount: number;
  totalDeliveries: number;
  totalFailures: number;
  healthStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationEvent {
  id: string;
  integrationId: string;
  eventType: string;
  sourceEventId?: string | null;
  payload: Record<string, unknown>;
  status: string;
  deliveryId?: string | null;
  errorMessage?: string | null;
  attempts: number;
  durationMs?: number | null;
  createdAt: string;
  processedAt?: string | null;
}

export interface IntegrationStats {
  totalEvents: number;
  delivered: number;
  failed: number;
  pending: number;
  filtered: number;
  avgDurationMs?: number | null;
  successRate: number;
  last24hEvents: number;
  last24hFailures: number;
}

export interface IntegrationIn {
  name: string;
  description?: string;
  connectorConfigId: string;
  endpointId: string;
  eventFilter?: string[];
  transformId?: string;
  retryPolicy?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  enabled?: boolean;
}

export interface IntegrationUpdate {
  name?: string;
  description?: string;
  endpointId?: string;
  eventFilter?: string[];
  transformId?: string;
  retryPolicy?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  enabled?: boolean;
}

export interface EventListOptions {
  status?: string;
  eventType?: string;
  limit?: number;
  offset?: number;
}

const IntegrationFromJson = (json: any): Integration => ({
  id: json['id'], customerId: json['customer_id'], name: json['name'],
  description: json['description'], connectorConfigId: json['connector_config_id'],
  connectorName: json['connector_name'], connectorDisplayName: json['connector_display_name'],
  endpointId: json['endpoint_id'], endpointUrl: json['endpoint_url'],
  enabled: json['enabled'], eventFilter: json['event_filter'],
  transformId: json['transform_id'], retryPolicy: json['retry_policy'],
  metadata: json['metadata'], lastTriggeredAt: json['last_triggered_at'],
  lastSuccessAt: json['last_success_at'], lastFailureAt: json['last_failure_at'],
  failureCount: json['failure_count'], totalDeliveries: json['total_deliveries'],
  totalFailures: json['total_failures'], healthStatus: json['health_status'],
  createdAt: json['created_at'], updatedAt: json['updated_at'],
});

const IntegrationEventFromJson = (json: any): IntegrationEvent => ({
  id: json['id'], integrationId: json['integration_id'], eventType: json['event_type'],
  sourceEventId: json['source_event_id'], payload: json['payload'], status: json['status'],
  deliveryId: json['delivery_id'], errorMessage: json['error_message'],
  attempts: json['attempts'], durationMs: json['duration_ms'],
  createdAt: json['created_at'], processedAt: json['processed_at'],
});

const StatsFromJson = (json: any): IntegrationStats => ({
  totalEvents: json['total_events'], delivered: json['delivered'],
  failed: json['failed'], pending: json['pending'], filtered: json['filtered'],
  avgDurationMs: json['avg_duration_ms'], successRate: json['success_rate'],
  last24hEvents: json['last_24h_events'], last24hFailures: json['last_24h_failures'],
});

export class IntegrationApi {
  public constructor(private readonly requestCtx: HookSniffRequestContext) {}

  /** List all integrations. */
  public list(): Promise<Integration[]> {
    const req = new HookSniffRequest(HttpMethod.GET, "/api/v1/integrations");
    return req.send(this.requestCtx, (arr: any[]) => arr.map(IntegrationFromJson));
  }

  /** Get integration details. */
  public get(id: string): Promise<Integration> {
    const req = new HookSniffRequest(HttpMethod.GET, "/api/v1/integrations/{id}");
    req.setPathParam("id", id);
    return req.send(this.requestCtx, IntegrationFromJson);
  }

  /** Create a new integration. */
  public create(body: IntegrationIn): Promise<Integration> {
    const req = new HookSniffRequest(HttpMethod.POST, "/api/v1/integrations");
    req.setBody({
      name: body.name, description: body.description,
      connector_config_id: body.connectorConfigId, endpoint_id: body.endpointId,
      event_filter: body.eventFilter, transform_id: body.transformId,
      retry_policy: body.retryPolicy, metadata: body.metadata, enabled: body.enabled,
    });
    return req.send(this.requestCtx, IntegrationFromJson);
  }

  /** Update an integration. */
  public update(id: string, body: IntegrationUpdate): Promise<Integration> {
    const req = new HookSniffRequest(HttpMethod.PUT, "/api/v1/integrations/{id}");
    req.setPathParam("id", id);
    const payload: any = {};
    if (body.name !== undefined) payload.name = body.name;
    if (body.description !== undefined) payload.description = body.description;
    if (body.endpointId !== undefined) payload.endpoint_id = body.endpointId;
    if (body.eventFilter !== undefined) payload.event_filter = body.eventFilter;
    if (body.transformId !== undefined) payload.transform_id = body.transformId;
    if (body.retryPolicy !== undefined) payload.retry_policy = body.retryPolicy;
    if (body.metadata !== undefined) payload.metadata = body.metadata;
    if (body.enabled !== undefined) payload.enabled = body.enabled;
    req.setBody(payload);
    return req.send(this.requestCtx, IntegrationFromJson);
  }

  /** Delete an integration. */
  public delete(id: string): Promise<void> {
    const req = new HookSniffRequest(HttpMethod.DELETE, "/api/v1/integrations/{id}");
    req.setPathParam("id", id);
    return req.sendNoResponseBody(this.requestCtx);
  }

  /** Send a test event through the integration. */
  public test(id: string): Promise<{ success: boolean; eventId: string; message: string }> {
    const req = new HookSniffRequest(HttpMethod.POST, "/api/v1/integrations/{id}/test");
    req.setPathParam("id", id);
    return req.send(this.requestCtx, (json: any) => ({
      success: json['success'], eventId: json['event_id'], message: json['message'],
    }));
  }

  /** List events for an integration. */
  public listEvents(id: string, options?: EventListOptions): Promise<IntegrationEvent[]> {
    const req = new HookSniffRequest(HttpMethod.GET, "/api/v1/integrations/{id}/events");
    req.setPathParam("id", id);
    if (options?.status) req.setQueryParam("status", options.status);
    if (options?.eventType) req.setQueryParam("event_type", options.eventType);
    if (options?.limit) req.setQueryParam("limit", options.limit);
    if (options?.offset) req.setQueryParam("offset", options.offset);
    return req.send(this.requestCtx, (arr: any[]) => arr.map(IntegrationEventFromJson));
  }

  /** Get statistics for an integration. */
  public getStats(id: string): Promise<IntegrationStats> {
    const req = new HookSniffRequest(HttpMethod.GET, "/api/v1/integrations/{id}/stats");
    req.setPathParam("id", id);
    return req.send(this.requestCtx, StatsFromJson);
  }
}
