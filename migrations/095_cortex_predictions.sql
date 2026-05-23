-- Cortex Stage 7: Predictive engine — failure probability and capacity forecast
CREATE TABLE IF NOT EXISTS predictions (
    id BIGSERIAL PRIMARY KEY,
    endpoint_id UUID NOT NULL,
    customer_id UUID,
    prediction_type VARCHAR(30) NOT NULL,
    probability FLOAT NOT NULL,
    factors JSONB DEFAULT '{}',
    time_horizon_mins INT DEFAULT 60,
    created_at TIMESTAMPTZ DEFAULT now(),
    validated_at TIMESTAMPTZ,
    was_correct BOOLEAN
);

CREATE INDEX IF NOT EXISTS idx_prediction_endpoint ON predictions(endpoint_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prediction_high ON predictions(probability DESC) WHERE probability > 0.7;
