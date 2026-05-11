package hooksniff

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"strings"
	"testing"
	"time"
)

func generateTestSecret() string {
	return "whsec_" + base64.StdEncoding.EncodeToString([]byte("test-secret-key-for-hmac"))
}

func signTestPayload(secret, msgID string, timestamp int64, body string) map[string]string {
	raw := secret
	if strings.HasPrefix(raw, "whsec_") {
		raw = raw[6:]
	}
	secretBytes, _ := base64.StdEncoding.DecodeString(raw)
	content := fmt.Sprintf("%s.%d.%s", msgID, timestamp, body)
	mac := hmac.New(sha256.New, secretBytes)
	mac.Write([]byte(content))
	sig := base64.StdEncoding.EncodeToString(mac.Sum(nil))
	return map[string]string{
		"webhook-id":        msgID,
		"webhook-timestamp": fmt.Sprintf("%d", timestamp),
		"webhook-signature": "v1," + sig,
	}
}

func TestVerifyValidSignature(t *testing.T) {
	secret := generateTestSecret()
	body := `{"event":"order.created","data":{"order_id":"12345"}}`
	ts := time.Now().Unix()
	headers := signTestPayload(secret, "msg_test123", ts, body)

	wh := NewWebhook(secret)
	result, err := wh.Verify([]byte(body), headers)
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}
	if result["event"] != "order.created" {
		t.Errorf("expected event=order.created, got: %v", result["event"])
	}
}

func TestVerifyInvalidSignature(t *testing.T) {
	secret := generateTestSecret()
	body := `{"event":"test"}`
	ts := time.Now().Unix()
	headers := signTestPayload(secret, "msg_test", ts, body)
	headers["webhook-signature"] = "v1,invalid_signature"

	wh := NewWebhook(secret)
	_, err := wh.Verify([]byte(body), headers)
	if err != ErrInvalidSignature {
		t.Errorf("expected ErrInvalidSignature, got: %v", err)
	}
}

func TestVerifyMissingHeaders(t *testing.T) {
	secret := generateTestSecret()
	wh := NewWebhook(secret)

	_, err := wh.Verify([]byte("{}"), map[string]string{})
	if err != ErrMissingWebhookID {
		t.Errorf("expected ErrMissingWebhookID, got: %v", err)
	}

	_, err = wh.Verify([]byte("{}"), map[string]string{"webhook-id": "msg_1"})
	if err != ErrMissingWebhookTimestamp {
		t.Errorf("expected ErrMissingWebhookTimestamp, got: %v", err)
	}

	_, err = wh.Verify([]byte("{}"), map[string]string{
		"webhook-id":        "msg_1",
		"webhook-timestamp": fmt.Sprintf("%d", time.Now().Unix()),
	})
	if err != ErrMissingWebhookSignature {
		t.Errorf("expected ErrMissingWebhookSignature, got: %v", err)
	}
}

func TestVerifyExpiredTimestamp(t *testing.T) {
	secret := generateTestSecret()
	body := `{"event":"test"}`
	ts := time.Now().Unix() - 600 // 10 minutes ago
	headers := signTestPayload(secret, "msg_test", ts, body)

	wh := NewWebhook(secret)
	_, err := wh.Verify([]byte(body), headers)
	if err != ErrTimestampTooOld {
		t.Errorf("expected ErrTimestampTooOld, got: %v", err)
	}
}

func TestVerifySvixHeaders(t *testing.T) {
	secret := generateTestSecret()
	body := `{"event":"test"}`
	ts := time.Now().Unix()
	stdHeaders := signTestPayload(secret, "msg_test", ts, body)

	svixHeaders := map[string]string{
		"svix-id":        stdHeaders["webhook-id"],
		"svix-timestamp": stdHeaders["webhook-timestamp"],
		"svix-signature": stdHeaders["webhook-signature"],
	}

	wh := NewWebhook(secret)
	result, err := wh.Verify([]byte(body), svixHeaders)
	if err != nil {
		t.Fatalf("expected no error with svix headers, got: %v", err)
	}
	if result == nil {
		t.Error("expected non-nil result")
	}
}

func TestVerifyMultipleSignatures(t *testing.T) {
	secret := generateTestSecret()
	body := `{"event":"test"}`
	ts := time.Now().Unix()
	headers := signTestPayload(secret, "msg_test", ts, body)
	headers["webhook-signature"] = "v1,wrong_sig," + strings.TrimPrefix(headers["webhook-signature"], "v1,")

	wh := NewWebhook(secret)
	result, err := wh.Verify([]byte(body), headers)
	if err != nil {
		t.Fatalf("expected no error with multiple signatures, got: %v", err)
	}
	if result == nil {
		t.Error("expected non-nil result")
	}
}

func TestSign(t *testing.T) {
	secret := generateTestSecret()
	wh := NewWebhook(secret)
	ts := time.Now()
	sig := wh.Sign("msg_test", ts, []byte(`{"event":"test"}`))

	if !strings.HasPrefix(sig, "v1,") {
		t.Errorf("expected v1 prefix, got: %s", sig)
	}

	// Verify the signed payload
	headers := map[string]string{
		"webhook-id":        "msg_test",
		"webhook-timestamp": fmt.Sprintf("%d", ts.Unix()),
		"webhook-signature": sig,
	}
	result, err := wh.Verify([]byte(`{"event":"test"}`), headers)
	if err != nil {
		t.Fatalf("signed payload should verify, got: %v", err)
	}
	if result == nil {
		t.Error("expected non-nil result")
	}
}

func TestSecretWithAndWithoutPrefix(t *testing.T) {
	body := `{"event":"test"}`
	ts := time.Now().Unix()

	secret := generateTestSecret()
	headers := signTestPayload(secret, "msg_test", ts, body)

	// With whsec_ prefix
	wh1 := NewWebhook(secret)
	_, err := wh1.Verify([]byte(body), headers)
	if err != nil {
		t.Fatalf("with prefix: %v", err)
	}

	// Without whsec_ prefix
	rawSecret := strings.TrimPrefix(secret, "whsec_")
	wh2 := NewWebhook(rawSecret)
	_, err = wh2.Verify([]byte(body), headers)
	if err != nil {
		t.Fatalf("without prefix: %v", err)
	}
}
