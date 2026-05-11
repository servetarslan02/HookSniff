// Package hooksniff provides a clean wrapper for the HookSniff webhook delivery API.
//
// Usage:
//
//	client := hooksniff.New("your-api-key", nil)
//	endpoints, err := client.Endpoints.List()
//	delivery, err := client.Webhooks.Send(hooksniff.WebhookSendInput{...})
package hooksniff

import (
	"bytes"
	"crypto/tls"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

const (
	defaultBaseURL = "https://hooksniff-api-1046140057667.europe-west1.run.app"
	defaultTimeout = 30 * time.Second
	defaultRetries = 2
	libVersion     = "0.4.0"
	userAgent      = "hooksniff-go/" + libVersion
)

// Client is the main HookSniff API client.
type Client struct {
	BaseURL    string
	Token      string
	HTTPClient *http.Client
	NumRetries int

	Endpoints *EndpointsResource
	Webhooks  *WebhooksResource
	Auth      *AuthResource
	Analytics *AnalyticsResource
	APIKeys   *APIKeysResource
	Alerts    *AlertsResource
	Teams     *TeamsResource
	Search    *SearchResource
	Billing   *BillingResource
	Health    *HealthResource
}

// Options configures the client.
type Options struct {
	BaseURL    string
	Timeout    time.Duration
	NumRetries int
	HTTPClient *http.Client
}

// New creates a new HookSniff client.
func New(apiKey string, opts *Options) *Client {
	if apiKey == "" {
		panic("hooksniff: apiKey is required")
	}

	baseURL := defaultBaseURL
	timeout := defaultTimeout
	numRetries := defaultRetries

	if opts != nil {
		if opts.BaseURL != "" {
			baseURL = strings.TrimRight(opts.BaseURL, "/")
		}
		if opts.Timeout > 0 {
			timeout = opts.Timeout
		}
		if opts.NumRetries > 0 {
			numRetries = opts.NumRetries
		}
	}

	var httpClient *http.Client
	if opts != nil && opts.HTTPClient != nil {
		httpClient = opts.HTTPClient
	} else {
		httpClient = &http.Client{
			Timeout: timeout,
			Transport: &http.Transport{
				TLSClientConfig: &tls.Config{MinVersion: tls.VersionTLS12},
			},
		}
	}

	c := &Client{
		BaseURL:    baseURL,
		Token:      apiKey,
		HTTPClient: httpClient,
		NumRetries: numRetries,
	}

	c.Endpoints = &EndpointsResource{client: c}
	c.Webhooks = &WebhooksResource{client: c}
	c.Auth = &AuthResource{client: c}
	c.Analytics = &AnalyticsResource{client: c}
	c.APIKeys = &APIKeysResource{client: c}
	c.Alerts = &AlertsResource{client: c}
	c.Teams = &TeamsResource{client: c}
	c.Search = &SearchResource{client: c}
	c.Billing = &BillingResource{client: c}
	c.Health = &HealthResource{client: c}

	return c
}

// APIError represents an API error response.
type APIError struct {
	StatusCode int
	Body       string
}

func (e *APIError) Error() string {
	return fmt.Sprintf("HookSniff API Error %d: %s", e.StatusCode, e.Body)
}

// doRequest performs an HTTP request with retry logic.
func (c *Client) doRequest(method, path string, body interface{}) ([]byte, http.Header, error) {
	var bodyBytes []byte
	if body != nil {
		var err error
		bodyBytes, err = json.Marshal(body)
		if err != nil {
			return nil, nil, fmt.Errorf("marshal body: %w", err)
		}
	}

	// Generate idempotency key once (reused across retries)
	idempotencyKey := ""
	if method == "POST" {
		idempotencyKey = "auto_" + generateID()
	}

	var lastErr error
	for attempt := 0; attempt <= c.NumRetries; attempt++ {
		reqURL := c.BaseURL + path

		// Recreate body reader on each attempt (reader position resets)
		var bodyReader io.Reader
		if bodyBytes != nil {
			bodyReader = bytes.NewReader(bodyBytes)
		}

		req, err := http.NewRequest(method, reqURL, bodyReader)
		if err != nil {
			return nil, nil, fmt.Errorf("create request: %w", err)
		}

		req.Header.Set("Authorization", "Bearer "+c.Token)
		req.Header.Set("User-Agent", userAgent)
		req.Header.Set("Accept", "application/json")
		if body != nil {
			req.Header.Set("Content-Type", "application/json")
		}
		if idempotencyKey != "" {
			req.Header.Set("Idempotency-Key", idempotencyKey)
		}

		resp, err := c.HTTPClient.Do(req)
		if err != nil {
			lastErr = err
			if attempt < c.NumRetries {
				time.Sleep(50 * time.Millisecond * time.Duration(1<<uint(attempt)))
				continue
			}
			return nil, nil, err
		}

		respBody, err := io.ReadAll(resp.Body)
		resp.Body.Close() // Close immediately, not with defer
		if err != nil {
			lastErr = err
			if attempt < c.NumRetries {
				time.Sleep(50 * time.Millisecond * time.Duration(1<<uint(attempt)))
				continue
			}
			return nil, nil, err
		}

		if resp.StatusCode >= 500 && attempt < c.NumRetries {
			lastErr = &APIError{StatusCode: resp.StatusCode, Body: string(respBody)}
			time.Sleep(50 * time.Millisecond * time.Duration(1<<uint(attempt)))
			continue
		}

		if resp.StatusCode >= 400 {
			return nil, resp.Header, &APIError{StatusCode: resp.StatusCode, Body: string(respBody)}
		}

		return respBody, resp.Header, nil
	}

	return nil, nil, lastErr
}

// doGet performs a GET request.
func (c *Client) doGet(path string) ([]byte, error) {
	body, _, err := c.doRequest("GET", path, nil)
	return body, err
}

// doPost performs a POST request.
func (c *Client) doPost(path string, reqBody interface{}) ([]byte, error) {
	body, _, err := c.doRequest("POST", path, reqBody)
	return body, err
}

// doPut performs a PUT request.
func (c *Client) doPut(path string, reqBody interface{}) ([]byte, error) {
	body, _, err := c.doRequest("PUT", path, reqBody)
	return body, err
}

// doDelete performs a DELETE request.
func (c *Client) doDelete(path string) error {
	_, _, err := c.doRequest("DELETE", path, nil)
	return err
}

// generateID generates a random hex string for idempotency keys.
func generateID() string {
	b := make([]byte, 16)
	rand.Read(b)
	return hex.EncodeToString(b)
}
