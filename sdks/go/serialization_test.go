package hooksniff

import (
	"encoding/json"
	"testing"
	"time"
)

// =============================================================================
// Serialization Tests — Resource-layer structs
// =============================================================================

func TestEndpointOutputToJSON(t *testing.T) {
	e := EndpointOutput{
		ID:          "ep_abc123",
		URL:         "https://example.com/hook",
		Description: "Test endpoint",
		RateLimit:   100,
		Active:      true,
		CreatedAt:   "2024-01-15T10:00:00Z",
		UpdatedAt:   "2024-01-16T12:00:00Z",
	}
	m := e.ToJSON()
	if m["id"] != "ep_abc123" {
		t.Errorf("expected id=ep_abc123, got %v", m["id"])
	}
	if m["url"] != "https://example.com/hook" {
		t.Errorf("expected url, got %v", m["url"])
	}
	if m["rate_limit"] != 100 {
		t.Errorf("expected rate_limit=100, got %v", m["rate_limit"])
	}
	if m["active"] != true {
		t.Errorf("expected active=true, got %v", m["active"])
	}
}

func TestEndpointOutputFromJSON(t *testing.T) {
	data := map[string]interface{}{
		"id":          "ep_xyz",
		"url":         "https://test.com/webhook",
		"description": "Desc",
		"rate_limit":  float64(50),
		"active":      true,
		"created_at":  "2024-06-01T00:00:00Z",
		"updated_at":  "2024-06-02T00:00:00Z",
	}
	e := EndpointOutputFromJSON(data)
	if e.ID != "ep_xyz" {
		t.Errorf("expected ep_xyz, got %s", e.ID)
	}
	if e.RateLimit != 50 {
		t.Errorf("expected 50, got %d", e.RateLimit)
	}
	if !e.Active {
		t.Error("expected active=true")
	}
}

func TestEndpointOutputRoundTrip(t *testing.T) {
	original := EndpointOutput{
		ID:        "ep_rt",
		URL:       "https://rt.example.com",
		Active:    true,
		RateLimit: 25,
	}
	m := original.ToJSON()
	restored := EndpointOutputFromJSON(m)
	if restored.ID != original.ID || restored.URL != original.URL || restored.RateLimit != original.RateLimit {
		t.Error("round-trip failed for EndpointOutput")
	}
}

func TestEndpointCreateInputToJSON(t *testing.T) {
	active := true
	in := EndpointCreateInput{
		URL:         "https://new.example.com",
		Description: "New endpoint",
		RateLimit:   200,
		Active:      &active,
	}
	m := in.ToJSON()
	if m["url"] != "https://new.example.com" {
		t.Errorf("expected url, got %v", m["url"])
	}
	if m["active"] != true {
		t.Errorf("expected active=true, got %v", m["active"])
	}
}

func TestEndpointCreateInputFromJSON(t *testing.T) {
	data := map[string]interface{}{
		"url":       "https://fromjson.com",
		"rate_limit": float64(300),
	}
	in := EndpointCreateInputFromJSON(data)
	if in.URL != "https://fromjson.com" {
		t.Errorf("expected url, got %s", in.URL)
	}
	if in.RateLimit != 300 {
		t.Errorf("expected 300, got %d", in.RateLimit)
	}
}

func TestEndpointUpdateInputToJSONOmitEmpty(t *testing.T) {
	in := EndpointUpdateInput{URL: "https://updated.com"}
	m := in.ToJSON()
	if _, exists := m["description"]; exists {
		t.Error("expected description to be omitted")
	}
	if m["url"] != "https://updated.com" {
		t.Errorf("expected url, got %v", m["url"])
	}
}

func TestWebhookSendInputToJSON(t *testing.T) {
	in := WebhookSendInput{
		EndpointID: "ep_1",
		Event:      "order.created",
		Data:       map[string]interface{}{"order_id": "12345"},
	}
	m := in.ToJSON()
	if m["endpoint_id"] != "ep_1" {
		t.Errorf("expected ep_1, got %v", m["endpoint_id"])
	}
	if m["event"] != "order.created" {
		t.Errorf("expected order.created, got %v", m["event"])
	}
	data := m["data"].(map[string]interface{})
	if data["order_id"] != "12345" {
		t.Errorf("expected 12345, got %v", data["order_id"])
	}
}

