package hooksniff

import (
	"context"
	"net/http"

	"github.com/servetarslan02/hooksniff-go/internal"
)

type Inbound struct{ client *internal.HookSniffHttpClient }

func newInbound(client *internal.HookSniffHttpClient) *Inbound {
	return &Inbound{client: client}
}

func (i *Inbound) ListConfigs(ctx context.Context) ([]InboundConfig, error) {
	var r []InboundConfig
	err := i.client.Get(ctx, "/api/v1/inbound/configs", nil, &r)
	return r, err
}

func (i *Inbound) CreateConfig(ctx context.Context, body InboundConfigIn) (*InboundConfig, error) {
	var r InboundConfig
	err := i.client.Post(ctx, "/api/v1/inbound/configs", body, &r)
	return &r, err
}

func (i *Inbound) UpdateConfig(ctx context.Context, id string, body InboundConfigIn) (*InboundConfig, error) {
	var r InboundConfig
	err := i.client.Do(ctx, http.MethodPut, "/api/v1/inbound/configs/"+id, body, &r)
	return &r, err
}

func (i *Inbound) DeleteConfig(ctx context.Context, id string) error {
	return i.client.Do(ctx, http.MethodDelete, "/api/v1/inbound/configs/"+id, nil, nil)
}

type InboundConfig struct {
	Id         string  `json:"id"`
	CustomerId string  `json:"customer_id"`
	Provider   string  `json:"provider"`
	Secret     string  `json:"secret"`
	EndpointId *string `json:"endpoint_id,omitempty"`
	Enabled    bool    `json:"enabled"`
	CreatedAt  string  `json:"created_at"`
}

type InboundConfigIn struct {
	Provider   string  `json:"provider"`
	Secret     string  `json:"secret"`
	EndpointId *string `json:"endpoint_id,omitempty"`
	Enabled    *bool   `json:"enabled,omitempty"`
}
