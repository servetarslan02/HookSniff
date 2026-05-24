// Connectors, integrations, streaming API clients

import { apiFetch } from './api';

export interface ConnectorOut {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  icon_url: string | null;
  config_schema: Record<string, unknown>;
  supported_events: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConnectorConfigOut {
  id: string;
  connector_id: string;
  connector_name: string;
  connector_display_name: string;
  name: string;
  config: Record<string, unknown>;
  is_active: boolean;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

export const connectorsApi = {
  list: (token: string) => apiFetch<ConnectorOut[]>('/connectors', { token }),
  get: (token: string, id: string) => apiFetch<ConnectorOut>(`/connectors/${id}`, { token }),
  listConfigs: (token: string) => apiFetch<ConnectorConfigOut[]>('/connectors/configs', { token }),
  getConfig: (token: string, id: string) => apiFetch<ConnectorConfigOut>(`/connectors/configs/${id}`, { token }),
  createConfig: (token: string, data: { connector_id: string; name: string; config?: Record<string, unknown>; credentials?: Record<string, unknown> }) =>
    apiFetch<ConnectorConfigOut>('/connectors/configs', { method: 'POST', body: data, token }),
  updateConfig: (token: string, id: string, data: { name?: string; config?: Record<string, unknown>; credentials?: Record<string, unknown>; is_active?: boolean }) =>
    apiFetch<ConnectorConfigOut>(`/connectors/configs/${id}`, { method: 'PUT', body: data, token }),
  deleteConfig: (token: string, id: string) => apiFetch<{ deleted: boolean }>(`/connectors/configs/${id}`, { method: 'DELETE', token }),
};

export interface IntegrationOut {
  id: string;
  customer_id: string;
  name: string;
  description: string | null;
  connector_config_id: string;
  connector_name: string;
  connector_display_name: string;
  endpoint_id: string;
  endpoint_url: string;
  enabled: boolean;
  event_filter: string[] | null;
  transform_id: string | null;
  retry_policy: Record<string, unknown>;
  metadata: Record<string, unknown>;
  last_triggered_at: string | null;
  last_success_at: string | null;
  last_failure_at: string | null;
  failure_count: number;
  total_deliveries: number;
  total_failures: number;
  health_status: string;
  created_at: string;
  updated_at: string;
}

export interface IntegrationEventOut {
  id: string;
  integration_id: string;
  event_type: string;
  source_event_id: string | null;
  payload: Record<string, unknown>;
  status: string;
  delivery_id: string | null;
  error_message: string | null;
  attempts: number;
  duration_ms: number | null;
  created_at: string;
  processed_at: string | null;
}

export interface IntegrationStatsOut {
  total_events: number;
  delivered: number;
  failed: number;
  pending: number;
  filtered: number;
  avg_duration_ms: number | null;
  success_rate: number;
  last_24h_events: number;
  last_24h_failures: number;
}

export const integrationsApi = {
  list: (token: string) => apiFetch<IntegrationOut[]>('/integrations', { token }),
  get: (token: string, id: string) => apiFetch<IntegrationOut>(`/integrations/${id}`, { token }),
  create: (token: string, data: { name: string; description?: string; connector_config_id: string; endpoint_id: string; event_filter?: string[]; transform_id?: string; retry_policy?: Record<string, unknown>; metadata?: Record<string, unknown>; enabled?: boolean }) =>
    apiFetch<IntegrationOut>('/integrations', { method: 'POST', body: data, token }),
  update: (token: string, id: string, data: { name?: string; description?: string; endpoint_id?: string; event_filter?: string[]; transform_id?: string; retry_policy?: Record<string, unknown>; metadata?: Record<string, unknown>; enabled?: boolean }) =>
    apiFetch<IntegrationOut>(`/integrations/${id}`, { method: 'PUT', body: data, token }),
  delete: (token: string, id: string) => apiFetch<{ deleted: boolean }>(`/integrations/${id}`, { method: 'DELETE', token }),
  test: (token: string, id: string) => apiFetch<{ success: boolean; event_id: string; message: string }>(`/integrations/${id}/test`, { method: 'POST', token }),
  listEvents: (token: string, id: string, params?: { status?: string; event_type?: string; limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.event_type) qs.set('event_type', params.event_type);
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.offset) qs.set('offset', String(params.offset));
    const q = qs.toString();
    return apiFetch<IntegrationEventOut[]>(`/integrations/${id}/events${q ? `?${q}` : ''}`, { token });
  },
  getStats: (token: string, id: string) => apiFetch<IntegrationStatsOut>(`/integrations/${id}/stats`, { token }),
};

export interface StreamChannelOut {
  id: string;
  customer_id: string;
  name: string;
  description: string | null;
  channel_type: string;
  event_filter: string[] | null;
  enabled: boolean;
  max_subscribers: number;
  current_subscribers: number;
  total_messages: number;
  created_at: string;
  updated_at: string;
}

export interface StreamChannelDetailOut extends StreamChannelOut {
  recent_messages: StreamMessageOut[];
}

export interface StreamMessageOut {
  id: string;
  channel_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  delivered_count: number;
  created_at: string;
}

export interface StreamSubscriptionOut {
  id: string;
  channel_id: string;
  customer_id: string;
  connection_type: string;
  client_id: string | null;
  event_filter: string[] | null;
  connected_at: string;
  last_heartbeat_at: string;
  messages_sent: number;
  metadata: Record<string, unknown>;
}

export const streamApi = {
  listChannels: (token: string) => apiFetch<StreamChannelOut[]>('/stream/channels', { token }),
  getChannel: (token: string, id: string) => apiFetch<StreamChannelDetailOut>(`/stream/channels/${id}`, { token }),
  createChannel: (token: string, data: { name: string; description?: string; channel_type?: string; event_filter?: string[]; max_subscribers?: number; enabled?: boolean }) =>
    apiFetch<StreamChannelOut>('/stream/channels', { method: 'POST', body: data, token }),
  updateChannel: (token: string, id: string, data: { name?: string; description?: string; event_filter?: string[]; max_subscribers?: number; enabled?: boolean }) =>
    apiFetch<StreamChannelOut>(`/stream/channels/${id}`, { method: 'PUT', body: data, token }),
  deleteChannel: (token: string, id: string) => apiFetch<{ deleted: boolean }>(`/stream/channels/${id}`, { method: 'DELETE', token }),
  listMessages: (token: string, id: string, params?: { event_type?: string; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.event_type) qs.set('event_type', params.event_type);
    if (params?.limit) qs.set('limit', String(params.limit));
    const q = qs.toString();
    return apiFetch<StreamMessageOut[]>(`/stream/channels/${id}/messages${q ? `?${q}` : ''}`, { token });
  },
  listSubscriptions: (token: string) => apiFetch<StreamSubscriptionOut[]>('/stream/subscriptions', { token }),
  disconnectSubscription: (token: string, id: string) => apiFetch<{ disconnected: boolean }>(`/stream/subscriptions/${id}`, { method: 'DELETE', token }),
  publish: (token: string, data: { channel_id: string; event_type: string; payload: Record<string, unknown> }) =>
    apiFetch<{ success: boolean; message_id: string; delivered_to: number }>('/stream/publish', { method: 'POST', body: data, token }),
};
