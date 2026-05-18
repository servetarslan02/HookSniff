package models

type EnvironmentPatch struct {
	Name        *string `json:"name,omitempty"`
	Description *string `json:"description,omitempty"`
	IsDefault   *bool   `json:"isDefault,omitempty"`
	Color       *string `json:"color,omitempty"`
}
