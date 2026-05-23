-- Cortex Stage 8: Insights — weekly reports, customer health, recommendations
CREATE TABLE IF NOT EXISTS cortex_insights (
    id BIGSERIAL PRIMARY KEY,
    customer_id UUID,
    insight_type VARCHAR(30) NOT NULL,
    title VARCHAR(200) NOT NULL,
    body TEXT,
    severity VARCHAR(20) DEFAULT 'info',
    action_url VARCHAR(500),
    data JSONB DEFAULT '{}',
    dismissed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_insights_customer ON cortex_insights(customer_id, created_at DESC) WHERE dismissed = false;
CREATE INDEX IF NOT EXISTS idx_insights_type ON cortex_insights(insight_type, created_at DESC);

-- Weekly report storage
CREATE TABLE IF NOT EXISTS weekly_reports (
    id BIGSERIAL PRIMARY KEY,
    customer_id UUID NOT NULL,
    week_start DATE NOT NULL,
    report JSONB NOT NULL,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(customer_id, week_start)
);
