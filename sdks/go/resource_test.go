package hooksniff

import (
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
)

// =============================================================================
// Resource Tests — Client initialization
// =============================================================================

func TestNewClientDefaults(t *testing.T) {
	c := New("test-key-123", nil)

	if c.Token != "test-key-123" {
		t.Errorf("expected token=test-key-123, got %s", c.Token)
	}
	if c.BaseURL != defaultBaseURL {
		t.Errorf("expected baseURL=%s, got %s", defaultBaseURL, c.BaseURL)
	}
	if c.NumRetries != defaultRetries {
		t.Errorf("expected retries=%d, got %d", defaultRetries, c.NumRetries)
	}
	if c.HTTPClient == nil {
		t.Fatal("expected non-nil HTTPClient")
	}
}

func TestNewClientWithCustomOptions(t *testing.T) {
	customClient := &http.Client{}
	opts := &Options{
		BaseURL:    "https://custom.api.com/",
		Timeout:    60,
		NumRetries: 5,
		HTTPClient: customClient,
	}
	c := New("key", opts)

	if c.BaseURL != "https://custom.api.com" {
		t.Errorf("expected trimmed baseURL, got %s", c.BaseURL)
	}
	if c.NumRetries != 5 {
		t.Errorf("expected 5 retries, got %d", c.NumRetries)
	}
	if c.HTTPClient != customClient {
		t.Error("expected custom HTTPClient to be used")
	}
}

func TestNewClientPanicsOnEmptyKey(t *testing.T) {
	defer func() {
		r := recover()
		if r == nil {
			t.Error("expected panic on empty apiKey")
		}
	}()
	New("", nil)
}

// =============================================================================
// Resource accessor initialization
// =============================================================================

func TestResourceAccessorsInitialized(t *testing.T) {
	c := New("test-key", nil)

	resources := map[string]interface{}{
		"Endpoints": c.Endpoints,
		"Webhooks":  c.Webhooks,
		"Auth":      c.Auth,
		"Analytics": c.Analytics,
		"APIKeys":   c.APIKeys,
		"Alerts":    c.Alerts,
		"Teams":     c.Teams,
		"Search":    c.Search,
		"Billing":   c.Billing,
		"Health":    c.Health,
	}
	for name, r := range resources {
		if r == nil {
			t.Errorf("resource %s is nil", name)
		}
	}
}

func TestResourceAccessorClientBackref(t *testing.T) {
	c := New("test-key", nil)

	if c.Endpoints.client != c {
		t.Error("Endpoints.client != client")
	}
	if c.Webhooks.client != c {
		t.Error("Webhooks.client != client")
	}
	if c.Auth.client != c {
		t.Error("Auth.client != client")
	}
	if c.Analytics.client != c {
		t.Error("Analytics.client != client")
	}
	if c.APIKeys.client != c {
		t.Error("APIKeys.client != client")
	}
	if c.Alerts.client != c {
		t.Error("Alerts.client != client")
	}
	if c.Teams.client != c {
		t.Error("Teams.client != client")
	}
	if c.Search.client != c {
		t.Error("Search.client != client")
	}
	if c.Billing.client != c {
		t.Error("Billing.client != client")
	}
	if c.Health.client != c {
		t.Error("Health.client != client")
	}
}

// =============================================================================
// EndpointsResource.List — httptest
// =============================================================================

func TestEndpointsResourceList(t *testing.T) {
	var receivedPath string
	var receivedMethod string
	var receivedAuth string

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		receivedPath = r.URL.Path
		receivedMethod = r.Method
		receivedAuth = r.Header.Get("Authorization")

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]map[string]interface{}{
			{"id": "ep_1", "url": "https://a.com", "active": true, "rate_limit": 100},
			{"id": "ep_2", "url": "https://b.com", "active": false, "rate_limit": 50},
		})
	}))
	defer server.Close()

	c := New("my-token", &Options{BaseURL: server.URL})
	endpoints, err := c.Endpoints.List()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if receivedMethod != "GET" {
		t.Errorf("expected GET, got %s", receivedMethod)
	}
	if receivedPath != "/v1/endpoints" {
		t.Errorf("expected /v1/endpoints, got %s", receivedPath)
	}
	if receivedAuth != "Bearer my-token" {
		t.Errorf("expected Bearer my-token, got %s", receivedAuth)
	}
	if len(endpoints) != 2 {
		t.Fatalf("expected 2 endpoints, got %d", len(endpoints))
	}
	if endpoints[0].ID != "ep_1" {
		t.Errorf("expected ep_1, got %s", endpoints[0].ID)
	}
	if endpoints[1].URL != "https://b.com" {
		t.Errorf("expected https://b.com, got %s", endpoints[1].URL)
	}
}

// =============================================================================
// EndpointsResource.Create — httptest
// =============================================================================

