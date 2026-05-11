package hooksniff

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
			path += "since=" + since
		}
		if until != "" {
			if since != "" {
				path += "&"
			}
			path += "until=" + until
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

// APIKeysResource wrapper
type APIKeysResource struct {
	client *Client
}

type ApiKeyCreateInputWrapper struct {
	Name      string `json:"name"`
	ExpiresAt string `json:"expires_at,omitempty"`
}

func (r *APIKeysResource) ListRaw() ([]byte, error) {
	return r.client.doGet("/v1/api-keys")
}

func (r *APIKeysResource) CreateRaw(input ApiKeyCreateInputWrapper) ([]byte, error) {
	return r.client.doPost("/v1/api-keys", input)
}

func (r *APIKeysResource) Delete(id string) error {
	return r.client.doDelete("/v1/api-keys/" + id)
}

// AlertsResource wrapper
type AlertsResource struct {
	client *Client
}

func (r *AlertsResource) ListRulesRaw() ([]byte, error) {
	return r.client.doGet("/v1/alerts/rules")
}

// TeamsResource wrapper
type TeamsResource struct {
	client *Client
}

func (r *TeamsResource) ListRaw() ([]byte, error) {
	return r.client.doGet("/v1/teams/members")
}

// SearchResource wrapper
type SearchResource struct {
	client *Client
}

func (r *SearchResource) QueryRaw(q string) ([]byte, error) {
	return r.client.doGet("/v1/search?q=" + q)
}

// BillingResource wrapper
type BillingResource struct {
	client *Client
}

type PortalOutputWrapper struct {
	URL string `json:"url"`
}

func (r *BillingResource) GetPlanRaw() ([]byte, error) {
	return r.client.doGet("/v1/billing/plan")
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

func (r *HealthResource) CheckRaw() ([]byte, error) {
	return r.client.doGet("/health")
}
