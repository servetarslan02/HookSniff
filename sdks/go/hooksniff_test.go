package hooksniff

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"testing"
)

func TestVerifySignature_ValidSignature(t *testing.T) {
	secret := "whsec_test_secret_key_1234567890abcdef"
	payload := `{"event":"order.created","data":{"id":"123"}}`

	sig := signPayload(payload, secret)
	if !VerifySignature(payload, sig, secret) {
		t.Error("Valid signature should verify successfully")
	}
}

func TestVerifySignature_WrongSignature(t *testing.T) {
	secret := "whsec_test_secret_key_1234567890abcdef"
	payload := `{"event":"order.created","data":{"id":"123"}}`

	if VerifySignature(payload, "deadbeef", secret) {
		t.Error("Wrong signature should fail verification")
	}
}

func TestVerifySignature_WrongSecret(t *testing.T) {
	secret := "whsec_test_secret_key_1234567890abcdef"
	payload := `{"event":"order.created","data":{"id":"123"}}`

	sig := signPayload(payload, secret)
	if VerifySignature(payload, sig, "whsec_wrong_secret") {
		t.Error("Wrong secret should fail verification")
	}
}

func TestVerifySignature_EmptyInputs(t *testing.T) {
	secret := "whsec_test_secret_key_1234567890abcdef"
	payload := `{"event":"order.created","data":{"id":"123"}}`
	sig := signPayload(payload, secret)

	if VerifySignature("", sig, secret) {
		t.Error("Empty payload should fail")
	}
	if VerifySignature(payload, "", secret) {
		t.Error("Empty signature should fail")
	}
	if VerifySignature(payload, sig, "") {
		t.Error("Empty secret should fail")
	}
}

func TestVerifySignature_TamperedPayload(t *testing.T) {
	secret := "whsec_test_secret_key_1234567890abcdef"
	payload := `{"event":"order.created","data":{"id":"123"}}`

	sig := signPayload(payload, secret)
	if VerifySignature(payload+"tampered", sig, secret) {
		t.Error("Tampered payload should fail verification")
	}
}

func TestVerifySignature_WithPrefix(t *testing.T) {
	secret := "whsec_test_secret_key_1234567890abcdef"
	payload := `{"event":"order.created","data":{"id":"123"}}`

	sig := "v1," + signPayload(payload, secret)
	if !VerifySignature(payload, sig, secret) {
		t.Error("Signature with v1 prefix should verify successfully")
	}
}

func TestNewClient_DefaultBaseURL(t *testing.T) {
	client := New("hr_live_test_key_1234567890")
	if client.BaseURL != DefaultBaseURL {
		t.Errorf("Expected default base URL %s, got %s", DefaultBaseURL, client.BaseURL)
	}
}

func TestNewClient_CustomBaseURL(t *testing.T) {
	customURL := "https://custom.api.com/v1"
	client := NewWithBaseURL("hr_live_test_key_1234567890", customURL)
	if client.BaseURL != customURL {
		t.Errorf("Expected custom base URL %s, got %s", customURL, client.BaseURL)
	}
}

func signPayload(payload, secret string) string {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(payload))
	return hex.EncodeToString(mac.Sum(nil))
}
