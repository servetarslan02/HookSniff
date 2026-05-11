package hooksniff

// EndpointsResource manages webhook endpoints.
type EndpointsResource struct {
	client *Client
}

type EndpointCreateInput struct {
	URL         string `json:"url"`
	Description string `json:"description,omitempty"`
	RateLimit   int    `json:"rate_limit,omitempty"`
	Active      *bool  `json:"active,omitempty"`
}

type EndpointUpdateInput struct {
	URL         string `json:"url,omitempty"`
	Description string `json:"description,omitempty"`
	RateLimit   int    `json:"rate_limit,omitempty"`
	Active      *bool  `json:"active,omitempty"`
}

type EndpointOutput struct {
	ID          string `json:"id"`
	URL         string `json:"url"`
	Description string `json:"description"`
	RateLimit   int    `json:"rate_limit"`
	Active      bool   `json:"active"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}

type EndpointSecretOutput struct {
	Key string `json:"key"`
}

func (r *EndpointsResource) List() ([]EndpointOutput, error) {
	body, err := r.client.doGet("/v1/endpoints")
	if err != nil {
		return nil, err
	}
	var result []EndpointOutput
	if err := jsonUnmarshal(body, &result); err != nil {
		return nil, err
	}
	return result, nil
}

func (r *EndpointsResource) Create(input EndpointCreateInput) (*EndpointOutput, error) {
	body, err := r.client.doPost("/v1/endpoints", input)
	if err != nil {
		return nil, err
	}
	var result EndpointOutput
	if err := jsonUnmarshal(body, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (r *EndpointsResource) Get(id string) (*EndpointOutput, error) {
	body, err := r.client.doGet("/v1/endpoints/" + id)
	if err != nil {
		return nil, err
	}
	var result EndpointOutput
	if err := jsonUnmarshal(body, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (r *EndpointsResource) Update(id string, input EndpointUpdateInput) (*EndpointOutput, error) {
	body, err := r.client.doPut("/v1/endpoints/"+id, input)
	if err != nil {
		return nil, err
	}
	var result EndpointOutput
	if err := jsonUnmarshal(body, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (r *EndpointsResource) Delete(id string) error {
	return r.client.doDelete("/v1/endpoints/" + id)
}

func (r *EndpointsResource) RotateSecret(id string) (*EndpointSecretOutput, error) {
	body, err := r.client.doPost("/v1/endpoints/"+id+"/rotate-secret", nil)
	if err != nil {
		return nil, err
	}
	var result EndpointSecretOutput
	if err := jsonUnmarshal(body, &result); err != nil {
		return nil, err
	}
	return &result, nil
}