func TestWebhookSendInputFromJSON(t *testing.T) {
	data := map[string]interface{}{
		"endpoint_id": "ep_2",
		"event":       "payment.success",
		"data":        map[string]interface{}{"amount": float64(99.5)},
	}
	in := WebhookSendInputFromJSON(data)
	if in.EndpointID != "ep_2" {
		t.Errorf("expected ep_2, got %s", in.EndpointID)
	}
	if in.Event != "payment.success" {
		t.Errorf("expected payment.success, got %s", in.Event)
	}
}

func TestWebhookBatchInputToJSON(t *testing.T) {
	in := WebhookBatchInput{
		EndpointID: "ep_batch",
		Events: []WebhookBatchEventInput{
			{Event: "evt1", Data: map[string]interface{}{"a": 1}},
			{Event: "evt2", Data: map[string]interface{}{"b": 2}},
		},
	}
	m := in.ToJSON()
	events := m["events"].([]interface{})
	if len(events) != 2 {
		t.Errorf("expected 2 events, got %d", len(events))
	}
}

func TestDeliveryOutputToJSON(t *testing.T) {
	d := DeliveryOutput{
		ID:           "del_1",
		EndpointID:   "ep_1",
		Event:        "order.created",
		Status:       "delivered",
		ResponseCode: 200,
		ResponseBody: `{"ok":true}`,
		CreatedAt:    "2024-01-01T00:00:00Z",
		DeliveredAt:  "2024-01-01T00:00:01Z",
		AttemptCount: 1,
	}
	m := d.ToJSON()
	if m["status"] != "delivered" {
		t.Errorf("expected delivered, got %v", m["status"])
	}
	if m["response_code"] != 200 {
		t.Errorf("expected 200, got %v", m["response_code"])
	}
}

func TestDeliveryOutputFromJSON(t *testing.T) {
	data := map[string]interface{}{
		"id":            "del_2",
		"endpoint_id":   "ep_2",
		"event":         "payment.refund",
		"status":        "failed",
		"response_code": float64(500),
		"attempt_count": float64(3),
	}
	d := DeliveryOutputFromJSON(data)
	if d.ID != "del_2" {
		t.Errorf("expected del_2, got %s", d.ID)
	}
	if d.ResponseCode != 500 {
		t.Errorf("expected 500, got %d", d.ResponseCode)
	}
	if d.AttemptCount != 3 {
		t.Errorf("expected 3, got %d", d.AttemptCount)
	}
}

func TestDeliveryListOutputToJSON(t *testing.T) {
	dl := DeliveryListOutput{
		Data: []DeliveryOutput{
			{ID: "d1", Status: "ok"},
			{ID: "d2", Status: "failed"},
		},
		HasMore: true,
	}
	m := dl.ToJSON()
	if m["has_more"] != true {
		t.Error("expected has_more=true")
	}
	data := m["data"].([]interface{})
	if len(data) != 2 {
		t.Errorf("expected 2 items, got %d", len(data))
	}
}

func TestBatchOutputFromJSON(t *testing.T) {
	data := map[string]interface{}{
		"batch_id": "batch_abc",
		"count":    float64(10),
	}
	b := BatchOutputFromJSON(data)
	if b.BatchID != "batch_abc" {
		t.Errorf("expected batch_abc, got %s", b.BatchID)
	}
	if b.Count != 10 {
		t.Errorf("expected 10, got %d", b.Count)
	}
}

func TestAuthOutputWrapperRoundTrip(t *testing.T) {
	original := AuthOutputWrapper{
		Token:   "tok_secret123",
		UserID:  "usr_1",
		Email:   "test@example.com",
		Plan:    "pro",
		IsAdmin: false,
	}
	m := original.ToJSON()
	restored := AuthOutputWrapperFromJSON(m)
	if restored.Token != original.Token {
		t.Errorf("token mismatch: %s vs %s", restored.Token, original.Token)
	}
	if restored.Email != original.Email {
		t.Errorf("email mismatch")
	}
	if restored.IsAdmin != original.IsAdmin {
		t.Error("is_admin mismatch")
	}
}

func TestLoginInputToJSONIncludesTOTP(t *testing.T) {
	in := LoginInput{Email: "a@b.com", Password: "pw", TOTPCode: "123456"}
	m := in.ToJSON()
	if m["totp_code"] != "123456" {
		t.Errorf("expected totp_code, got %v", m["totp_code"])
	}
}

func TestLoginInputToJSONOmitsEmptyTOTP(t *testing.T) {
	in := LoginInput{Email: "a@b.com", Password: "pw"}
	m := in.ToJSON()
	if _, exists := m["totp_code"]; exists {
		t.Error("expected totp_code to be omitted when empty")
	}
}

