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
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"
)

const (
	defaultBaseURL = "https://api.hookrelay.dev/v1"
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

// DeliveryAttempt represents a single delivery attempt.
type DeliveryAttempt struct {
	ID            string `json:"id"`
	AttemptNumber int    `json:"attempt_number"`
	StatusCode    *int   `json:"status_code,omitempty"`
	ResponseBody  *string `json:"response_body,omitempty"`
	DurationMs    *int64  `json:"duration_ms,omitempty"`
	ErrorMessage  *string `json:"error_message,omitempty"`
	CreatedAt     string  `json:"created_at"`
}

// Attempts returns delivery attempts for a webhook.
func (s *WebhooksService) Attempts(ctx context.Context, deliveryID string) ([]DeliveryAttempt, error) {
	var attempts []DeliveryAttempt
	err := s.client.do(ctx, "GET", fmt.Sprintf("/webhooks/%s/attempts", deliveryID), nil, &attempts)
	return attempts, err
}

// ExportDeliveries exports deliveries with optional filters.
func (s *WebhooksService) ExportDeliveries(ctx context.Context, format, status, dateFrom, dateTo string) ([]Delivery, error) {
	params := "/webhooks/export?"
	if format != "" {
		params += "format=" + format + "&"
	}
	if status != "" {
		params += "status=" + status + "&"
	}
	if dateFrom != "" {
		params += "date_from=" + dateFrom + "&"
	}
	if dateTo != "" {
		params += "date_to=" + dateTo + "&"
	}
	var deliveries []Delivery
	err := s.client.do(ctx, "GET", params, nil, &deliveries)
	return deliveries, err
}

// ── Webhook Verification ──

// VerificationResult is the result of webhook verification.
type VerificationResult struct {
	Valid   bool
	Payload interface{}
	Error   string
}

const defaultToleranceSecs = 300

// VerifySignature verifies a webhook signature using HMAC-SHA256 (legacy format: sha256=<hex>).
func VerifySignature(payload, signature, secret string) bool {
	if payload == "" || signature == "" || secret == "" {
		return false
	}

	expectedHex := signature
	if strings.HasPrefix(signature, "sha256=") {
		expectedHex = signature[7:]
	}

	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(payload))
	computed := hex.EncodeToString(mac.Sum(nil))

	return hmac.Equal([]byte(computed), []byte(expectedHex))
}

// VerifyWebhook verifies a webhook using Standard Webheaders headers (Svix-compatible).
func VerifyWebhook(body, msgID, timestamp, signatureHeader, secret string, toleranceSecs int) VerificationResult {
	if toleranceSecs <= 0 {
		toleranceSecs = defaultToleranceSecs
	}

	if msgID == "" {
		return VerificationResult{Valid: false, Error: "Missing webhook-id header"}
	}
	if timestamp == "" {
		return VerificationResult{Valid: false, Error: "Missing webhook-timestamp header"}
	}
	if signatureHeader == "" {
		return VerificationResult{Valid: false, Error: "Missing webhook-signature header"}
	}
	if body == "" {
		return VerificationResult{Valid: false, Error: "Missing request body"}
	}

	ts, err := strconv.ParseInt(timestamp, 10, 64)
	if err != nil {
		return VerificationResult{Valid: false, Error: "Invalid webhook timestamp"}
	}

	now := time.Now().Unix()
	age := now - ts
	if age < 0 {
		age = -age
	}
	if age > int64(toleranceSecs) {
		return VerificationResult{Valid: false, Error: fmt.Sprintf("Webhook timestamp expired: %ds old (tolerance: %ds)", age, toleranceSecs)}
	}

	// Compute expected signature
	signedContent := msgID + "." + timestamp + "." + body
	secretBytes := decodeSecret(secret)

	mac := hmac.New(sha256.New, secretBytes)
	mac.Write([]byte(signedContent))
	expectedSig := base64.StdEncoding.EncodeToString(mac.Sum(nil))
	expectedFull := "v1," + expectedSig

	// Check each signature in the header (space-separated)
	signatures := strings.Split(signatureHeader, " ")
	verified := false
	for _, sig := range signatures {
		sig = strings.TrimSpace(sig)
		if !strings.HasPrefix(sig, "v1,") {
			continue
		}
		if hmac.Equal([]byte(sig), []byte(expectedFull)) {
			verified = true
			break
		}
	}

	if !verified {
		return VerificationResult{Valid: false, Error: "Invalid webhook signature"}
	}

	// Parse payload
	var parsed interface{}
	if err := json.Unmarshal([]byte(body), &parsed); err != nil {
		return VerificationResult{Valid: true, Payload: body}
	}
	return VerificationResult{Valid: true, Payload: parsed}
}

func decodeSecret(secret string) []byte {
	stripped := secret
	if strings.HasPrefix(secret, "whsec_") {
		stripped = secret[6:]
	}
	decoded, err := base64.StdEncoding.DecodeString(stripped)
	if err != nil {
		return []byte(secret)
	}
	return decoded
}

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
