package hooksniff

import "fmt"

// This file provides a clean wrapper API on top of the generated types.
// It reuses existing model types and adds convenience methods.

// AuthResource manages authentication.
type AuthResource struct {
	client *Client
}

type RegisterInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	TOTPCode string `json:"totp_code,omitempty"`
}

type AuthOutputWrapper struct {
	Token   string `json:"token"`
	UserID  string `json:"user_id"`
	Email   string `json:"email"`
	Plan    string `json:"plan"`
	IsAdmin bool   `json:"is_admin"`
}

func (r *AuthResource) Register(input RegisterInput) (*AuthOutputWrapper, error) {
	body, err := r.client.doPost("/v1/auth/register", input)
	if err != nil {
		return nil, err
	}
	var result AuthOutputWrapper
	if err := jsonUnmarshal(body, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (r *AuthResource) Login(input LoginInput) (*AuthOutputWrapper, error) {
	body, err := r.client.doPost("/v1/auth/login", input)
	if err != nil {
		return nil, err
	}
	var result AuthOutputWrapper
	if err := jsonUnmarshal(body, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

// AnalyticsResource wrapper methods
type AnalyticsResource struct {
	client *Client
}

func (r *AnalyticsResource) Trends(since, until string) (map[string]interface{}, error) {
	path := "/v1/analytics/deliveries"
	if since != "" || until != "" {
		path += "?"
		if since != "" {
			path += fmt.Sprintf("since=%s", since)
		}
		if until != "" {
			if since != "" {
				path += "&"
			}
			path += fmt.Sprintf("until=%s", until)
		}
	}
	body, err := r.client.doGet(path)
	if err != nil {
		return nil, err
	}
	var result map[string]interface{}
	if err := jsonUnmarshal(body, &result); err != nil {
		return nil, err
	}
	return result, nil
}

func (r *AnalyticsResource) SuccessRate() (map[string]interface{}, error) {
	body, err := r.client.doGet("/v1/analytics/success-rate")
	if err != nil {
		return nil, err
	}
	var result map[string]interface{}
	if err := jsonUnmarshal(body, &result); err != nil {
		return nil, err
	}
	return result, nil
}

func (r *AnalyticsResource) Latency() (map[string]interface{}, error) {
	body, err := r.client.doGet("/v1/analytics/latency")
	if err != nil {
		return nil, err
	}
	var result map[string]interface{}
	if err := jsonUnmarshal(body, &result); err != nil {
		return nil, err
	}
	return result, nil
}

// APIKeysResource wrapper
type APIKeysResource struct {
	client *Client
}

type ApiKeyInfo struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	CreatedAt string `json:"created_at"`
	ExpiresAt string `json:"expires_at,omitempty"`
}

type ApiKeyCreateInputWrapper struct {
	Name      string `json:"name"`
	ExpiresAt string `json:"expires_at,omitempty"`
}

type ApiKeyCreateOutput struct {
	ID  string `json:"id"`
	Key string `json:"key"`
}

func (r *APIKeysResource) List() ([]ApiKeyInfo, error) {
	body, err := r.client.doGet("/v1/api-keys")
	if err != nil {
		return nil, err
	}
	var result []ApiKeyInfo
	if err := jsonUnmarshal(body, &result); err != nil {
		return nil, err
	}
	return result, nil
}

func (r *APIKeysResource) Create(input ApiKeyCreateInputWrapper) (*ApiKeyCreateOutput, error) {
	body, err := r.client.doPost("/v1/api-keys", input)
	if err != nil {
		return nil, err
	}
	var result ApiKeyCreateOutput
	if err := jsonUnmarshal(body, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (r *APIKeysResource) Delete(id string) error {
	return r.client.doDelete("/v1/api-keys/" + id)
}

// AlertsResource wrapper
type AlertsResource struct {
	client *Client
}

type AlertRule struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Enabled  bool   `json:"enabled"`
	Endpoint string `json:"endpoint"`
}

func (r *AlertsResource) ListRules() ([]AlertRule, error) {
	body, err := r.client.doGet("/v1/alerts/rules")
	if err != nil {
		return nil, err
	}
	var result []AlertRule
	if err := jsonUnmarshal(body, &result); err != nil {
		return nil, err
	}
	return result, nil
}

// TeamsResource wrapper
type TeamsResource struct {
	client *Client
}

type TeamMember struct {
	ID    string `json:"id"`
	Email string `json:"email"`
	Role  string `json:"role"`
}

func (r *TeamsResource) List() ([]TeamMember, error) {
	body, err := r.client.doGet("/v1/teams/members")
	if err != nil {
		return nil, err
	}
	var result []TeamMember
	if err := jsonUnmarshal(body, &result); err != nil {
		return nil, err
	}
	return result, nil
}

func (r *TeamsResource) Invite(email, role string) error {
	_, err := r.client.doPost("/v1/teams/invite", map[string]string{"email": email, "role": role})
	return err
}

func (r *TeamsResource) Remove(memberID string) error {
	return r.client.doDelete("/v1/teams/members/" + memberID)
}

// SearchResource wrapper
type SearchResource struct {
	client *Client
}

type SearchResult struct {
	ID        string `json:"id"`
	Endpoint  string `json:"endpoint"`
	Event     string `json:"event"`
	Status    string `json:"status"`
	CreatedAt string `json:"created_at"`
}

func (r *SearchResource) Query(q string, limit int) ([]SearchResult, error) {
	path := fmt.Sprintf("/v1/search?q=%s", q)
	if limit > 0 {
		path += fmt.Sprintf("&limit=%d", limit)
	}
	body, err := r.client.doGet(path)
	if err != nil {
		return nil, err
	}
	var result []SearchResult
	if err := jsonUnmarshal(body, &result); err != nil {
		return nil, err
	}
	return result, nil
}

// BillingResource wrapper
type BillingResource struct {
	client *Client
}

type SubscriptionResponse struct {
	Plan     string `json:"plan"`
	Status   string `json:"status"`
	Interval string `json:"interval"`
}

type PortalOutputWrapper struct {
	URL string `json:"url"`
}

func (r *BillingResource) GetPlan() (*SubscriptionResponse, error) {
	body, err := r.client.doGet("/v1/billing/plan")
	if err != nil {
		return nil, err
	}
	var result SubscriptionResponse
	if err := jsonUnmarshal(body, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (r *BillingResource) Upgrade(plan string) (*PortalOutputWrapper, error) {
	body, err := r.client.doPost("/v1/billing/upgrade", map[string]string{"plan": plan})
	if err != nil {
		return nil, err
	}
	var result PortalOutputWrapper
	if err := jsonUnmarshal(body, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (r *BillingResource) Portal() (*PortalOutputWrapper, error) {
	body, err := r.client.doPost("/v1/billing/portal", nil)
	if err != nil {
		return nil, err
	}
	var result PortalOutputWrapper
	if err := jsonUnmarshal(body, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

// HealthResource wrapper
type HealthResource struct {
	client *Client
}

type StatsResponse struct {
	Status    string `json:"status"`
	Uptime    int    `json:"uptime"`
	Version   string `json:"version"`
	Endpoints int    `json:"endpoints"`
}

func (r *HealthResource) Check() (*StatsResponse, error) {
	body, err := r.client.doGet("/health")
	if err != nil {
		return nil, err
	}
	var result StatsResponse
	if err := jsonUnmarshal(body, &result); err != nil {
		return nil, err
	}
	return &result, nil
}
