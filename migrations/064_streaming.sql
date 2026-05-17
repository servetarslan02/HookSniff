-- Phase 15: Streaming — Real-time event streaming subscriptions and channels
-- Supports SSE and WebSocket with per-customer channels and event filtering.

-- Stream channels: named channels customers can subscribe to
CREATE TABLE IF NOT EXISTS stream_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    channel_type VARCHAR(50) NOT NULL DEFAULT 'sse',    -- sse, websocket, both
    event_filter TEXT[],                                 -- NULL = all events
    enabled BOOLEAN NOT NULL DEFAULT true,
    max_subscribers INTEGER NOT NULL DEFAULT 100,
    current_subscribers INTEGER NOT NULL DEFAULT 0,
    total_messages BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(customer_id, name)
);

-- Stream subscriptions: active subscriber connections
CREATE TABLE IF NOT EXISTS stream_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES stream_channels(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    connection_type VARCHAR(50) NOT NULL,                -- sse, websocket
    client_id VARCHAR(255),                              -- browser/session identifier
    event_filter TEXT[],
    connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_heartbeat_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    messages_sent BIGINT NOT NULL DEFAULT 0,
    metadata JSONB NOT NULL DEFAULT '{}'
);

-- Stream message log: recent messages for replay/debugging
CREATE TABLE IF NOT EXISTS stream_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES stream_channels(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    delivered_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_stream_channels_customer ON stream_channels(customer_id);
CREATE INDEX idx_stream_channels_enabled ON stream_channels(enabled) WHERE enabled = true;
CREATE INDEX idx_stream_subscriptions_channel ON stream_subscriptions(channel_id);
CREATE INDEX idx_stream_subscriptions_customer ON stream_subscriptions(customer_id);
CREATE INDEX idx_stream_subscriptions_active ON stream_subscriptions(customer_id, connected_at DESC);
CREATE INDEX idx_stream_messages_channel ON stream_messages(channel_id);
CREATE INDEX idx_stream_messages_created ON stream_messages(created_at DESC);

-- Default channels per customer (will be created via API on first use)
