-- Broadcast system for global announcements (maintenance, features, incidents)
-- Admin creates broadcasts → all users see them in notification bell + dashboard banner

CREATE TABLE IF NOT EXISTS broadcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    broadcast_type VARCHAR(50) NOT NULL DEFAULT 'announcement', -- maintenance, feature, announcement, incident
    severity VARCHAR(20) NOT NULL DEFAULT 'info',               -- info, warning, critical
    link VARCHAR(500),                                           -- optional CTA link
    link_text VARCHAR(100),                                      -- optional CTA button text
    target_plan VARCHAR(50),                                     -- NULL = all plans, or 'free','pro','enterprise'
    is_active BOOLEAN NOT NULL DEFAULT true,
    starts_at TIMESTAMPTZ,                                       -- NULL = immediate
    expires_at TIMESTAMPTZ,                                      -- NULL = never expires
    created_by UUID REFERENCES customers(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_broadcasts_active ON broadcasts(is_active, starts_at, expires_at);
CREATE INDEX IF NOT EXISTS idx_broadcasts_type ON broadcasts(broadcast_type);

-- Track which users dismissed which broadcasts (hide banner)
CREATE TABLE IF NOT EXISTS broadcast_dismissals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    broadcast_id UUID NOT NULL REFERENCES broadcasts(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    dismissed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(broadcast_id, customer_id)
);

CREATE INDEX IF NOT EXISTS idx_broadcast_dismissals_customer ON broadcast_dismissals(customer_id);