func TestEndpointsResourceCreate(t *testing.T) {
	var receivedBody map[string]interface{}
	var receivedMethod string
	var receivedPath string

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		receivedMethod = r.Method
		receivedPath = r.URL.Path

		body, _ := io.ReadAll(r.Body)
		json.Unmarshal(body, &receivedBody)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(201)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"id":          "ep_new",
			"url":         receivedBody["url"],
			"description": receivedBody["description"],
			"rate_limit":  receivedBody["rate_limit"],
			"active":      true,
			"created_at":  "2024-01-01T00:00:00Z",
			"updated_at":  "2024-01-01T00:00:00Z",
		})
	}))
	defer server.Close()

	c := New("tok", &Options{BaseURL: server.URL})
	active := true
	ep, err := c.Endpoints.Create(EndpointCreateInput{
		URL:         "https://new.example.com",
		Description: "Test endpoint",
		RateLimit:   200,
		Active:      &active,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if receivedMethod != "POST" {
		t.Errorf("expected POST, got %s", receivedMethod)
	}
	if receivedPath != "/v1/endpoints" {
		t.Errorf("expected /v1/endpoints, got %s", receivedPath)
	}
	if receivedBody["url"] != "https://new.example.com" {
		t.Errorf("expected url in body, got %v", receivedBody["url"])
	}
	if receivedBody["description"] != "Test endpoint" {
		t.Errorf("expected description in body, got %v", receivedBody["description"])
	}
	if receivedBody["rate_limit"] != float64(200) {
		t.Errorf("expected rate_limit=200, got %v", receivedBody["rate_limit"])
	}
	if ep.ID != "ep_new" {
		t.Errorf("expected ep_new, got %s", ep.ID)
	}
}

// =============================================================================
// WebhooksResource.Send — httptest
// =============================================================================

func TestWebhooksResourceSend(t *testing.T) {
	var receivedBody map[string]interface{}
	var receivedMethod string

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		receivedMethod = r.Method
		body, _ := io.ReadAll(r.Body)
		json.Unmarshal(body, &receivedBody)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"id":          "del_1",
			"endpoint_id": receivedBody["endpoint_id"],
			"event":       receivedBody["event"],
			"status":      "delivered",
			"created_at":  "2024-01-01T00:00:00Z",
		})
	}))
	defer server.Close()

	c := New("tok", &Options{BaseURL: server.URL})
	delivery, err := c.Webhooks.Send(WebhookSendInput{
		EndpointID: "ep_1",
		Event:      "order.created",
		Data:       map[string]interface{}{"order_id": "12345"},
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if receivedMethod != "POST" {
		t.Errorf("expected POST, got %s", receivedMethod)
	}
	if receivedBody["endpoint_id"] != "ep_1" {
		t.Errorf("expected ep_1, got %v", receivedBody["endpoint_id"])
	}
	if receivedBody["event"] != "order.created" {
		t.Errorf("expected order.created, got %v", receivedBody["event"])
	}
	data := receivedBody["data"].(map[string]interface{})
	if data["order_id"] != "12345" {
		t.Errorf("expected order_id=12345, got %v", data["order_id"])
	}
	if delivery.ID != "del_1" {
		t.Errorf("expected del_1, got %s", delivery.ID)
	}
	if delivery.Status != "delivered" {
		t.Errorf("expected delivered, got %s", delivery.Status)
	}
}

// =============================================================================
// Error handling — 401 and 500
// =============================================================================

func TestEndpointsResourceListUnauthorized(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(401)
		w.Write([]byte(`{"error":"unauthorized"}`))
	}))
	defer server.Close()

	c := New("bad-key", &Options{BaseURL: server.URL, NumRetries: 0})
	_, err := c.Endpoints.List()
	if err == nil {
		t.Fatal("expected error on 401")
	}

	apiErr, ok := err.(*APIError)
	if !ok {
		t.Fatalf("expected *APIError, got %T", err)
	}
	if apiErr.StatusCode != 401 {
		t.Errorf("expected status 401, got %d", apiErr.StatusCode)
	}
}

func TestEndpointsResourceListInternalServerError(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(500)
		w.Write([]byte(`{"error":"internal server error"}`))
	}))
	defer server.Close()

	c := New("tok", &Options{BaseURL: server.URL, NumRetries: 0})
	_, err := c.Endpoints.List()
	if err == nil {
		t.Fatal("expected error on 500")
	}

	apiErr, ok := err.(*APIError)
	if !ok {
		t.Fatalf("expected *APIError, got %T", err)
	}
	if apiErr.StatusCode != 500 {
		t.Errorf("expected status 500, got %d", apiErr.StatusCode)
	}
}

func TestWebhooksResourceSendBadRequest(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(400)
		w.Write([]byte(`{"error":"invalid endpoint_id"}`))
	}))
	defer server.Close()

	c := New("tok", &Options{BaseURL: server.URL, NumRetries: 0})
	_, err := c.Webhooks.Send(WebhookSendInput{
		EndpointID: "bad",
		Event:      "test",
	})
	if err == nil {
		t.Fatal("expected error on 400")
	}

	apiErr, ok := err.(*APIError)
	if !ok {
		t.Fatalf("expected *APIError, got %T", err)
	}
	if apiErr.StatusCode != 400 {
		t.Errorf("expected status 400, got %d", apiErr.StatusCode)
	}
}

func TestEndpointsResourceCreateServerError(t *testing.T) {
	callCount := 0
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		callCount++
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(500)
		w.Write([]byte(`{"error":"boom"}`))
	}))
	defer server.Close()

	c := New("tok", &Options{BaseURL: server.URL, NumRetries: 2})
	_, err := c.Endpoints.Create(EndpointCreateInput{URL: "https://fail.com"})
	if err == nil {
		t.Fatal("expected error on 500")
	}

	// Should have retried: 1 initial + 2 retries = 3 calls
	if callCount != 3 {
		t.Errorf("expected 3 attempts (initial + 2 retries), got %d", callCount)
	}
}
