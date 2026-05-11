package hooksniff

import (
	"fmt"
	"net/url"
)

// WebhooksResource manages webhook deliveries.
type WebhooksResource struct {
	client *Client
}

type WebhookSendInput struct {
	EndpointID string                 `json:"endpoint_id"`
	Event      string                 `json:"event"`
	Data       map[string]interface{} `json:"data"`
}

type WebhookBatchInput struct {
	EndpointID string                   `json:"endpoint_id"`
	Events     []WebhookBatchEventInput `json:"events"`
}

type WebhookBatchEventInput struct {
	Event string                 `json:"event"`
	Data  map[string]interface{} `json:"data"`
}

type DeliveryOutput struct {
	ID           string `json:"id"`
	EndpointID   string `json:"endpoint_id"`
	Event        string `json:"event"`
	Status       string `json:"status"`
	ResponseCode int    `json:"response_code"`
	ResponseBody string `json:"response_body"`
	CreatedAt    string `json:"created_at"`
	DeliveredAt  string `json:"delivered_at"`
	AttemptCount int    `json:"attempt_count"`
}

type DeliveryListOutput struct {
	Data    []DeliveryOutput `json:"data"`
	HasMore bool             `json:"has_more"`
}

type BatchOutput struct {
	BatchID string `json:"batch_id"`
	Count   int    `json:"count"`
}

func (r *WebhooksResource) Send(input WebhookSendInput) (*DeliveryOutput, error) {
	body, err := r.client.doPost("/v1/webhooks", input)
	if err != nil {
		return nil, err
	}
	var result DeliveryOutput
	if err := jsonUnmarshal(body, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (r *WebhooksResource) Batch(input WebhookBatchInput) (*BatchOutput, error) {
	body, err := r.client.doPost("/v1/webhooks/batch", input)
	if err != nil {
		return nil, err
	}
	var result BatchOutput
	if err := jsonUnmarshal(body, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (r *WebhooksResource) List(limit, offset int) (*DeliveryListOutput, error) {
	params := url.Values{}
	if limit > 0 {
		params.Set("limit", fmt.Sprintf("%d", limit))
	}
	if offset > 0 {
		params.Set("offset", fmt.Sprintf("%d", offset))
	}
	path := "/v1/webhooks"
	if len(params) > 0 {
		path += "?" + params.Encode()
	}
	body, err := r.client.doGet(path)
	if err != nil {
		return nil, err
	}
	var result DeliveryListOutput
	if err := jsonUnmarshal(body, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (r *WebhooksResource) Get(id string) (*DeliveryOutput, error) {
	body, err := r.client.doGet("/v1/webhooks/" + id)
	if err != nil {
		return nil, err
	}
	var result DeliveryOutput
	if err := jsonUnmarshal(body, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (r *WebhooksResource) Replay(id string) (*DeliveryOutput, error) {
	body, err := r.client.doPost("/v1/webhooks/"+id+"/replay", nil)
	if err != nil {
		return nil, err
	}
	var result DeliveryOutput
	if err := jsonUnmarshal(body, &result); err != nil {
		return nil, err
	}
	return &result, nil
}
