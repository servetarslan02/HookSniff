package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

// HookSniffClient is the API client for HookSniff.
type HookSniffClient struct {
	APIURL string
	APIKey string
}

// APIResponse represents a generic API response.
type APIResponse struct {
	Data  json.RawMessage `json:"data"`
	Error *APIError       `json:"error,omitempty"`
}

// APIError represents an API error.
type APIError struct {
	Message string `json:"message"`
	Code    string `json:"code"`
}

// Endpoint represents a HookSniff endpoint.
type Endpoint struct {
	ID              string  `json:"id"`
	URL             string  `json:"url"`
	Description     *string `json:"description"`
	IsActive        bool    `json:"is_active"`
	SigningSecret   string  `json:"signing_secret"`
	RoutingStrategy string  `json:"routing_strategy"`
	FallbackURL     *string `json:"fallback_url"`
	CreatedAt       string  `json:"created_at"`
}

// CreateEndpointRequest is the request body for creating an endpoint.
type CreateEndpointRequest struct {
	URL             string  `json:"url"`
	Description     *string `json:"description,omitempty"`
	RoutingStrategy *string `json:"routing_strategy,omitempty"`
	FallbackURL     *string `json:"fallback_url,omitempty"`
}

// doRequest performs an HTTP request against the HookSniff API.
func (c *HookSniffClient) doRequest(method, path string, body interface{}) ([]byte, error) {
	url := fmt.Sprintf("%s/v1%s", c.APIURL, path)

	var reqBody io.Reader
	if body != nil {
		jsonBody, err := json.Marshal(body)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal request body: %w", err)
		}
		reqBody = bytes.NewReader(jsonBody)
	}

	req, err := http.NewRequest(method, url, reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	if c.APIKey != "" {
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.APIKey))
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("API error (HTTP %d): %s", resp.StatusCode, string(respBody))
	}

	return respBody, nil
}
