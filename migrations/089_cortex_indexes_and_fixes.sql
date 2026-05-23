-- Migration 089: Cortex Performance & Data Quality Fixes
-- Run on Neon DB: psql <connection_string> -f 089_cortex_indexes_and_fixes.sql

-- ============================================================
-- 1. PERFORMANCE INDEXES
-- ============================================================

-- Anomaly scores: healing engine + dashboard queries use this pattern heavily
CREATE INDEX IF NOT EXISTS idx_anomaly_scores_endpoint_created 
    ON anomaly_scores (endpoint_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_anomaly_scores_score_created 
    ON anomaly_scores (score DESC, created_at DESC) 
    WHERE score > 70;

-- Cortex action history: action memory lookups per endpoint
CREATE INDEX IF NOT EXISTS idx_cortex_action_history_endpoint_outcome 
    ON cortex_action_history (endpoint_id, outcome, created_at DESC);

-- Predictions: dashboard listing + per-endpoint queries
CREATE INDEX IF NOT EXISTS idx_predictions_endpoint_created 
    ON predictions (endpoint_id, created_at DESC);

-- Insights: active insights query (WHERE dismissed = false)
CREATE INDEX IF NOT EXISTS idx_cortex_insights_active 
    ON cortex_insights (customer_id, dismissed, created_at DESC) 
    WHERE dismissed = false;

-- Healing actions: per-endpoint lookups
CREATE INDEX IF NOT EXISTS idx_healing_actions_endpoint_created 
    ON healing_actions (endpoint_id, created_at DESC);

-- Recovery surges: active surge lookup
CREATE INDEX IF NOT EXISTS idx_recovery_surges_active 
    ON recovery_surges (endpoint_id, status, started_at DESC) 
    WHERE status = 'active';

-- Endpoint strategy weights: best strategy lookup
CREATE INDEX IF NOT EXISTS idx_strategy_weights_endpoint_weight 
    ON endpoint_strategy_weights (endpoint_id, weight DESC);

-- Alert correlations: active correlation lookup
CREATE INDEX IF NOT EXISTS idx_alert_correlations_active 
    ON alert_correlations (resolved, last_seen DESC) 
    WHERE resolved = false;

-- Weekly reports: unique constraint for upsert
CREATE UNIQUE INDEX IF NOT EXISTS idx_weekly_reports_customer_week 
    ON weekly_reports (customer_id, week_start);

-- ============================================================
-- 2. UNIQUE CONSTRAINT: Prevent duplicate insights (same type, same endpoint)
-- ============================================================

-- Partial unique index using created_at comparison (immutable-safe)
-- Note: application-level check (24h dedup in insights_engine.rs) handles time window
CREATE UNIQUE INDEX IF NOT EXISTS idx_cortex_insights_no_duplicates 
    ON cortex_insights (customer_id, insight_type, (data->>'endpoint_id'))
    WHERE dismissed = false;

-- ============================================================
-- 3. Add R² column to predictions for confidence tracking
-- ============================================================

ALTER TABLE predictions 
    ADD COLUMN IF NOT EXISTS confidence_r2 FLOAT DEFAULT 0.0;

-- ============================================================
-- 4. Add root_cause_detail to alert_correlations
-- ============================================================

ALTER TABLE alert_correlations 
    ADD COLUMN IF NOT EXISTS root_cause_detail JSONB DEFAULT '{}';
