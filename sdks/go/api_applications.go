/*
HookSniff API: Applications

Manage applications — create, list, update, delete.
*/

package hooksniff

import (
	"context"
	"fmt"
	"net/http"
)

// Application represents an application in HookSniff.
type Application struct {
	Id            string  `json:"id"`
	CustomerId    string  `json:"customer_id"`
	Name          string  `json:"name"`
	Description   *string `json:"description,omitempty"`
	IsActive      bool    `json:"is_active"`
	EndpointCount int     `json:"endpoint_count"`
	CreatedAt     string  `json:"created_at"`
	UpdatedAt     string  `json:"updated_at"`
}

// ApplicationCreateInput represents the input for creating an application.
type ApplicationCreateInput struct {
	Name        string  `json:"name"`
	Description *string `json:"description,omitempty"`
}

// ApplicationUpdateInput represents the input for updating an application.
type ApplicationUpdateInput struct {
	Name        *string `json:"name,omitempty"`
	Description *string `json:"description,omitempty"`
	IsActive    *bool   `json:"is_active,omitempty"`
}

// ListApplications returns all applications.
func (c *Client) ListApplications(ctx context.Context) ([]Application, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.BaseURL+"/v1/applications", nil)
	if err != nil {
		return nil, err
	}
	var result []Application
	if err := c.do(req, &result); err != nil {
		return nil, err
	}
	return result, nil
}

// GetApplication returns a single application by ID.
func (c *Client) GetApplication(ctx context.Context, id string) (*Application, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.BaseURL+"/v1/applications/"+id, nil)
	if err != nil {
		return nil, err
	}
	var result Application
	if err := c.do(req, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

// CreateApplication creates a new application.
func (c *Client) CreateApplication(ctx context.Context, input ApplicationCreateInput) (*Application, error) {
	req, err := c.newJSONRequest(ctx, http.MethodPost, "/v1/applications", input)
	if err != nil {
		return nil, err
	}
	var result Application
	if err := c.do(req, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

// UpdateApplication updates an application.
func (c *Client) UpdateApplication(ctx context.Context, id string, input ApplicationUpdateInput) (*Application, error) {
	req, err := c.newJSONRequest(ctx, http.MethodPut, fmt.Sprintf("/v1/applications/%s", id), input)
	if err != nil {
		return nil, err
	}
	var result Application
	if err := c.do(req, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

// DeleteApplication deletes an application.
func (c *Client) DeleteApplication(ctx context.Context, id string) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, c.BaseURL+"/v1/applications/"+id, nil)
	if err != nil {
		return err
	}
	return c.do(req, nil)
}
