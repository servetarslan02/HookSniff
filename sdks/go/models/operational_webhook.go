package models

import "time"

type OperationalWebhookEndpointOut struct {
	Id          string    `json:"id"`
	CustomerId  string    `json:"customerId"`
	Url         string    `json:"url"`
	Description *string   `json:"description,omitempty"`
	IsActive    bool      `json:"isActive"`
	EventTypes  []string  `json:"eventTypes,omitempty"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type OperationalWebhookEndpointIn struct {
	Url         string   `json:"url"`
	Description *string  `json:"description,omitempty"`
	IsActive    *bool    `json:"isActive,omitempty"`
	EventTypes  []string `json:"eventTypes,omitempty"`
}

type OperationalWebhookDeliveryOut struct {
	Id             string                 `json:"id"`
	EndpointId     string                 `json:"endpointId"`
	EventType      string                 `json:"eventType"`
	Payload        map[string]interface{} `json:"payload"`
	ResponseStatus *int16                 `json:"responseStatus,omitempty"`
	AttemptCount   int16                  `json:"attemptCount"`
	Status         string                 `json:"status"`
	CreatedAt      time.Time              `json:"createdAt"`
	DeliveredAt    *time.Time             `json:"deliveredAt,omitempty"`
}
