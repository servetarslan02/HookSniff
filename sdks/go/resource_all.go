package hooksniff

import (
	"fmt"
	"net/url"
)

// This file provides a clean wrapper API on top of the generated types.
// It reuses existing model types from model_*.go files.

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
	params := url.Values{}
	if since != "" {
		params.Set("since", since)
	}
	if until != "" {
		params.Set("until", until)
	}
	path := "/v1/analytics/deliveries"
	if len(params) > 0 {
		path += "?" + params.Encode()
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

// APIKeysResource wrapper — uses generated ApiKeyInfo from model_api_key_info.go
type APIKeysResource struct {
	client *Client
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

// AlertsResource wrapper — uses generated AlertRule from model_alert_rule.go
type AlertsResource struct {
	client *Client
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

// TeamsResource wrapper — uses generated TeamMember from model_team_member.go
type TeamsResource struct {
	client *Client
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

// SearchResource wrapper — uses generated SearchResult from model_search_result.go
type SearchResource struct {
	client *Client
}

func (r *SearchResource) Query(q string, limit int) (SearchResult, error) {
	params := url.Values{}
	params.Set("q", q)
	if limit > 0 {
		params.Set("limit", fmt.Sprintf("%d", limit))
	}
	path := "/v1/search?" + params.Encode()
	body, err := r.client.doGet(path)
	if err != nil {
		return SearchResult{}, err
	}
	var result SearchResult
	if err := jsonUnmarshal(body, &result); err != nil {
		return SearchResult{}, err
	}
	return result, nil
}

// BillingResource wrapper — uses generated SubscriptionResponse from model_subscription_response.go
type BillingResource struct {
	client *Client
}

type PortalOutputWrapper struct {
	URL string `json:"url"`
}

func (r *BillingResource) GetPlan() (SubscriptionResponse, error) {
	body, err := r.client.doGet("/v1/billing/plan")
	if err != nil {
		return SubscriptionResponse{}, err
	}
	var result SubscriptionResponse
	if err := jsonUnmarshal(body, &result); err != nil {
		return SubscriptionResponse{}, err
	}
	return result, nil
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

// HealthResource wrapper — uses generated StatsResponse from model_stats_response.go
type HealthResource struct {
	client *Client
}

func (r *HealthResource) Check() (StatsResponse, error) {
	body, err := r.client.doGet("/health")
	if err != nil {
		return StatsResponse{}, err
	}
	var result StatsResponse
	if err := jsonUnmarshal(body, &result); err != nil {
		return StatsResponse{}, err
	}
	return result, nil
}
