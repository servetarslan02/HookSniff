-- Message cursors: track consumer position in the message stream
-- Enables cursor-based polling for clients that need at-least-once delivery semantics.

CREATE TABLE IF NOT EXISTS message_cursors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    consumer_id VARCHAR(255) NOT NULL,
    endpoint_id UUID REFERENCES endpoints(id) ON DELETE CASCADE,
    last_message_id UUID,
    last_sequence_num BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(customer_id, consumer_id)
);

CREATE INDEX idx_message_cursors_customer ON message_cursors(customer_id);
CREATE INDEX idx_message_cursors_lookup ON message_cursors(customer_id, consumer_id);
