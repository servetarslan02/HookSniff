package hooksniff

import (
	"context"
	"net/http"

	"github.com/servetarslan02/hooksniff-go/internal"
)

type StreamApi struct{ client *internal.HookSniffHttpClient }

func newStreamApi(client *internal.HookSniffHttpClient) *StreamApi {
	return &StreamApi{client: client}
}

func (s *StreamApi) ListChannels(ctx context.Context) ([]StreamChannel, error) {
	var r []StreamChannel
	err := s.client.Get(ctx, "/api/v1/stream/channels", nil, &r)
	return r, err
}

func (s *StreamApi) GetChannel(ctx context.Context, id string) (*StreamChannelDetail, error) {
	var r StreamChannelDetail
	err := s.client.Get(ctx, "/api/v1/stream/channels/"+id, nil, &r)
	return &r, err
}

func (s *StreamApi) CreateChannel(ctx context.Context, body StreamChannelIn) (*StreamChannel, error) {
	var r StreamChannel
	err := s.client.Post(ctx, "/api/v1/stream/channels", body, &r)
	return &r, err
}

func (s *StreamApi) UpdateChannel(ctx context.Context, id string, body StreamChannelUpdate) (*StreamChannel, error) {
	var r StreamChannel
	err := s.client.Do(ctx, http.MethodPut, "/api/v1/stream/channels/"+id, body, &r)
	return &r, err
}

func (s *StreamApi) DeleteChannel(ctx context.Context, id string) error {
	return s.client.Do(ctx, http.MethodDelete, "/api/v1/stream/channels/"+id, nil, nil)
}

func (s *StreamApi) ListMessages(ctx context.Context, id string, params map[string]string) ([]StreamMessage, error) {
	var r []StreamMessage
	err := s.client.Get(ctx, "/api/v1/stream/channels/"+id+"/messages", params, &r)
	return r, err
}

func (s *StreamApi) ListSubscriptions(ctx context.Context) ([]StreamSubscription, error) {
	var r []StreamSubscription
	err := s.client.Get(ctx, "/api/v1/stream/subscriptions", nil, &r)
	return r, err
}

func (s *StreamApi) DisconnectSubscription(ctx context.Context, id string) error {
	return s.client.Do(ctx, http.MethodDelete, "/api/v1/stream/subscriptions/"+id, nil, nil)
}

func (s *StreamApi) Publish(ctx context.Context, body PublishEventIn) (*PublishEventResponse, error) {
	var r PublishEventResponse
	err := s.client.Post(ctx, "/api/v1/stream/publish", body, &r)
	return &r, err
}

type StreamChannel struct {
	Id                 string   `json:"id"`
	CustomerId         string   `json:"customer_id"`
	Name               string   `json:"name"`
	Description        *string  `json:"description,omitempty"`
	ChannelType        string   `json:"channel_type"`
	EventFilter        []string `json:"event_filter,omitempty"`
	Enabled            bool     `json:"enabled"`
	MaxSubscribers     int      `json:"max_subscribers"`
	CurrentSubscribers int      `json:"current_subscribers"`
	TotalMessages      int64    `json:"total_messages"`
	CreatedAt          string   `json:"created_at"`
	UpdatedAt          string   `json:"updated_at"`
}

type StreamChannelDetail struct {
	StreamChannel
	RecentMessages []StreamMessage `json:"recent_messages"`
}

type StreamMessage struct {
	Id             string                 `json:"id"`
	ChannelId      string                 `json:"channel_id"`
	EventType      string                 `json:"event_type"`
	Payload        map[string]interface{} `json:"payload"`
	DeliveredCount int                    `json:"delivered_count"`
	CreatedAt      string                 `json:"created_at"`
}

type StreamSubscription struct {
	Id              string                 `json:"id"`
	ChannelId       string                 `json:"channel_id"`
	CustomerId      string                 `json:"customer_id"`
	ConnectionType  string                 `json:"connection_type"`
	ClientId        *string                `json:"client_id,omitempty"`
	EventFilter     []string               `json:"event_filter,omitempty"`
	ConnectedAt     string                 `json:"connected_at"`
	LastHeartbeatAt string                 `json:"last_heartbeat_at"`
	MessagesSent    int64                  `json:"messages_sent"`
	Metadata        map[string]interface{} `json:"metadata"`
}

type StreamChannelIn struct {
	Name           string   `json:"name"`
	Description    *string  `json:"description,omitempty"`
	ChannelType    *string  `json:"channel_type,omitempty"`
	EventFilter    []string `json:"event_filter,omitempty"`
	MaxSubscribers *int     `json:"max_subscribers,omitempty"`
	Enabled        *bool    `json:"enabled,omitempty"`
}

type StreamChannelUpdate struct {
	Name           *string  `json:"name,omitempty"`
	Description    *string  `json:"description,omitempty"`
	EventFilter    []string `json:"event_filter,omitempty"`
	MaxSubscribers *int     `json:"max_subscribers,omitempty"`
	Enabled        *bool    `json:"enabled,omitempty"`
}

type PublishEventIn struct {
	ChannelId string                 `json:"channel_id"`
	EventType string                 `json:"event_type"`
	Payload   map[string]interface{} `json:"payload"`
}

type PublishEventResponse struct {
	Success     bool   `json:"success"`
	MessageId   string `json:"message_id"`
	DeliveredTo int    `json:"delivered_to"`
}
