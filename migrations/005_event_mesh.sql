-- 005_event_mesh.sql
-- Phase 4: Event Mesh — Multi-format Event Infrastructure
-- Extends HookSniff from webhook-only to a full event mesh with
-- multi-protocol delivery, schema registry, fan-out rules, and
-- WebSocket real-time streaming.

-- ============================================================================
-- Event Schema Registry
-- Stores JSON schemas for event types. Supports versioning and
-- backward-compatible evolution.
-- ============================================================================
CREATE TABLE IF NOT EXISTS event_schemas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name STRING NOT NULL,
    version INT DEFAULT 1,
    schema JSONB NOT NULL,
    customer_id UUID REFERENCES customers(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup by customer + name
CREATE INDEX IF NOT EXISTS idx_event_schemas_customer_name
    ON event_schemas (customer_id, name);

-- Unique constraint: one schema name per version per customer
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_schemas_unique_version
    ON event_schemas (customer_id, name, version);

-- ============================================================================
-- Delivery Targets
-- Each endpoint can have multiple delivery targets (HTTP, WebSocket, gRPC,
-- SQS, Kafka, Email). The delivery router selects the right protocol based
-- on the target_type and config.
-- ============================================================================
CREATE TABLE IF NOT EXISTS delivery_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint_id UUID REFERENCES endpoints(id) ON DELETE CASCADE,
    target_type STRING NOT NULL, -- 'http', 'ws', 'grpc', 'sqs', 'kafka', 'email'
    config JSONB NOT NULL,
    enabled BOOL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup by endpoint
CREATE INDEX IF NOT EXISTS idx_delivery_targets_endpoint
    ON delivery_targets (endpoint_id);

-- ============================================================================
-- Fan-out Rules
-- Routes a single event to multiple destinations. Supports pattern matching
-- on event type and conditional routing based on payload fields.
-- ============================================================================
CREATE TABLE IF NOT EXISTS fanout_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    event_pattern STRING NOT NULL,       -- glob pattern: 'order.*', 'payment.completed'
    conditions JSONB,                     -- optional: {"field": "amount", "op": "gt", "value": 1000}
    target_ids UUID[] NOT NULL,           -- array of delivery_target IDs
    dead_letter_endpoint_id UUID,         -- per-fanout dead letter target
    enabled BOOL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast pattern matching per customer
CREATE INDEX IF NOT EXISTS idx_fanout_rules_customer
    ON fanout_rules (customer_id);

-- ============================================================================
-- WebSocket Subscriptions
-- Tracks active WebSocket connections and their event type subscriptions.
-- Used for the real-time gateway to filter and route events to connected
-- clients.
-- ============================================================================
CREATE TABLE IF NOT EXISTS ws_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    connection_id STRING NOT NULL UNIQUE,
    event_filters TEXT[] NOT NULL,        -- ['order.*', 'payment.completed']
    last_heartbeat TIMESTAMPTZ DEFAULT now(),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup by customer
CREATE INDEX IF NOT EXISTS idx_ws_subscriptions_customer
    ON ws_subscriptions (customer_id);

-- Index for cleanup of stale connections
CREATE INDEX IF NOT EXISTS idx_ws_subscriptions_heartbeat
    ON ws_subscriptions (last_heartbeat);
