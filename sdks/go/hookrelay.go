// Package hookrelay provides a Go client for the HookRelay webhook delivery API.
//
// Usage:
//
//	client := hookrelay.New("hr_live_YOUR_KEY")
//
//	// Create endpoint
//	ep, _ := client.Endpoints.Create(ctx, &hookrelay.CreateEndpointRequest{
//	    URL: "https://myapp.com/webhook",
//	})
//
//	// Send webhook
//	wh, _ := client.Webhooks.Send(ctx, &hookrelay.SendWebhookRequest{
//	    EndpointID: ep.ID,
//	    Event:      "order.created",
//	    Data:       map[string]interface{}{"order_id": "12345"},
//	})
package hookrelay

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

const (
	defaultBaseURL = "http://localhost:3000/v1"
	userAgent      = "hookrelay-go/0.1.0"
)

// Client is the HookRelay API client.
type Client struct {
	BaseURL    string
	APIKey     string
	HTTPClient *http.Client

	Endpoints *EndpointsService
	Webhooks  *WebhooksService
}

// New creates a new HookRelay client with the given API key.
func New(apiKey string) *Client {
	c := &Client{
		BaseURL:    defaultBaseURL,
		APIKey:     apiKey,
		HTTPClient: &http.Client{Timeout: 30 * time.Second},
	}
	c.Endpoints = &EndpointsService{client: c}
	c.Webhooks = &WebhooksService{client: c}
	return c
}

// NewWithBaseURL creates a client with a custom API base URL.
func NewWithBaseURL(apiKey, baseURL string) *Client {
	c := New(apiKey)
	c.BaseURL = baseURL
	return c
}

// ── Endpoints ──

// EndpointsService manages webhook endpoints.
type EndpointsService struct {
	client *Client
}

// Endpoint represents a webhook endpoint.
type Endpoint struct {
	ID               string                 `json:"id"`
	URL              string                 `json:"url"`
	Description      *string                `json:"description,omitempty"`
	IsActive         bool                   `json:"is_active"`
	SigningSecret    string                 `json:"signing_secret,omitempty"`
	RetryPolicy      map[string]interface{} `json:"retry_policy,omitempty"`
	RoutingStrategy  string                 `json:"routing_strategy"`
	FallbackURL      *string                `json:"fallback_url,omitempty"`
	EventFilter      []string               `json:"event_filter,omitempty"`
	CustomHeaders    map[string]interface{} `json:"custom_headers,omitempty"`
	CreatedAt        time.Time              `json:"created_at"`
}

// CreateEndpointRequest is the request to create an endpoint.
type CreateEndpointRequest struct {
	URL              string                 `json:"url"`
	Description      string                 `json:"description,omitempty"`
	RetryPolicy      map[string]interface{} `json:"retry_policy,omitempty"`
	RoutingStrategy  string                 `json:"routing_strategy,omitempty"`
	FallbackURL      string                 `json:"fallback_url,omitempty"`
	EventFilter      []string               `json:"event_filter,omitempty"`
	CustomHeaders    map[string]interface{} `json:"custom_headers,omitempty"`
}

// List returns all endpoints.
func (s *EndpointsService) List(ctx context.Context) ([]Endpoint, error) {
	var endpoints []Endpoint
	err := s.client.do(ctx, "GET", "/endpoints", nil, &endpoints)
	return endpoints, err
}

// Create creates a new endpoint.
func (s *EndpointsService) Create(ctx context.Context, req *CreateEndpointRequest) (*Endpoint, error) {
	var ep Endpoint
	err := s.client.do(ctx, "POST", "/endpoints", req, &ep)
	return &ep, err
}

// Get returns an endpoint by ID.
func (s *EndpointsService) Get(ctx context.Context, id string) (*Endpoint, error) {
	var ep Endpoint
	err := s.client.do(ctx, "GET", fmt.Sprintf("/endpoints/%s", id), nil, &ep)
	return &ep, err
}

// Delete deletes an endpoint.
func (s *EndpointsService) Delete(ctx context.Context, id string) error {
	return s.client.do(ctx, "DELETE", fmt.Sprintf("/endpoints/%s", id), nil, nil)
}

