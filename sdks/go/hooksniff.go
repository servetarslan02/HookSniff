// Package hooksniff provides a Go client for the HookSniff webhook delivery API.
//
// Usage:
//
//	client := hooksniff.New("hr_live_YOUR_KEY")
//
//	// Create endpoint
//	ep, _ := client.Endpoints.Create(ctx, &hooksniff.CreateEndpointRequest{
//	    URL: "https://myapp.com/webhook",
//	})
//
//	// Send webhook
//	wh, _ := client.Webhooks.Send(ctx, &hooksniff.SendWebhookRequest{
//	    EndpointID: ep.ID,
//	    Event:      "order.created",
//	    Data:       map[string]interface{}{"order_id": "12345"},
//	})
package hooksniff

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
	"net/url"
	"strconv"
	"strings"
	"time"
)

const (
	defaultBaseURL = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
	userAgent      = "hooksniff-go/0.2.0"
)

// Error types for structured error handling.
type APIError struct {
	StatusCode int
	Code       string
	Message    string
}

func (e *APIError) Error() string {
	return fmt.Sprintf("hooksniff: %s (HTTP %d)", e.Message, e.StatusCode)
}

func IsAuthenticationError(err error) bool {
	if apiErr, ok := err.(*APIError); ok {
		return apiErr.StatusCode == 401
	}
	return false
}

func IsValidationError(err error) bool {
	if apiErr, ok := err.(*APIError); ok {
		return apiErr.StatusCode == 400
	}
	return false
}

func IsNotFoundError(err error) bool {
	if apiErr, ok := err.(*APIError); ok {
		return apiErr.StatusCode == 404
	}
	return false
}

func IsRateLimitError(err error) bool {
	if apiErr, ok := err.(*APIError); ok {
		return apiErr.StatusCode == 429
	}
	return false
}

// Client is the HookSniff API client.
type Client struct {
	BaseURL    string
	APIKey     string
	HTTPClient *http.Client

	Endpoints *EndpointsService
	Webhooks  *WebhooksService
}

