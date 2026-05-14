/*
HookSniff API: Service Tokens

Manage service tokens for API access — create, list, update, delete, reveal.
*/

package hooksniff

import (
	"context"
	"fmt"
	"net/http"
)

// ServiceToken represents a service token in HookSniff.
type ServiceToken struct {
	Id          string  `json:"id"`
	Name        *string `json:"name,omitempty"`
	TokenPrefix string  `json:"token_prefix"`
	CreatedAt   string  `json:"created_at"`
	LastUsedAt  *string `json:"last_used_at,omitempty"`
	IsActive    bool    `json:"is_active"`
}

// ServiceTokenCreateResponse is the response when creating a service token.
type ServiceTokenCreateResponse struct {
	Id          string  `json:"id"`
	Name        *string `json:"name,omitempty"`
	Token       string  `json:"token"`
	TokenPrefix string  `json:"token_prefix"`
	Message     string  `json:"message"`
}

// ListServiceTokens returns all service tokens.
func (c *Client) ListServiceTokens(ctx context.Context) ([]ServiceToken, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.BaseURL+"/v1/service-tokens", nil)
	if err != nil {
		return nil, err
	}
	var result []ServiceToken
	if err := c.do(req, &result); err != nil {
		return nil, err
	}
	return result, nil
}

// CreateServiceToken creates a new service token (full token shown only once).
func (c *Client) CreateServiceToken(ctx context.Context, name string) (*ServiceTokenCreateResponse, error) {
	req, err := c.newJSONRequest(ctx, http.MethodPost, "/v1/service-tokens", map[string]string{"name": name})
	if err != nil {
		return nil, err
	}
	var result ServiceTokenCreateResponse
	if err := c.do(req, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

// UpdateServiceToken updates a service token (e.g. rename).
func (c *Client) UpdateServiceToken(ctx context.Context, id string, name string) (*ServiceToken, error) {
	req, err := c.newJSONRequest(ctx, http.MethodPut, fmt.Sprintf("/v1/service-tokens/%s", id), map[string]string{"name": name})
	if err != nil {
		return nil, err
	}
	var result ServiceToken
	if err := c.do(req, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

// DeleteServiceToken deletes a service token.
func (c *Client) DeleteServiceToken(ctx context.Context, id string) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, c.BaseURL+"/v1/service-tokens/"+id, nil)
	if err != nil {
		return err
	}
	return c.do(req, nil)
}

// RevealServiceToken reveals the full token value.
func (c *Client) RevealServiceToken(ctx context.Context, id string) (string, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.BaseURL+"/v1/service-tokens/"+id+"/reveal", nil)
	if err != nil {
		return "", err
	}
	var result struct {
		Token   *string `json:"token,omitempty"`
		Message string  `json:"message"`
	}
	if err := c.do(req, &result); err != nil {
		return "", err
	}
	if result.Token != nil {
		return *result.Token, nil
	}
	return "", fmt.Errorf("token not available: %s", result.Message)
}
