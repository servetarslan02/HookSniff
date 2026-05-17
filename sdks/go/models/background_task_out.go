package models

import "time"

type BackgroundTaskOut struct {
	Id         string                 `json:"id"`
	CustomerId string                 `json:"customerId"`
	TaskType   string                 `json:"taskType"`
	Status     string                 `json:"status"`
	Data       map[string]interface{} `json:"data,omitempty"`
	Result     map[string]interface{} `json:"result,omitempty"`
	Error      *string                `json:"error,omitempty"`
	Progress   int16                  `json:"progress"`
	CreatedAt  time.Time              `json:"createdAt"`
	StartedAt  *time.Time             `json:"startedAt,omitempty"`
	FinishedAt *time.Time             `json:"finishedAt,omitempty"`
}
