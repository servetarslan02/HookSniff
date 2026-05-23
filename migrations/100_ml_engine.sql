-- ML Engine: Learned parameters per endpoint
-- Stores EWMA states, anomaly thresholds, bandit weights, forecasting params
CREATE TABLE IF NOT EXISTS ml_models (
    id BIGSERIAL PRIMARY KEY,
    endpoint_id UUID NOT NULL,
    model_type VARCHAR(50) NOT NULL,
    parameters JSONB NOT NULL DEFAULT '{}',
    training_samples INT DEFAULT 0,
    last_trained TIMESTAMPTZ,
    accuracy FLOAT DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(endpoint_id, model_type)
);

CREATE INDEX IF NOT EXISTS idx_ml_models_endpoint ON ml_models(endpoint_id);
CREATE INDEX IF NOT EXISTS idx_ml_models_type ON ml_models(model_type, updated_at DESC);

-- ML: Feature vectors for contextual bandit
CREATE TABLE IF NOT EXISTS ml_features (
    id BIGSERIAL PRIMARY KEY,
    endpoint_id UUID NOT NULL,
    feature_name VARCHAR(100) NOT NULL,
    feature_value FLOAT NOT NULL,
    context_hash VARCHAR(64),
    recorded_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ml_features_endpoint ON ml_features(endpoint_id, recorded_at DESC);

-- ML: Decision log for bandit learning
CREATE TABLE IF NOT EXISTS ml_decisions (
    id BIGSERIAL PRIMARY KEY,
    endpoint_id UUID NOT NULL,
    decision_type VARCHAR(50) NOT NULL,
    chosen_action VARCHAR(100) NOT NULL,
    context JSONB DEFAULT '{}',
    reward FLOAT,
    regret FLOAT,
    confidence FLOAT,
    created_at TIMESTAMPTZ DEFAULT now(),
    evaluated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ml_decisions_endpoint ON ml_decisions(endpoint_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ml_decisions_type ON ml_decisions(decision_type, created_at DESC);

-- ML: Anomaly detection results (separate from simple anomaly_scores)
CREATE TABLE IF NOT EXISTS ml_anomalies (
    id BIGSERIAL PRIMARY KEY,
    endpoint_id UUID NOT NULL,
    detection_method VARCHAR(50) NOT NULL,
    anomaly_score FLOAT NOT NULL,
    is_anomaly BOOLEAN NOT NULL,
    features JSONB NOT NULL,
    threshold_used FLOAT,
    confidence FLOAT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ml_anomalies_endpoint ON ml_anomalies(endpoint_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ml_anomalies_flagged ON ml_anomalies(is_anomaly, created_at DESC) WHERE is_anomaly = true;
