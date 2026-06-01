-- Cortex ML: Drift Detection Events
-- Faz 1: Concept Drift Detection
-- Page-Hinkley + ADWIN + KS test sonuçlarını kaydeder

CREATE TABLE IF NOT EXISTS ml_drift_events (
    id BIGSERIAL PRIMARY KEY,
    endpoint_id UUID NOT NULL REFERENCES endpoints(id) ON DELETE CASCADE,
    drift_type VARCHAR(32) NOT NULL DEFAULT 'none',
    severity DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    features_affected JSONB NOT NULL DEFAULT '[]',
    detected_by JSONB NOT NULL DEFAULT '[]',
    recommended_action VARCHAR(64) NOT NULL DEFAULT 'monitor',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index: endpoint bazlı drift history
CREATE INDEX IF NOT EXISTS idx_ml_drift_events_endpoint
    ON ml_drift_events (endpoint_id, created_at DESC);

-- Index: severity bazlı filtreleme
CREATE INDEX IF NOT EXISTS idx_ml_drift_events_severity
    ON ml_drift_events (severity DESC, created_at DESC);

-- Index: zaman bazlı temizlik
CREATE INDEX IF NOT EXISTS idx_ml_drift_events_created
    ON ml_drift_events (created_at);

COMMENT ON TABLE ml_drift_events IS 'ML drift detection events — Page-Hinkley, ADWIN, KS test results';
COMMENT ON COLUMN ml_drift_events.drift_type IS 'sudden, gradual, incremental, data_quality, none';
COMMENT ON COLUMN ml_drift_events.severity IS '0.0-1.0 drift ciddiyeti';
COMMENT ON COLUMN ml_drift_events.recommended_action IS 'immediate_retrain, schedule_retrain, monitor';
