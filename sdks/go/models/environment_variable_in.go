package models

type EnvironmentVariableIn struct {
	Key      string `json:"key"`
	Value    string `json:"value"`
	IsSecret *bool  `json:"isSecret,omitempty"`
}
