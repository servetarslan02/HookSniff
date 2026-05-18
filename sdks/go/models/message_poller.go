package models

type PolledMessage struct {
	Id             string                 `json:"id"`
	EndpointId     string                 `json:"endpoint_id"`
	EventType      *string                `json:"event_type,omitempty"`
	Status         string                 `json:"status"`
	AttemptCount   int                    `json:"attempt_count"`
	ResponseStatus *int                   `json:"response_status,omitempty"`
	CreatedAt      string                 `json:"created_at"`
	Payload        map[string]interface{} `json:"payload,omitempty"`
}

type MessagePollerCursor struct {
	ConsumerId      string  `json:"consumer_id"`
	LastMessageId   *string `json:"last_message_id,omitempty"`
	LastSequenceNum int64   `json:"last_sequence_num"`
}

type MessagePollerPollResponse struct {
	Messages []PolledMessage     `json:"messages"`
	Cursor   MessagePollerCursor `json:"cursor"`
	Done     bool                `json:"done"`
}

type MessagePollerCursorResponse struct {
	Cursor MessagePollerCursor `json:"cursor"`
}

type MessagePollerCommitResponse struct {
	Cursor    MessagePollerCursor `json:"cursor"`
	Committed bool                `json:"committed"`
}