// RotateSecret rotates the signing secret for an endpoint.
func (s *EndpointsService) RotateSecret(ctx context.Context, id string) (map[string]interface{}, error) {
	var result map[string]interface{}
	err := s.client.do(ctx, "POST", fmt.Sprintf("/endpoints/%s/rotate-secret", id), nil, &result)
	return result, err
}

// ── Webhooks ──

// WebhooksService manages webhook deliveries.
type WebhooksService struct {
	client *Client
}

// Delivery represents a webhook delivery.
type Delivery struct {
	ID            string     `json:"id"`
	EndpointID    string     `json:"endpoint_id"`
	Event         *string    `json:"event,omitempty"`
	Status        string     `json:"status"`
	AttemptCount  int        `json:"attempt_count"`
	ResponseStatus *int      `json:"response_status,omitempty"`
	ReplayCount   *int       `json:"replay_count,omitempty"`
	CreatedAt     time.Time  `json:"created_at"`
}

// SendWebhookRequest is the request to send a webhook.
type SendWebhookRequest struct {
	EndpointID string                 `json:"endpoint_id"`
	Event      string                 `json:"event,omitempty"`
	Data       map[string]interface{} `json:"data"`
}

// DeliveryListResponse is the response from listing deliveries.
type DeliveryListResponse struct {
	Deliveries []Delivery `json:"deliveries"`
	Total      int64      `json:"total"`
	Page       int64      `json:"page"`
	PerPage    int64      `json:"per_page"`
}

// Send sends a webhook.
func (s *WebhooksService) Send(ctx context.Context, req *SendWebhookRequest) (*Delivery, error) {
	var d Delivery
	err := s.client.do(ctx, "POST", "/webhooks", req, &d)
	return &d, err
}

// SendBatch sends multiple webhooks in a single request.
func (s *WebhooksService) SendBatch(ctx context.Context, reqs []*SendWebhookRequest) ([]Delivery, []interface{}, error) {
	body := map[string]interface{}{"webhooks": reqs}
	var result struct {
		Deliveries []Delivery   `json:"deliveries"`
		Errors     []interface{} `json:"errors"`
	}
	err := s.client.do(ctx, "POST", "/webhooks/batch", body, &result)
	return result.Deliveries, result.Errors, err
}

// List returns recent deliveries.
func (s *WebhooksService) List(ctx context.Context, page int) (*DeliveryListResponse, error) {
	var resp DeliveryListResponse
	err := s.client.do(ctx, "GET", fmt.Sprintf("/webhooks?page=%d", page), nil, &resp)
	return &resp, err
}

// Get returns a delivery by ID.
func (s *WebhooksService) Get(ctx context.Context, id string) (*Delivery, error) {
	var d Delivery
	err := s.client.do(ctx, "GET", fmt.Sprintf("/webhooks/%s", id), nil, &d)
	return &d, err
}

// Replay replays a delivery.
func (s *WebhooksService) Replay(ctx context.Context, id string) (*Delivery, error) {
	var d Delivery
	err := s.client.do(ctx, "POST", fmt.Sprintf("/webhooks/%s/replay", id), nil, &d)
	return &d, err
}

// ── Internal HTTP Client ──

func (c *Client) do(ctx context.Context, method, path string, body interface{}, result interface{}) error {
	url := c.BaseURL + path

	var bodyReader io.Reader
	if body != nil {
		jsonBody, err := json.Marshal(body)
		if err != nil {
			return fmt.Errorf("marshal request: %w", err)
		}
		bodyReader = bytes.NewReader(jsonBody)
	}

	req, err := http.NewRequestWithContext(ctx, method, url, bodyReader)
	if err != nil {
		return fmt.Errorf("create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+c.APIKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", userAgent)

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return fmt.Errorf("execute request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		var errResp struct {
			Error struct {
				Message string `json:"message"`
			} `json:"error"`
		}
		json.NewDecoder(resp.Body).Decode(&errResp)
		return fmt.Errorf("API error %d: %s", resp.StatusCode, errResp.Error.Message)
	}

	if result != nil {
		if err := json.NewDecoder(resp.Body).Decode(result); err != nil {
			return fmt.Errorf("decode response: %w", err)
		}
	}

	return nil
}
