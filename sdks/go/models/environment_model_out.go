package models

import "time"

type EnvironmentModelOut struct {
	Id             string     `json:"id"`
	CustomerId     string     `json:"customerId"`
	Name           string     `json:"name"`
	Slug           string     `json:"slug"`
	Description    *string    `json:"description,omitempty"`
	IsDefault      bool       `json:"isDefault"`
	Color          *string    `json:"color,omitempty"`
	CreatedAt      time.Time  `json:"createdAt"`
	UpdatedAt      time.Time  `json:"updatedAt"`
	VariableCount  *int64     `json:"variableCount,omitempty"`
}
