package hooksniff

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"testing"
	"time"
)

func sign(secret, msgID string, timestamp int64, payload string) string {
	decoded, _ := base64.StdEncoding.DecodeString(secret)
	toSign := fmt.Sprintf("%s.%d.%s", msgID, timestamp, payload)
	mac := hmac.New(sha256.New, decoded)
	mac.Write([]byte(toSign))
	sig := base64.StdEncoding.EncodeToString(mac.Sum(nil))
	return "v1," + sig
}

func TestWebhookVerify(t *testing.T) {
	secret := "whsec_dGVzdA=="
	msgID := "msg_test123"
	timestamp := time.Now().Unix()
	payload := `{"event":"test"}`

	sig := sign(secret, msgID, timestamp, payload)
	headers := map[string]string{
		"webhook-id":        msgID,
		"webhook-timestamp": fmt.Sprintf("%d", timestamp),
		"webhook-signature": sig,
	}

	wh := NewWebhook(secret)
	result, err := wh.Verify([]byte(payload), headers)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result["event"] != "test" {
		t.Errorf("expected event=test, got %v", result["event"])
	}
}

func TestWebhookRejectInvalidSignature(t *testing.T) {
	secret := "whsec_dGVzdA=="
	msgID := "msg_test123"
	timestamp := time.Now().Unix()
	payload := `{"event":"test"}`

	headers := map[string]string{
		"webhook-id":        msgID,
		"webhook-timestamp": fmt.Sprintf("%d", timestamp),
		"webhook-signature": "v1,invalid",
	}

	wh := NewWebhook(secret)
	_, err := wh.Verify([]byte(payload), headers)
	if err == nil {
		t.Fatal("expected error for invalid signature")
	}
}

func TestWebhookRejectOldTimestamp(t *testing.T) {
	secret := "whsec_dGVzdA=="
	msgID := "msg_test123"
	timestamp := time.Now().Unix() - 600
	payload := `{"event":"test"}`

	sig := sign(secret, msgID, timestamp, payload)
	headers := map[string]string{
		"webhook-id":        msgID,
		"webhook-timestamp": fmt.Sprintf("%d", timestamp),
		"webhook-signature": sig,
	}

	wh := NewWebhook(secret)
	_, err := wh.Verify([]byte(payload), headers)
	if err == nil {
		t.Fatal("expected error for old timestamp")
	}
}

func TestWebhookSvixBrandedHeaders(t *testing.T) {
	secret := "whsec_dGVzdA=="
	msgID := "msg_test123"
	timestamp := time.Now().Unix()
	payload := `{"event":"test"}`

	sig := sign(secret, msgID, timestamp, payload)
	headers := map[string]string{
		"svix-id":        msgID,
		"svix-timestamp": fmt.Sprintf("%d", timestamp),
		"svix-signature": sig,
	}

	wh := NewWebhook(secret)
	result, err := wh.Verify([]byte(payload), headers)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result["event"] != "test" {
		t.Errorf("expected event=test, got %v", result["event"])
	}
}

func TestCreateErrorFromStatus(t *testing.T) {
	tests := []struct {
		statusCode int
		wantType   string
	}{
		{400, "*hooksniff.BadRequestError"},
		{401, "*hooksniff.UnauthorizedError"},
		{403, "*hooksniff.ForbiddenError"},
		{404, "*hooksniff.NotFoundError"},
		{409, "*hooksniff.ConflictError"},
		{422, "*hooksniff.UnprocessableEntityError"},
		{429, "*hooksniff.RateLimitError"},
		{500, "*hooksniff.InternalServerError"},
		{502, "*hooksniff.BadGatewayError"},
		{503, "*hooksniff.ServiceUnavailableError"},
		{504, "*hooksniff.GatewayTimeoutError"},
	}

	for _, tt := range tests {
		t.Run(fmt.Sprintf("status_%d", tt.statusCode), func(t *testing.T) {
			err := CreateErrorFromStatus(tt.statusCode, nil, nil)
			if err == nil {
				t.Fatal("expected error")
			}
			got := fmt.Sprintf("%T", err)
			if got != tt.wantType {
				t.Errorf("got %s, want %s", got, tt.wantType)
			}
		})
	}
}