func TestPortalOutputWrapperRoundTrip(t *testing.T) {
	original := PortalOutputWrapper{URL: "https://billing.stripe.com/portal"}
	m := original.ToJSON()
	restored := PortalOutputWrapperFromJSON(m)
	if restored.URL != original.URL {
		t.Error("URL mismatch")
	}
}

func TestApiKeyCreateInputWrapperToJSON(t *testing.T) {
	in := ApiKeyCreateInputWrapper{Name: "CI Key", ExpiresAt: "2025-12-31"}
	m := in.ToJSON()
	if m["name"] != "CI Key" {
		t.Errorf("expected CI Key, got %v", m["name"])
	}
	if m["expires_at"] != "2025-12-31" {
		t.Errorf("expected expires_at, got %v", m["expires_at"])
	}
}

// =============================================================================
// Serialization Tests — Model-layer structs
// =============================================================================

func TestEndpointModelToJSON(t *testing.T) {
	now := time.Date(2024, 3, 15, 10, 0, 0, 0, time.UTC)
	rp := NewRetryPolicy(5, "exponential", 1, 60)
	ep := NewEndpoint("ep_m1", "https://m.example.com", true, *rp, now, "round-robin", 150, 0, "json")
	ep.AllowedIps = []string{"10.0.0.0/8"}
	ep.EventFilter = []string{"order.*"}

	m := ep.ToJSON()
	if m["id"] != "ep_m1" {
		t.Errorf("expected ep_m1, got %v", m["id"])
	}
	if m["routing_strategy"] != "round-robin" {
		t.Errorf("expected round-robin, got %v", m["routing_strategy"])
	}
	ips, ok := m["allowed_ips"].([]string)
	if !ok || len(ips) != 1 || ips[0] != "10.0.0.0/8" {
		t.Errorf("allowed_ips mismatch: %v", m["allowed_ips"])
	}
}

func TestEndpointModelFromJSON(t *testing.T) {
	now := time.Date(2024, 6, 1, 0, 0, 0, 0, time.UTC)
	data := map[string]interface{}{
		"id":                "ep_from",
		"url":               "https://from.example.com",
		"is_active":         true,
		"retry_policy":      map[string]interface{}{"max_attempts": float64(3), "backoff": "linear", "initial_delay_secs": float64(2), "max_delay_secs": float64(30)},
		"created_at":        now.Format(time.RFC3339),
		"routing_strategy":  "failover",
		"avg_response_ms":   float64(200),
		"failure_streak":    float64(0),
		"format":            "json",
	}
	ep := EndpointFromJSON(data)
	if ep.Id != "ep_from" {
		t.Errorf("expected ep_from, got %s", ep.Id)
	}
	if ep.RetryPolicy.MaxAttempts != 3 {
		t.Errorf("expected 3, got %d", ep.RetryPolicy.MaxAttempts)
	}
	if ep.RoutingStrategy != "failover" {
		t.Errorf("expected failover, got %s", ep.RoutingStrategy)
	}
}

func TestEndpointModelRoundTrip(t *testing.T) {
	now := time.Date(2024, 1, 1, 12, 0, 0, 0, time.UTC)
	rp := NewRetryPolicy(3, "exponential", 1, 30)
	original := NewEndpoint("ep_rt2", "https://rt2.com", false, *rp, now, "random", 99, 2, "xml")
	m := original.ToJSON()

	// Convert time back to string for FromJSON
	m["created_at"] = now.Format(time.RFC3339)

	restored := EndpointFromJSON(m)
	if restored.Id != original.Id {
		t.Errorf("id mismatch: %s vs %s", restored.Id, original.Id)
	}
	if restored.Format != original.Format {
		t.Errorf("format mismatch: %s vs %s", restored.Format, original.Format)
	}
}

func TestDeliveryModelToJSON(t *testing.T) {
	now := time.Date(2024, 5, 1, 0, 0, 0, 0, time.UTC)
	d := NewDelivery("del_m1", "ep_1", "delivered", 1, 0, now)
	m := d.ToJSON()
	if m["id"] != "del_m1" {
		t.Errorf("expected del_m1, got %v", m["id"])
	}
	if m["status"] != "delivered" {
		t.Errorf("expected delivered, got %v", m["status"])
	}
}

