package hooksniff

import (
	"context"
	"net/http"

	"github.com/servetarslan02/hooksniff-go/internal"
)

type ConnectorApi struct{ client *internal.HookSniffHttpClient }

func newConnectorApi(client *internal.HookSniffHttpClient) *ConnectorApi {
	return &ConnectorApi{client: client}
}

func (c *ConnectorApi) List(ctx context.Context) ([]Connector, error) {
	var r []Connector
	err := c.client.Get(ctx, "/api/v1/connectors", nil, &r)
	return r, err
}

func (c *ConnectorApi) Get(ctx context.Context, id string) (*Connector, error) {
	var r Connector
	err := c.client.Get(ctx, "/api/v1/connectors/"+id, nil, &r)
	return &r, err
}

func (c *ConnectorApi) ListConfigs(ctx context.Context) ([]ConnectorConfig, error) {
	var r []ConnectorConfig
	err := c.client.Get(ctx, "/api/v1/connectors/configs", nil, &r)
	return r, err
}

func (c *ConnectorApi) CreateConfig(ctx context.Context, body ConnectorConfigIn) (*ConnectorConfig, error) {
	var r ConnectorConfig
	err := c.client.Post(ctx, "/api/v1/connectors/configs", body, &r)
	return &r, err
}

func (c *ConnectorApi) UpdateConfig(ctx context.Context, id string, body ConnectorConfigIn) (*ConnectorConfig, error) {
	var r ConnectorConfig
	err := c.client.Do(ctx, http.MethodPut, "/api/v1/connectors/configs/"+id, body, &r)
	return &r, err
}

func (c *ConnectorApi) DeleteConfig(ctx context.Context, id string) error {
	return c.client.Do(ctx, http.MethodDelete, "/api/v1/connectors/configs/"+id, nil, nil)
}

type Connector struct {
	Id              string   `json:"id"`
	Name            string   `json:"name"`
	DisplayName     string   `json:"display_name"`
	Description     *string  `json:"description,omitempty"`
	IconUrl         *string  `json:"icon_url,omitempty"`
	ConfigSchema    map[string]interface{} `json:"config_schema"`
	SupportedEvents []string `json:"supported_events,omitempty"`
	IsActive        bool     `json:"is_active"`
	CreatedAt       string   `json:"created_at"`
	UpdatedAt       string   `json:"updated_at"`
}

type ConnectorConfig struct {
	Id                   string                 `json:"id"`
	ConnectorId          string                 `json:"connector_id"`
	ConnectorName        string                 `json:"connector_name"`
	ConnectorDisplayName string                 `json:"connector_display_name"`
	Name                 string                 `json:"name"`
	Config               map[string]interface{} `json:"config"`
	IsActive             bool                   `json:"is_active"`
	LastSyncAt           *string                `json:"last_sync_at,omitempty"`
	CreatedAt            string                 `json:"created_at"`
	UpdatedAt            string                 `json:"updated_at"`
}

type ConnectorConfigIn struct {
	ConnectorId string                 `json:"connector_id"`
	Name        string                 `json:"name"`
	Config      map[string]interface{} `json:"config,omitempty"`
	Credentials map[string]interface{} `json:"credentials,omitempty"`
	IsActive    *bool                  `json:"is_active,omitempty"`
}
