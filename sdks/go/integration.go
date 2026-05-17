package hooksniff

import (
	"context"
	"net/http"

	"github.com/servetarslan02/hooksniff-go/internal"
)

type IntegrationApi struct{ client *internal.HookSniffHttpClient }

func newIntegrationApi(client *internal.HookSniffHttpClient) *IntegrationApi {
	return &IntegrationApi{client: client}
}

func (i *IntegrationApi) List(ctx context.Context) ([]Integration, error) {
	var r []Integration
	err := i.client.Get(ctx, "/api/v1/integrations", nil, &r)
	return r, err
}

func (i *IntegrationApi) Get(ctx context.Context, id string) (*Integration, error) {
	var r Integration
	err := i.client.Get(ctx, "/api/v1/integrations/"+id, nil, &r)
	return &r, err
}

func (i *IntegrationApi) Create(ctx context.Context, body IntegrationIn) (*Integration, error) {
	var r Integration
	err := i.client.Post(ctx, "/api/v1/integrations", body, &r)
	return &r, err
}

func (i *IntegrationApi) Update(ctx context.Context, id string, body IntegrationUpdate) (*Integration, error) {
	var r Integration
	err := i.client.Do(ctx, http.MethodPut, "/api/v1/integrations/"+id, body, &r)
	return &r, err
}

func (i *IntegrationApi) Delete(ctx context.Context, id string) error {
	return i.client.Do(ctx, http.MethodDelete, "/api/v1/integrations/"+id, nil, nil)
}

func (i *IntegrationApi) Test(ctx context.Context, id string) (*IntegrationTestResponse, error) {
	var r IntegrationTestResponse
	err := i.client.Post(ctx, "/api/v1/integrations/"+id+"/test", nil, &r)
	return &r, err
}

func (i *IntegrationApi) ListEvents(ctx context.Context, id string, params map[string]string) ([]IntegrationEvent, error) {
	var r []IntegrationEvent
	err := i.client.Get(ctx, "/api/v1/integrations/"+id+"/events", params, &r)
	return r, err
}

func (i *IntegrationApi) GetStats(ctx context.Context, id string) (*IntegrationStats, error) {
	var r IntegrationStats
	err := i.client.Get(ctx, "/api/v1/integrations/"+id+"/stats", nil, &r)
	return &r, err
}

type Integration struct {
	Id                   string                 `json:"id"`
	CustomerId           string                 `json:"customer_id"`
	Name                 string                 `json:"name"`
	Description          *string                `json:"description,omitempty"`
	ConnectorConfigId    string                 `json:"connector_config_id"`
	ConnectorName        string                 `json:"connector_name"`
	ConnectorDisplayName string                 `json:"connector_display_name"`
	EndpointId           string                 `json:"endpoint_id"`
	EndpointUrl          string                 `json:"endpoint_url"`
	Enabled              bool                   `json:"enabled"`
	EventFilter          []string               `json:"event_filter,omitempty"`
	TransformId          *string                `json:"transform_id,omitempty"`
	RetryPolicy          map[string]interface{} `json:"retry_policy"`
	Metadata             map[string]interface{} `json:"metadata"`
	LastTriggeredAt      *string                `json:"last_triggered_at,omitempty"`
	LastSuccessAt        *string                `json:"last_success_at,omitempty"`
	LastFailureAt        *string                `json:"last_failure_at,omitempty"`
	FailureCount         int                    `json:"failure_count"`
	TotalDeliveries      int64                  `json:"total_deliveries"`
	TotalFailures        int64                  `json:"total_failures"`
	HealthStatus         string                 `json:"health_status"`
	CreatedAt            string                 `json:"created_at"`
	UpdatedAt            string                 `json:"updated_at"`
}

type IntegrationIn struct {
	Name              string                 `json:"name"`
	Description       *string                `json:"description,omitempty"`
	ConnectorConfigId string                 `json:"connector_config_id"`
	EndpointId        string                 `json:"endpoint_id"`
	EventFilter       []string               `json:"event_filter,omitempty"`
	TransformId       *string                `json:"transform_id,omitempty"`
	RetryPolicy       map[string]interface{} `json:"retry_policy,omitempty"`
	Metadata          map[string]interface{} `json:"metadata,omitempty"`
	Enabled           *bool                  `json:"enabled,omitempty"`
}

type IntegrationUpdate struct {
	Name         *string                `json:"name,omitempty"`
	Description  *string                `json:"description,omitempty"`
	EndpointId   *string                `json:"endpoint_id,omitempty"`
	EventFilter  []string               `json:"event_filter,omitempty"`
	TransformId  *string                `json:"transform_id,omitempty"`
	RetryPolicy  map[string]interface{} `json:"retry_policy,omitempty"`
	Metadata     map[string]interface{} `json:"metadata,omitempty"`
	Enabled      *bool                  `json:"enabled,omitempty"`
}

type IntegrationTestResponse struct {
	Success bool   `json:"success"`
	EventId string `json:"event_id"`
	Message string `json:"message"`
}

type IntegrationEvent struct {
	Id             string                 `json:"id"`
	IntegrationId  string                 `json:"integration_id"`
	EventType      string                 `json:"event_type"`
	SourceEventId  *string                `json:"source_event_id,omitempty"`
	Payload        map[string]interface{} `json:"payload"`
	Status         string                 `json:"status"`
	DeliveryId     *string                `json:"delivery_id,omitempty"`
	ErrorMessage   *string                `json:"error_message,omitempty"`
	Attempts       int                    `json:"attempts"`
	DurationMs     *int                   `json:"duration_ms,omitempty"`
	CreatedAt      string                 `json:"created_at"`
	ProcessedAt    *string                `json:"processed_at,omitempty"`
}

type IntegrationStats struct {
	TotalEvents    int64   `json:"total_events"`
	Delivered      int64   `json:"delivered"`
	Failed         int64   `json:"failed"`
	Pending        int64   `json:"pending"`
	Filtered       int64   `json:"filtered"`
	AvgDurationMs  *float64 `json:"avg_duration_ms,omitempty"`
	SuccessRate    float64 `json:"success_rate"`
	Last24hEvents  int64   `json:"last_24h_events"`
	Last24hFailures int64  `json:"last_24h_failures"`
}