func TestDeliveryModelFromJSON(t *testing.T) {
	now := time.Date(2024, 5, 1, 0, 0, 0, 0, time.UTC)
	data := map[string]interface{}{
		"id":            "del_from",
		"endpoint_id":   "ep_from",
		"status":        "failed",
		"attempt_count": float64(3),
		"replay_count":  float64(1),
		"created_at":    now.Format(time.RFC3339),
	}
	d := DeliveryFromJSON(data)
	if d.Id != "del_from" {
		t.Errorf("expected del_from, got %s", d.Id)
	}
	if d.AttemptCount != 3 {
		t.Errorf("expected 3, got %d", d.AttemptCount)
	}
}

func TestErrorModelToJSON(t *testing.T) {
	e := NewError("something went wrong")
	m := e.ToJSON()
	if m["error"] != "something went wrong" {
		t.Errorf("expected error msg, got %v", m["error"])
	}
}

func TestErrorModelFromJSON(t *testing.T) {
	data := map[string]interface{}{"error": "not found"}
	e := ErrorFromJSON(data)
	if e.Error != "not found" {
		t.Errorf("expected 'not found', got %s", e.Error)
	}
}

func TestRetryPolicyModelToJSON(t *testing.T) {
	rp := NewRetryPolicy(5, "exponential", 2, 120)
	m := rp.ToJSON()
	if m["max_attempts"] != int32(5) {
		t.Errorf("expected 5, got %v", m["max_attempts"])
	}
	if m["backoff"] != "exponential" {
		t.Errorf("expected exponential, got %v", m["backoff"])
	}
}

func TestRetryPolicyModelFromJSON(t *testing.T) {
	data := map[string]interface{}{
		"max_attempts":      float64(10),
		"backoff":           "linear",
		"initial_delay_secs": float64(5),
		"max_delay_secs":    float64(300),
	}
	rp := RetryPolicyFromJSON(data)
	if rp.MaxAttempts != 10 {
		t.Errorf("expected 10, got %d", rp.MaxAttempts)
	}
	if rp.Backoff != "linear" {
		t.Errorf("expected linear, got %s", rp.Backoff)
	}
}

func TestAlertRuleModelToJSON(t *testing.T) {
	now := time.Date(2024, 2, 1, 0, 0, 0, 0, time.UTC)
	a := NewAlertRule("ar_1", "High failure rate", "failure_rate > 0.1", 10, []string{"email", "slack"}, true, now)
	m := a.ToJSON()
	if m["name"] != "High failure rate" {
		t.Errorf("expected High failure rate, got %v", m["name"])
	}
	channels, ok := m["channels"].([]string)
	if !ok || len(channels) != 2 {
		t.Errorf("channels mismatch: %v", m["channels"])
	}
}

func TestAlertRuleModelFromJSON(t *testing.T) {
	now := time.Date(2024, 2, 1, 0, 0, 0, 0, time.UTC)
	data := map[string]interface{}{
		"id":         "ar_from",
		"name":       "Latency alert",
		"condition":  "avg_latency > 500",
		"threshold":  float64(500),
		"channels":   []interface{}{"webhook"},
		"is_active":  true,
		"created_at": now.Format(time.RFC3339),
	}
	a := AlertRuleFromJSON(data)
	if a.Name != "Latency alert" {
		t.Errorf("expected Latency alert, got %s", a.Name)
	}
	if len(a.Channels) != 1 || a.Channels[0] != "webhook" {
		t.Errorf("channels mismatch: %v", a.Channels)
	}
}

func TestEventTypeModelRoundTrip(t *testing.T) {
	et := NewEventType("et_1", "order.created")
	desc := "Fired when an order is created"
	et.Description.Set(&desc)

	m := et.ToJSON()
	if m["name"] != "order.created" {
		t.Errorf("expected order.created, got %v", m["name"])
	}

	restored := EventTypeFromJSON(m)
	if restored.Id != "et_1" || restored.Name != "order.created" {
		t.Error("round-trip failed for EventType")
	}
}

func TestCustomDomainModelToJSON(t *testing.T) {
	now := time.Date(2024, 4, 1, 0, 0, 0, 0, time.UTC)
	cd := NewCustomDomain("cd_1", "webhooks.example.com", "verified", now)
	m := cd.ToJSON()
	if m["domain"] != "webhooks.example.com" {
		t.Errorf("expected domain, got %v", m["domain"])
	}
	if m["status"] != "verified" {
		t.Errorf("expected verified, got %v", m["status"])
	}
}

