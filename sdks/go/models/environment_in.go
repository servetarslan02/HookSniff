package models

type EnvironmentIn struct {
	Name        string  `json:"name"`
	Slug        *string `json:"slug,omitempty"`
	Description *string `json:"description,omitempty"`
	IsDefault   *bool   `json:"isDefault,omitempty"`
	Color       *string `json:"color,omitempty"`
}
