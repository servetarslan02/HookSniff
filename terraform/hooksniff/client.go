package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// HookSniffClient is the API client for HookSniff.
type HookSniffClient struct {
	APIKey     string
	BaseURL    string
	HTTPClient *http.Client
}

func NewClient(apiKey, baseURL string) *HookSniffClient {
	return &HookSniffClient{
		APIKey:  apiKey,
		BaseURL: baseURL,
		HTTPClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (c *HookSniffClient) doRequest(method, path string, body interface{}) ([]byte, error) {
	var bodyReader io.Reader
	if body != nil {
		jsonBody, err := json.Marshal(body)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal body: %w", err)
		}
		bodyReader = bytes.NewReader(jsonBody)
	}

	req, err := http.NewRequest(method, c.BaseURL+path, bodyReader)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+c.APIKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "terraform-provider-hooksniff/0.1.0")

	resp, err := c.HTTPClient.Do(req)
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

// ─── Endpoint CRUD ───

type Endpoint struct {
	ID            string    `json:"id"`
	URL           string    `json:"url"`
	Description   string    `json:"description,omitempty"`
	IsActive      bool      `json:"is_active"`
	CreatedAt     time.Time `json:"created_at"`
	FailureStreak int       `json:"failure_streak"`
}

type CreateEndpointRequest struct {
	URL         string `json:"url"`
	Description string `json:"description,omitempty"`
}

func (c *HookSniffClient) CreateEndpoint(req CreateEndpointRequest) (*Endpoint, error) {
	body, err := c.doRequest("POST", "/endpoints", req)
	if err != nil {
		return nil, err
	}
	var ep Endpoint
	if err := json.Unmarshal(body, &ep); err != nil {
		return nil, err
	}
	return &ep, nil
}

func (c *HookSniffClient) GetEndpoint(id string) (*Endpoint, error) {
	body, err := c.doRequest("GET", "/endpoints/"+id, nil)
	if err != nil {
		return nil, err
	}
	var ep Endpoint
	if err := json.Unmarshal(body, &ep); err != nil {
		return nil, err
	}
	return &ep, nil
}

func (c *HookSniffClient) UpdateEndpoint(id string, req CreateEndpointRequest) (*Endpoint, error) {
	body, err := c.doRequest("PUT", "/endpoints/"+id, req)
	if err != nil {
		return nil, err
	}
	var ep Endpoint
	if err := json.Unmarshal(body, &ep); err != nil {
		return nil, err
	}
	return &ep, nil
}

func (c *HookSniffClient) DeleteEndpoint(id string) error {
	_, err := c.doRequest("DELETE", "/endpoints/"+id, nil)
	return err
}

func (c *HookSniffClient) ListEndpoints() ([]Endpoint, error) {
	body, err := c.doRequest("GET", "/endpoints", nil)
	if err != nil {
		return nil, err
	}
	var eps []Endpoint
	if err := json.Unmarshal(body, &eps); err != nil {
		return nil, err
	}
	return eps, nil
}

// ─── API Key CRUD ───

type APIKey struct {
	ID        string    `json:"id"`
	Name      string    `json:"name,omitempty"`
	Prefix    string    `json:"prefix"`
	Key       string    `json:"key,omitempty"` // Only on create
	CreatedAt time.Time `json:"created_at"`
	IsActive  bool      `json:"is_active"`
}

type CreateAPIKeyRequest struct {
	Name string `json:"name,omitempty"`
}

func (c *HookSniffClient) CreateAPIKey(req CreateAPIKeyRequest) (*APIKey, error) {
	body, err := c.doRequest("POST", "/api-keys", req)
	if err != nil {
		return nil, err
	}
	var key APIKey
	if err := json.Unmarshal(body, &key); err != nil {
		return nil, err
	}
	return &key, nil
}

func (c *HookSniffClient) DeleteAPIKey(id string) error {
	_, err := c.doRequest("DELETE", "/api-keys/"+id, nil)
	return err
}

// ─── Schema CRUD ───

type Schema struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Schema    string    `json:"schema"`
	Version   string    `json:"version"`
	CreatedAt time.Time `json:"created_at"`
}

type CreateSchemaRequest struct {
	Name   string `json:"name"`
	Schema string `json:"schema"`
}

func (c *HookSniffClient) CreateSchema(req CreateSchemaRequest) (*Schema, error) {
	body, err := c.doRequest("POST", "/schemas", req)
	if err != nil {
		return nil, err
	}
	var s Schema
	if err := json.Unmarshal(body, &s); err != nil {
		return nil, err
	}
	return &s, nil
}

func (c *HookSniffClient) DeleteSchema(id string) error {
	_, err := c.doRequest("DELETE", "/schemas/"+id, nil)
	return err
}

// ─── Event Type CRUD ───

type EventType struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
}

type CreateEventTypeRequest struct {
	Name        string `json:"name"`
	Description string `json:"description,omitempty"`
}

func (c *HookSniffClient) CreateEventType(req CreateEventTypeRequest) (*EventType, error) {
	body, err := c.doRequest("POST", "/event-types", req)
	if err != nil {
		return nil, err
	}
	var et EventType
	if err := json.Unmarshal(body, &et); err != nil {
		return nil, err
	}
	return &et, nil
}

func (c *HookSniffClient) DeleteEventType(id string) error {
	_, err := c.doRequest("DELETE", "/event-types/"+id, nil)
	return err
}
