package models

import "time"

type EnvironmentVariableOut struct {
	Id            string    `json:"id"`
	EnvironmentId string    `json:"environmentId"`
	Key           string    `json:"key"`
	Value         string    `json:"value"`
	IsSecret      bool      `json:"isSecret"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}
