package models

type EnvironmentVariableBulkUpsertIn struct {
	Variables []EnvironmentVariableIn `json:"variables"`
}
