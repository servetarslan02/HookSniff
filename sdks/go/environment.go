package hooksniff

import (
	"context"

	"github.com/servetarslan02/hooksniff-go/internal"
	"github.com/servetarslan02/hooksniff-go/models"
)

type Environment struct {
	client *internal.HookSniffHttpClient
}

func newEnvironment(client *internal.HookSniffHttpClient) *Environment {
	return &Environment{
		client: client,
	}
}

// List all environments for the authenticated customer.
func (e *Environment) List(ctx context.Context) ([]models.EnvironmentModelOut, error) {
	var result []models.EnvironmentModelOut
	err := e.client.Get(ctx, "/api/v1/environments", nil, &result)
	return result, err
}

// Create a new environment.
func (e *Environment) Create(ctx context.Context, environmentIn *models.EnvironmentIn) (*models.EnvironmentModelOut, error) {
	var result models.EnvironmentModelOut
	err := e.client.Post(ctx, "/api/v1/environments", nil, environmentIn, &result)
	return &result, err
}

// Get an environment by ID.
func (e *Environment) Get(ctx context.Context, environmentId string) (*models.EnvironmentModelOut, error) {
	var result models.EnvironmentModelOut
	err := e.client.Get(ctx, "/api/v1/environments/"+environmentId, nil, &result)
	return &result, err
}

// Update an environment.
func (e *Environment) Update(ctx context.Context, environmentId string, patch *models.EnvironmentPatch) (*models.EnvironmentModelOut, error) {
	var result models.EnvironmentModelOut
	err := e.client.Put(ctx, "/api/v1/environments/"+environmentId, nil, patch, &result)
	return &result, err
}

// Delete an environment.
func (e *Environment) Delete(ctx context.Context, environmentId string) error {
	return e.client.Delete(ctx, "/api/v1/environments/"+environmentId, nil)
}

// ListVariables lists all variables in an environment.
func (e *Environment) ListVariables(ctx context.Context, environmentId string) ([]models.EnvironmentVariableOut, error) {
	var result []models.EnvironmentVariableOut
	err := e.client.Get(ctx, "/api/v1/environments/"+environmentId+"/variables", nil, &result)
	return result, err
}

// GetVariable gets a single variable.
func (e *Environment) GetVariable(ctx context.Context, environmentId string, variableId string) (*models.EnvironmentVariableOut, error) {
	var result models.EnvironmentVariableOut
	err := e.client.Get(ctx, "/api/v1/environments/"+environmentId+"/variables/"+variableId, nil, &result)
	return &result, err
}

// CreateVariable creates a variable in an environment.
func (e *Environment) CreateVariable(ctx context.Context, environmentId string, variableIn *models.EnvironmentVariableIn) (*models.EnvironmentVariableOut, error) {
	var result models.EnvironmentVariableOut
	err := e.client.Post(ctx, "/api/v1/environments/"+environmentId+"/variables", nil, variableIn, &result)
	return &result, err
}

// UpdateVariable updates a variable.
func (e *Environment) UpdateVariable(ctx context.Context, environmentId string, variableId string, variableIn *models.EnvironmentVariableIn) (*models.EnvironmentVariableOut, error) {
	var result models.EnvironmentVariableOut
	err := e.client.Put(ctx, "/api/v1/environments/"+environmentId+"/variables/"+variableId, nil, variableIn, &result)
	return &result, err
}

// DeleteVariable deletes a variable.
func (e *Environment) DeleteVariable(ctx context.Context, environmentId string, variableId string) error {
	return e.client.Delete(ctx, "/api/v1/environments/"+environmentId+"/variables/"+variableId, nil)
}

// BulkUpsertVariables bulk upserts variables (create or update multiple at once).
func (e *Environment) BulkUpsertVariables(ctx context.Context, environmentId string, bulkIn *models.EnvironmentVariableBulkUpsertIn) ([]models.EnvironmentVariableOut, error) {
	var result []models.EnvironmentVariableOut
	err := e.client.Post(ctx, "/api/v1/environments/"+environmentId+"/variables/bulk", nil, bulkIn, &result)
	return result, err
}
