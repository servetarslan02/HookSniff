-- Migration 090: ML Quality Tracking + Proactive Healing + Healing A/B Tables
-- Run on Neon DB

-- ============================================================
-- 1. ML Model Quality Tracking
-- ============================================================

CREATE TABLE IF NOT EXISTS ml_model_quality (
    id BIGSERIAL PRIMARY KEY,
    endpoint_id UUID NOT NULL,
    model_type VARCHAR(64) NOT NULL,
    predicted_value DOUBLE PRECISION NOT NULL,
    actual_value DOUBLE PRECISION NOT NULL,
    absolute_error DOUBLE PRECISION NOT NULL,
    error_pct DOUBLE PRECISION NOT NULL,
    within_tolerance BOOLEAN NOT NULL DEFAULT false,
    measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ml_quality_endpoint_type 
    ON ml_model_quality (endpoint_id, model_type, measured_at DESC);

CREATE INDEX IF NOT EXISTS idx_ml_quality_recent 
    ON ml_model_quality (measured_at DESC);

-- Model reset history
CREATE TABLE IF NOT EXISTS ml_model_resets (
    id BIGSERIAL PRIMARY KEY,
    endpoint_id UUID NOT NULL,
    model_type VARCHAR(64) NOT NULL,
    reason VARCHAR(64) NOT NULL,
    quality_score DOUBLE PRECISION,
    reset_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ml_resets_endpoint 
    ON ml_model_resets (endpoint_id, reset_at DESC);

-- ============================================================
-- 2. Proactive Healing — new lock ID
-- ============================================================

-- cortex_proactive → 9012, cortex_ml_quality → 9013
-- (already handled in code via mod.rs advisory lock map)

-- ============================================================
-- 3. Healing Strategy Tracking (A/B testing outcomes)
-- ============================================================

-- Add strategy tracking columns to healing_actions if not exists
ALTER TABLE healing_actions 
    ADD COLUMN IF NOT EXISTS strategy_bandit_version VARCHAR(32);

ALTER TABLE healing_actions
    ADD COLUMN IF NOT EXISTS outcome_score DOUBLE PRECISION;

-- Index for strategy performance analysis
CREATE INDEX IF NOT EXISTS idx_healing_actions_strategy 
    ON healing_actions (action_type, outcome, created_at DESC);
