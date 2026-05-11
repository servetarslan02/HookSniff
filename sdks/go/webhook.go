package hooksniff

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"
)

const timestampTolerance = 5 * time.Minute

var (
	ErrMissingWebhookID        = errors.New("hooksniff: missing webhook-id header")
	ErrMissingWebhookTimestamp = errors.New("hooksniff: missing webhook-timestamp header")
	ErrMissingWebhookSignature = errors.New("hooksniff: missing webhook-signature header")
	ErrInvalidTimestamp        = errors.New("hooksniff: invalid webhook-timestamp header")
	ErrTimestampTooOld         = errors.New("hooksniff: webhook timestamp is too old or too new")
	ErrInvalidSignature        = errors.New("hooksniff: invalid webhook signature")
)

// Webhook verifies incoming webhook signatures.
type Webhook struct {
	secret []byte
}

// NewWebhook creates a new Webhook verifier.
// The secret should be the endpoint's signing secret (e.g., "whsec_base64encoded...").
func NewWebhook(secret string) *Webhook {
	return &Webhook{secret: decodeSecret(secret)}
}

// decodeSecret strips the whsec_ prefix and base64-decodes the secret.
func decodeSecret(secret string) []byte {
	raw := secret
	if strings.HasPrefix(raw, "whsec_") {
		raw = raw[6:]
	}

	decoded, err := base64.StdEncoding.DecodeString(raw)
	if err != nil {
		return []byte(raw)
	}
	return decoded
}

// Verify verifies a webhook payload against its signature headers.
// Returns the parsed payload as a map if verification succeeds.
func (w *Webhook) Verify(payload []byte, headers map[string]string) (map[string]interface{}, error) {
	// Normalize headers to lowercase
	normalized := make(map[string]string)
	for k, v := range headers {
		normalized[strings.ToLower(k)] = v
	}

	// Support both svix- and webhook- prefixed headers
	msgID := normalized["svix-id"]
	if msgID == "" {
		msgID = normalized["webhook-id"]
	}
	timestamp := normalized["svix-timestamp"]
	if timestamp == "" {
		timestamp = normalized["webhook-timestamp"]
	}
	signature := normalized["svix-signature"]
	if signature == "" {
		signature = normalized["webhook-signature"]
	}

	if msgID == "" {
		return nil, ErrMissingWebhookID
	}
	if timestamp == "" {
		return nil, ErrMissingWebhookTimestamp
	}
	if signature == "" {
		return nil, ErrMissingWebhookSignature
	}

	// Validate timestamp
	ts, err := strconv.ParseInt(timestamp, 10, 64)
	if err != nil {
		return nil, ErrInvalidTimestamp
	}

	now := time.Now().Unix()
	if abs(now-ts) > int64(timestampTolerance.Seconds()) {
		return nil, ErrTimestampTooOld
	}

	// Compute expected signature
	content := fmt.Sprintf("%s.%s.%s", msgID, timestamp, string(payload))
	mac := hmac.New(sha256.New, w.secret)
	mac.Write([]byte(content))
	expectedSig := base64.StdEncoding.EncodeToString(mac.Sum(nil))
	expected := "v1," + expectedSig

	// Verify signature (supports multiple comma-separated signatures)
	if !verifySignature(expected, signature) {
		return nil, ErrInvalidSignature
	}

	// Parse JSON payload
	var result map[string]interface{}
	if err := json.Unmarshal(payload, &result); err != nil {
		// Return raw payload as string if not JSON
		return map[string]interface{}{"_raw": string(payload)}, nil
	}

	return result, nil
}

// Sign signs a payload for testing or server-side webhook sending.
func (w *Webhook) Sign(msgID string, timestamp time.Time, payload []byte) string {
	ts := strconv.FormatInt(timestamp.Unix(), 10)
	content := fmt.Sprintf("%s.%s.%s", msgID, ts, string(payload))
	mac := hmac.New(sha256.New, w.secret)
	mac.Write([]byte(content))
	sig := base64.StdEncoding.EncodeToString(mac.Sum(nil))
	return "v1," + sig
}

// verifySignature checks if any of the comma-separated signatures match.
func verifySignature(expected, actual string) bool {
	signatures := strings.Split(actual, ",")
	for _, sig := range signatures {
		sig = strings.TrimSpace(sig)

		// Strip version prefix
		parts := strings.SplitN(sig, ",", 2)
		sigPart := sig
		if len(parts) > 1 {
			sigPart = parts[1]
		}

		expectedParts := strings.SplitN(expected, ",", 2)
		expectedPart := expected
		if len(expectedParts) > 1 {
			expectedPart = expectedParts[1]
		}

		if len(expectedPart) != len(sigPart) {
			continue
		}

		if hmac.Equal([]byte(expectedPart), []byte(sigPart)) {
			return true
		}
	}
	return false
}

func abs(x int64) int64 {
	if x < 0 {
		return -x
	}
	return x
}