func TestTransformRuleModelFromJSON(t *testing.T) {
	now := time.Date(2024, 7, 1, 0, 0, 0, 0, time.UTC)
	data := map[string]interface{}{
		"id":          "tr_1",
		"endpoint_id": "ep_1",
		"name":        "Add header",
		"rule_type":   "add_header",
		"config":      map[string]interface{}{"key": "X-Custom", "value": "test"},
		"is_active":   true,
		"created_at":  now.Format(time.RFC3339),
	}
	tr := TransformRuleFromJSON(data)
	if tr.Name != "Add header" {
		t.Errorf("expected Add header, got %s", tr.Name)
	}
	if tr.Config["key"] != "X-Custom" {
		t.Errorf("config mismatch: %v", tr.Config)
	}
}

func TestEndpointListResponseFromJSON(t *testing.T) {
	now := time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC)
	rp := map[string]interface{}{"max_attempts": float64(3), "backoff": "exponential", "initial_delay_secs": float64(1), "max_delay_secs": float64(30)}
	data := map[string]interface{}{
		"data": []interface{}{
			map[string]interface{}{
				"id": "ep_1", "url": "https://a.com", "is_active": true,
				"retry_policy": rp, "created_at": now.Format(time.RFC3339),
				"routing_strategy": "round-robin", "avg_response_ms": float64(100),
				"failure_streak": float64(0), "format": "json",
			},
		},
		"total":    float64(1),
		"has_more": false,
	}
	resp := EndpointListResponseFromJSON(data)
	if len(resp.Data) != 1 {
		t.Errorf("expected 1 endpoint, got %d", len(resp.Data))
	}
	if resp.Data[0].Id != "ep_1" {
		t.Errorf("expected ep_1, got %s", resp.Data[0].Id)
	}
}

func TestDeliveryListResponseFromJSON(t *testing.T) {
	now := time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC)
	data := map[string]interface{}{
		"deliveries": []interface{}{
			map[string]interface{}{
				"id": "del_1", "endpoint_id": "ep_1", "status": "delivered",
				"attempt_count": float64(1), "replay_count": float64(0),
				"created_at": now.Format(time.RFC3339),
			},
		},
		"total":    float64(1),
		"page":     float64(1),
		"per_page": float64(20),
	}
	resp := DeliveryListResponseFromJSON(data)
	if len(resp.Deliveries) != 1 {
		t.Errorf("expected 1 delivery, got %d", len(resp.Deliveries))
	}
	if resp.PerPage != 20 {
		t.Errorf("expected per_page=20, got %d", resp.PerPage)
	}
}

// =============================================================================
// JSON Marshal roundtrip for resource structs
// =============================================================================

func TestResourceStructJSONMarshal(t *testing.T) {
	// Ensure resource structs can be marshaled/unmarshaled via encoding/json
	original := DeliveryOutput{
		ID:           "del_json",
		EndpointID:   "ep_json",
		Event:        "test.event",
		Status:       "pending",
		ResponseCode: 0,
		AttemptCount: 0,
	}
	bytes, err := json.Marshal(original)
	if err != nil {
		t.Fatalf("marshal error: %v", err)
	}
	var restored DeliveryOutput
	if err := json.Unmarshal(bytes, &restored); err != nil {
		t.Fatalf("unmarshal error: %v", err)
	}
	if restored.ID != original.ID || restored.Status != original.Status {
		t.Error("JSON round-trip failed")
	}
}

func TestEndpointHealthModelToJSON(t *testing.T) {
	eh := &EndpointHealth{
		EndpointId: "ep_health",
		IsHealthy:  true,
	}
	sr := 0.95
	eh.SuccessRate = &sr
	avgMs := int32(120)
	eh.AvgResponseMs = &avgMs

	m := eh.ToJSON()
	if m["endpoint_id"] != "ep_health" {
		t.Errorf("expected ep_health, got %v", m["endpoint_id"])
	}
	if m["is_healthy"] != true {
		t.Error("expected is_healthy=true")
	}
}

func TestTimeHelpers(t *testing.T) {
	now := time.Date(2024, 8, 15, 14, 30, 0, 0, time.UTC)
	s := TimeToJSON(now)
	if s != "2024-08-15T14:30:00Z" {
		t.Errorf("expected RFC3339, got %s", s)
	}
	parsed := TimeFromJSON(s)
	if !parsed.Equal(now) {
		t.Errorf("TimeFromJSON round-trip failed: %v vs %v", parsed, now)
	}
	// Zero value for non-string
	zero := TimeFromJSON(42)
	if !zero.IsZero() {
		t.Error("expected zero time for non-string input")
	}
}
