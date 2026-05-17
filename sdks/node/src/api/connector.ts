/**
 * Connectors — Manage external service integrations.
 */
import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";

export interface Connector {
  id: string;
  name: string;
  displayName: string;
  description?: string | null;
  iconUrl?: string | null;
  configSchema: Record<string, unknown>;
  supportedEvents?: string[] | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectorConfig {
  id: string;
  connectorId: string;
  connectorName: string;
  connectorDisplayName: string;
  name: string;
  config: Record<string, unknown>;
  isActive: boolean;
  lastSyncAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectorConfigIn {
  connectorId: string;
  name: string;
  config?: Record<string, unknown>;
  credentials?: Record<string, unknown>;
  isActive?: boolean;
}

const ConnectorFromJson = (json: any): Connector => ({
  id: json['id'], name: json['name'], displayName: json['display_name'],
  description: json['description'], iconUrl: json['icon_url'],
  configSchema: json['config_schema'], supportedEvents: json['supported_events'],
  isActive: json['is_active'], createdAt: json['created_at'], updatedAt: json['updated_at'],
});

const ConnectorConfigFromJson = (json: any): ConnectorConfig => ({
  id: json['id'], connectorId: json['connector_id'],
  connectorName: json['connector_name'], connectorDisplayName: json['connector_display_name'],
  name: json['name'], config: json['config'], isActive: json['is_active'],
  lastSyncAt: json['last_sync_at'], createdAt: json['created_at'], updatedAt: json['updated_at'],
});

export class ConnectorApi {
  public constructor(private readonly requestCtx: HookSniffRequestContext) {}

  /** List available connectors. */
  public list(): Promise<Connector[]> {
    const req = new HookSniffRequest(HttpMethod.GET, "/api/v1/connectors");
    return req.send(this.requestCtx, (arr: any[]) => arr.map(ConnectorFromJson));
  }

  /** Get connector details. */
  public get(id: string): Promise<Connector> {
    const req = new HookSniffRequest(HttpMethod.GET, "/api/v1/connectors/{id}");
    req.setPathParam("id", id);
    return req.send(this.requestCtx, ConnectorFromJson);
  }

  /** List customer's connector configs. */
  public listConfigs(): Promise<ConnectorConfig[]> {
    const req = new HookSniffRequest(HttpMethod.GET, "/api/v1/connectors/configs");
    return req.send(this.requestCtx, (arr: any[]) => arr.map(ConnectorConfigFromJson));
  }

  /** Create connector config. */
  public createConfig(body: ConnectorConfigIn): Promise<ConnectorConfig> {
    const req = new HookSniffRequest(HttpMethod.POST, "/api/v1/connectors/configs");
    req.setBody({ connector_id: body.connectorId, name: body.name, config: body.config, credentials: body.credentials, is_active: body.isActive });
    return req.send(this.requestCtx, ConnectorConfigFromJson);
  }

  /** Update connector config. */
  public updateConfig(id: string, body: Partial<ConnectorConfigIn>): Promise<ConnectorConfig> {
    const req = new HookSniffRequest(HttpMethod.PUT, "/api/v1/connectors/configs/{id}");
    req.setPathParam("id", id);
    req.setBody({ name: body.name, config: body.config, credentials: body.credentials, is_active: body.isActive });
    return req.send(this.requestCtx, ConnectorConfigFromJson);
  }

  /** Delete connector config. */
  public deleteConfig(id: string): Promise<void> {
    const req = new HookSniffRequest(HttpMethod.DELETE, "/api/v1/connectors/configs/{id}");
    req.setPathParam("id", id);
    return req.sendNoResponseBody(this.requestCtx);
  }
}