// New creates a new HookSniff client with the given API key.
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
func (s *EndpointsService) List(ctx context.Context, page, perPage int) (*EndpointListResponse, error) {
	if page <= 0 {
		page = 1
	}
	if perPage <= 0 {
		perPage = 20
	}
	var resp EndpointListResponse
	err := s.client.do(ctx, "GET", fmt.Sprintf("/endpoints?page=%d&per_page=%d", page, perPage), nil, &resp)
	return &resp, err
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

// EndpointListResponse is the response from listing endpoints.
type EndpointListResponse struct {
	Endpoints []Endpoint `json:"endpoints"`
	Total     int64      `json:"total"`
	Page      int64      `json:"page"`
	PerPage   int64      `json:"per_page"`
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
	params := url.Values{}
	if format != "" {
		params.Set("format", format)
	}
	if status != "" {
		params.Set("status", status)
	}
	if dateFrom != "" {
		params.Set("date_from", dateFrom)
	}
	if dateTo != "" {
		params.Set("date_to", dateTo)
	}
	query := ""
	if len(params) > 0 {
		query = "?" + params.Encode()
	}
	var deliveries []Delivery
	err := s.client.do(ctx, "GET", "/webhooks/export"+query, nil, &deliveries)
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
	if now-ts > int64(toleranceSecs) {
		return VerificationResult{Valid: false, Error: "Message timestamp too old"}
	}
	if ts > now+int64(toleranceSecs) {
		return VerificationResult{Valid: false, Error: "Message timestamp too new"}
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
		// Decode both signatures to bytes for comparison (matches reference implementation)
		sigBytes, err1 := base64.StdEncoding.DecodeString(sig[3:])
		expBytes, err2 := base64.StdEncoding.DecodeString(expectedSig)
		if err1 != nil || err2 != nil {
			continue
		}
		if hmac.Equal(sigBytes, expBytes) {
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

// VerifyWebhookFromHeaders verifies a webhook from HTTP headers.
// Supports both Standard Webhooks headers (webhook-id, webhook-signature, webhook-timestamp)
// and Svix headers (svix-id, svix-signature, svix-timestamp) as fallback.
func VerifyWebhookFromHeaders(body string, headers http.Header, secret string, toleranceSecs int) VerificationResult {
	msgID := headers.Get("webhook-id")
	msgSignature := headers.Get("webhook-signature")
	msgTimestamp := headers.Get("webhook-timestamp")

	if msgID == "" || msgSignature == "" || msgTimestamp == "" {
		msgID = headers.Get("svix-id")
		msgSignature = headers.Get("svix-signature")
		msgTimestamp = headers.Get("svix-timestamp")
	}

	return VerifyWebhook(body, msgID, msgTimestamp, msgSignature, secret, toleranceSecs)
}

func decodeSecret(secret string) []byte {
	stripped := secret
	if strings.HasPrefix(secret, "whsec_") {
		stripped = secret[6:]
	}
	// Add padding in case secret is unpadded base64
	if m := len(stripped) % 4; m != 0 {
		stripped += strings.Repeat("=", 4-m)
	}
	decoded, err := base64.StdEncoding.DecodeString(stripped)
	if err != nil {
		return []byte(secret)
	}
	return decoded
}

// ── WebhookEvent & HTTP Request Verification ──

// WebhookEvent represents a verified incoming webhook event.
type WebhookEvent struct {
	// ID is the webhook-id header value.
	ID string
	// Timestamp is the unix timestamp from the webhook-timestamp header.
	Timestamp string
	// Event is the event type extracted from the payload (e.g. "order.created").
	// Empty if the payload has no "event" field.
	Event string
	// Data is the parsed JSON payload, or the raw body string if not JSON.
	Data interface{}
	// RawBody is the original request body.
	RawBody string
}

// VerifyHTTPRequest reads and verifies a webhook HTTP request.
// It supports both Standard Webhooks headers (webhook-id, webhook-timestamp,
// webhook-signature) and legacy headers (X-Hookrelay-Signature).
//
// For Standard Webhooks, it returns a fully populated WebhookEvent.
// For legacy headers, only Data and RawBody are populated.
//
// Example:
//
//	func handleWebhook(w http.ResponseWriter, r *http.Request) {
//	    event, err := hooksniff.VerifyHTTPRequest(r, "whsec_...")
//	    if err != nil {
//	        http.Error(w, err.Error(), http.StatusUnauthorized)
//	        return
//	    }
//	    log.Printf("Event: %s, Data: %v", event.Event, event.Data)
//	}
func VerifyHTTPRequest(r *http.Request, secret string) (*WebhookEvent, error) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		return nil, fmt.Errorf("hooksniff: read body: %w", err)
	}
	defer r.Body.Close()
	bodyStr := string(body)

	// Try Standard Webhooks headers first
	msgID := r.Header.Get("webhook-id")
	msgTimestamp := r.Header.Get("webhook-timestamp")
	msgSignature := r.Header.Get("webhook-signature")

	// Fall back to Svix headers
	if msgID == "" {
		msgID = r.Header.Get("svix-id")
	}
	if msgTimestamp == "" {
		msgTimestamp = r.Header.Get("svix-timestamp")
	}
	if msgSignature == "" {
		msgSignature = r.Header.Get("svix-signature")
	}

	// Standard Webhooks path
	if msgID != "" && msgTimestamp != "" && msgSignature != "" {
		result := VerifyWebhook(bodyStr, msgID, msgTimestamp, msgSignature, secret, 0)
		if !result.Valid {
			return nil, fmt.Errorf("hooksniff: %s", result.Error)
		}

		event := &WebhookEvent{
			ID:        msgID,
			Timestamp: msgTimestamp,
			RawBody:   bodyStr,
			Data:      result.Payload,
		}

		// Extract event type from payload
		if m, ok := result.Payload.(map[string]interface{}); ok {
			if e, ok := m["event"].(string); ok {
				event.Event = e
			}
		}

		return event, nil
	}

	// Legacy path: X-Hookrelay-Signature
	legacySig := r.Header.Get("X-Hookrelay-Signature")
	if legacySig == "" {
		legacySig = r.Header.Get("x-hooksniff-signature")
	}

	if legacySig != "" {
		if !VerifySignature(bodyStr, legacySig, secret) {
			return nil, fmt.Errorf("hooksniff: invalid legacy signature")
		}

		event := &WebhookEvent{RawBody: bodyStr}

		var parsed interface{}
		if err := json.Unmarshal(body, &parsed); err == nil {
			event.Data = parsed
			if m, ok := parsed.(map[string]interface{}); ok {
				if e, ok := m["event"].(string); ok {
					event.Event = e
				}
			}
		} else {
			event.Data = bodyStr
		}

		return event, nil
	}

	return nil, fmt.Errorf("hooksniff: no webhook signature headers found")
}

// WebhookHandler is an http.Handler that verifies incoming webhooks
// and routes them to registered event handlers.
//
// Example:
//
//	handler := hooksniff.NewWebhookHandler("whsec_...", map[string]func(hooksniff.WebhookEvent){
//	    "order.created":  handleOrderCreated,
//	    "payment.failed": handlePaymentFailed,
//	})
//	http.Handle("/webhook", handler)
type WebhookHandler struct {
	secret   string
	handlers map[string]func(WebhookEvent)
	onEvent  func(WebhookEvent)
}

// NewWebhookHandler creates a new webhook handler with the given secret and event handlers.
func NewWebhookHandler(secret string, handlers map[string]func(WebhookEvent)) *WebhookHandler {
	return &WebhookHandler{
		secret:   secret,
		handlers: handlers,
	}
}

// WithCatchAll sets a fallback handler for events without a specific handler.
func (h *WebhookHandler) WithCatchAll(handler func(WebhookEvent)) *WebhookHandler {
	h.onEvent = handler
	return h
}

// ServeHTTP implements http.Handler.
func (h *WebhookHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error":{"code":"METHOD_NOT_ALLOWED","message":"Only POST is allowed"}}`, http.StatusMethodNotAllowed)
		return
	}

	event, err := VerifyHTTPRequest(r, h.secret)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		fmt.Fprintf(w, `{"error":{"code":"INVALID_SIGNATURE","message":"%s"}}`, err.Error())
		return
	}

	// Route to specific handler
	if handler, ok := h.handlers[event.Event]; ok {
		handler(*event)
	} else if h.onEvent != nil {
		h.onEvent(*event)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"received":true}`))
}

func (c *Client) do(ctx context.Context, method, path string, body interface{}, result interface{}) error {
	fullURL := c.BaseURL + path

	var bodyReader io.Reader
	if body != nil {
		jsonBody, err := json.Marshal(body)
		if err != nil {
			return fmt.Errorf("marshal request: %w", err)
		}
		bodyReader = bytes.NewReader(jsonBody)
	}

	req, err := http.NewRequestWithContext(ctx, method, fullURL, bodyReader)
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
				Code    string `json:"code"`
				Message string `json:"message"`
			} `json:"error"`
		}
		json.NewDecoder(resp.Body).Decode(&errResp)
		return &APIError{
			StatusCode: resp.StatusCode,
			Code:       errResp.Error.Code,
			Message:    errResp.Error.Message,
		}
	}

	if result != nil {
		if err := json.NewDecoder(resp.Body).Decode(result); err != nil {
			return fmt.Errorf("decode response: %w", err)
		}
	}

	return nil
}
