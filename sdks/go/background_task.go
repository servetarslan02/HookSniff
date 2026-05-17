package hooksniff

import (
	"context"

	"github.com/servetarslan02/hooksniff-go/internal"
	"github.com/servetarslan02/hooksniff-go/models"
)

type BackgroundTask struct {
	client *internal.HookSniffHttpClient
}

func newBackgroundTask(client *internal.HookSniffHttpClient) *BackgroundTask {
	return &BackgroundTask{
		client: client,
	}
}

func (b *BackgroundTask) List(ctx context.Context) ([]models.BackgroundTaskOut, error) {
	var result []models.BackgroundTaskOut
	err := b.client.Get(ctx, "/api/v1/background-tasks", nil, &result)
	return result, err
}

func (b *BackgroundTask) Get(ctx context.Context, taskId string) (*models.BackgroundTaskOut, error) {
	var result models.BackgroundTaskOut
	err := b.client.Get(ctx, "/api/v1/background-tasks/"+taskId, nil, &result)
	return &result, err
}

func (b *BackgroundTask) Cancel(ctx context.Context, taskId string) (*models.BackgroundTaskOut, error) {
	var result models.BackgroundTaskOut
	err := b.client.Put(ctx, "/api/v1/background-tasks/"+taskId, nil, nil, &result)
	return &result, err
}
