package hooksniff

import (
	"context"
	"fmt"
	"net/url"

	"github.com/servetarslan02/hooksniff-go/internal"
	"github.com/servetarslan02/hooksniff-go/models"
)

type MessagePoller struct{ client *internal.HookSniffHttpClient }

func newMessagePoller(client *internal.HookSniffHttpClient) *MessagePoller {
	return &MessagePoller{client: client}
}

// Poll fetches new messages since the consumer's cursor.
func (m *MessagePoller) Poll(ctx context.Context, consumerId string, opts *PollOptions) (*models.MessagePollerPollResponse, error) {
	params := url.Values{}
	params.Set("consumer_id", consumerId)
	if opts != nil {
		if opts.Limit > 0 {
			params.Set("limit", fmt.Sprintf("%d", opts.Limit))
		}
		if opts.EndpointId != "" {
			params.Set("endpoint_id", opts.EndpointId)
		}
		if opts.EventType != "" {
			params.Set("event_type", opts.EventType)
		}
		if !opts.IncludePayload {
			params.Set("include_payload", "false")
		}
	}
	var r models.MessagePollerPollResponse
	err := m.client.Get(ctx, "/api/v1/message-poller/poll?"+params.Encode(), nil, &r)
	return &r, err
}

// Seek sets the consumer's cursor to a specific message.
func (m *MessagePoller) Seek(ctx context.Context, consumerId string, messageId string, opts *SeekOptions) (*models.MessagePollerCursorResponse, error) {
	body := map[string]interface{}{
		"consumer_id": consumerId,
		"message_id":  messageId,
	}
	if opts != nil && opts.EndpointId != "" {
		body["endpoint_id"] = opts.EndpointId
	}
	var r models.MessagePollerCursorResponse
	err := m.client.Post(ctx, "/api/v1/message-poller/seek", body, &r)
	return &r, err
}

// Commit advances the cursor past a processed message.
func (m *MessagePoller) Commit(ctx context.Context, consumerId string, messageId string, opts *CommitOptions) (*models.MessagePollerCommitResponse, error) {
	body := map[string]interface{}{
		"consumer_id": consumerId,
		"message_id":  messageId,
	}
	if opts != nil && opts.EndpointId != "" {
		body["endpoint_id"] = opts.EndpointId
	}
	var r models.MessagePollerCommitResponse
	err := m.client.Post(ctx, "/api/v1/message-poller/commit", body, &r)
	return &r, err
}

type PollOptions struct {
	Limit          int
	EndpointId     string
	EventType      string
	IncludePayload bool
}

type SeekOptions struct {
	EndpointId string
}

type CommitOptions struct {
	EndpointId string
}
