-- Cortex ML: Phases 2-10 Database Tables
-- Model Monitoring, Distributed Tracing, Feature Store, Model Versioning,
-- Chaos Engineering, A/B Testing, AutoML

-- ── Phase 2: Model Monitoring ────────────────────────────────────
-- ml_prediction_outcomes tablosu quality_tracker modülünde zaten var
-- Eksik sütunları ekleyelim

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ml_prediction_outcomes' AND column_name = 'predicted_anomaly') THEN
        ALTER TABLE ml_prediction_outcomes ADD COLUMN predicted_anomaly BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ml_prediction_outcomes' AND column_name = 'actual_anomaly') THEN
        ALTER TABLE ml_prediction_outcomes ADD COLUMN actual_anomaly BOOLEAN DEFAULT false;
    END IF;
END $$;

-- ── Phase 4: Distributed Tracing ────────────────────────────────
CREATE TABLE IF NOT EXISTS cortex_traces (
    id BIGSERIAL PRIMARY KEY,
    run_id VARCHAR(64) NOT NULL,
    stage_name VARCHAR(64) NOT NULL,
    duration_ms BIGINT NOT NULL DEFAULT 0,
    items_processed BIGINT NOT NULL DEFAULT 0,
    status VARCHAR(16) NOT NULL DEFAULT 'success',
    error_message TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cortex_traces_stage ON cortex_traces (stage_name, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_cortex_traces_run ON cortex_traces (run_id);
CREATE INDEX IF NOT EXISTS idx_cortex_traces_created ON cortex_traces (completed_at);

-- ── Phase 5: Feature Store ──────────────────────────────────────
-- Feature store primarily uses in-memory cache + DB (ml_features tablosu zaten var)

-- ── Phase 6: Model Versioning ───────────────────────────────────
CREATE TABLE IF NOT EXISTS ml_model_versions (
    id BIGSERIAL PRIMARY KEY,
    endpoint_id UUID NOT NULL REFERENCES endpoints(id) ON DELETE CASCADE,
    model_type VARCHAR(64) NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    parameters JSONB NOT NULL DEFAULT '{}',
    training_samples INTEGER NOT NULL DEFAULT 0,
    reason VARCHAR(64) NOT NULL DEFAULT 'manual',
    performance_snapshot JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ml_model_versions_unique
    ON ml_model_versions (endpoint_id, model_type, version);
CREATE INDEX IF NOT EXISTS idx_ml_model_versions_active
    ON ml_model_versions (endpoint_id, model_type) WHERE is_active = true;

-- ── Phase 8: Chaos Engineering ──────────────────────────────────
CREATE TABLE IF NOT EXISTS chaos_tests (
    id BIGSERIAL PRIMARY KEY,
    scenario VARCHAR(64) NOT NULL,
    target VARCHAR(128) NOT NULL DEFAULT 'platform',
    severity VARCHAR(16) NOT NULL DEFAULT 'low',
    duration_secs INTEGER NOT NULL DEFAULT 0,
    result JSONB NOT NULL DEFAULT '{}',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_chaos_tests_scenario ON chaos_tests (scenario, started_at DESC);

-- ── Phase 9: A/B Testing ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ab_tests (
    id BIGSERIAL PRIMARY KEY,
    endpoint_id UUID NOT NULL REFERENCES endpoints(id) ON DELETE CASCADE,
    model_type VARCHAR(64) NOT NULL,
    variant_a VARCHAR(128) NOT NULL,
    variant_b VARCHAR(128) NOT NULL,
    split_ratio DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    metric VARCHAR(32) NOT NULL DEFAULT 'accuracy',
    status VARCHAR(16) NOT NULL DEFAULT 'running',
    winner VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ab_tests_endpoint ON ab_tests (endpoint_id, status);

CREATE TABLE IF NOT EXISTS ab_test_decisions (
    id BIGSERIAL PRIMARY KEY,
    test_id BIGINT NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
    variant VARCHAR(8) NOT NULL,
    reward DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    latency_ms DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ab_test_decisions_test ON ab_test_decisions (test_id, variant);

-- ── Phase 10: AutoML ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS automl_trials (
    id BIGSERIAL PRIMARY KEY,
    endpoint_id UUID NOT NULL REFERENCES endpoints(id) ON DELETE CASCADE,
    model_type VARCHAR(64) NOT NULL,
    params JSONB NOT NULL DEFAULT '{}',
    score DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    metric VARCHAR(32) NOT NULL DEFAULT 'quality_score',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automl_trials_endpoint ON automl_trials (endpoint_id, model_type, score DESC);

-- ── Retention: Eski kayıtları temizle (90 gün) ─────────────────
CREATE OR REPLACE FUNCTION cleanup_old_cortex_data()
RETURNS void AS $$
BEGIN
    DELETE FROM cortex_traces WHERE completed_at < NOW() - INTERVAL '90 days';
    DELETE FROM ml_drift_events WHERE created_at < NOW() - INTERVAL '180 days';
    DELETE FROM chaos_tests WHERE started_at < NOW() - INTERVAL '90 days';
    DELETE FROM ab_test_decisions WHERE created_at < NOW() - INTERVAL '90 days';
    DELETE FROM automl_trials WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE cortex_traces IS 'Phase 4: Cortex stage execution traces';
COMMENT ON TABLE ml_model_versions IS 'Phase 6: ML model version history for rollback';
COMMENT ON TABLE chaos_tests IS 'Phase 8: Chaos engineering test results';
COMMENT ON TABLE ab_tests IS 'Phase 9: A/B test configurations';
COMMENT ON TABLE ab_test_decisions IS 'Phase 9: A/B test decision records';
COMMENT ON TABLE automl_trials IS 'Phase 10: AutoML optimization trials';
