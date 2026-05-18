package hooksniff

import (
	"context"
	"github.com/servetarslan02/hooksniff-go/internal"
	"github.com/servetarslan02/hooksniff-go/models"
)

type OperationalWebhook struct{ client *internal.HookSniffHttpClient }

func newOperationalWebhook(client *internal.HookSniffHttpClient) *OperationalWebhook {
	return &OperationalWebhook{client: client}
}

func (o *OperationalWebhook) List(ctx context.Context) ([]models.OperationalWebhookEndpointOut, error) {
	var r []models.OperationalWebhookEndpointOut
	err := o.client.Get(ctx, "/api/v1/operational-webhooks", nil, &r)
	return r, err
}

func (o *OperationalWebhook) Create(ctx context.Context, body *models.OperationalWebhookEndpointIn) (*models.OperationalWebhookEndpointOut, error) {
	var r models.OperationalWebhookEndpointOut
	err := o.client.Post(ctx, "/api/v1/operational-webhooks", nil, body, &r)
	return &r, err
}

func (o *OperationalWebhook) Get(ctx context.Context, id string) (*models.OperationalWebhookEndpointOut, error) {
	var r models.OperationalWebhookEndpointOut
	err := o.client.Get(ctx, "/api/v1/operational-webhooks/"+id, nil, &r)
	return &r, err
}

func (o *OperationalWebhook) Update(ctx context.Context, id string, body *models.OperationalWebhookEndpointIn) (*models.OperationalWebhookEndpointOut, error) {
	var r models.OperationalWebhookEndpointOut
	err := o.client.Put(ctx, "/api/v1/operational-webhooks/"+id, nil, body, &r)
	return &r, err
}

func (o *OperationalWebhook) Delete(ctx context.Context, id string) error {
	return o.client.Delete(ctx, "/api/v1/operational-webhooks/"+id, nil)
}

func (o *OperationalWebhook) ListDeliveries(ctx context.Context, id string) ([]models.OperationalWebhookDeliveryOut, error) {
	var r []models.OperationalWebhookDeliveryOut
	err := o.client.Get(ctx, "/api/v1/operational-webhooks/"+id+"/deliveries", nil, &r)
	return r, err
}
