-- Migration 019: Admin Panel Upgrade — Yeni tablolar
-- Aşama 0: Veritabanı Hazırlığı
-- 5 yeni tablo: refunds, customer_notes, customer_tags, communication_history, rate_limit_violations

-- 1. Refund tracking — iade kayıtları
CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    amount_cents BIGINT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    reason TEXT,
    admin_user_id UUID,
    provider TEXT NOT NULL DEFAULT 'polar',
    provider_refund_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_refunds_customer ON refunds(customer_id);
CREATE INDEX IF NOT EXISTS idx_refunds_created ON refunds(created_at DESC);

-- 2. Customer notes — admin müşteri notları
CREATE TABLE IF NOT EXISTS customer_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    admin_user_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_notes_customer ON customer_notes(customer_id);

-- 3. Customer tags — müşteri etiketleri (VIP, at-risk, enterprise-ready vb.)
CREATE TABLE IF NOT EXISTS customer_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    admin_user_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(customer_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_customer_tags_customer ON customer_tags(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_tags_tag ON customer_tags(tag);

-- 4. Communication history — otomatik iletişim geçmişi kaydı
CREATE TABLE IF NOT EXISTS communication_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- email, impersonate, refund, plan_change, ban, gdpr_export, gdpr_delete
    subject TEXT,
    details JSONB,
    admin_user_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comm_history_customer ON communication_history(customer_id);
CREATE INDEX IF NOT EXISTS idx_comm_history_type ON communication_history(type);
CREATE INDEX IF NOT EXISTS idx_comm_history_created ON communication_history(created_at DESC);

-- 5. Rate limit violations — ihlal log'ları
CREATE TABLE IF NOT EXISTS rate_limit_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    endpoint_id UUID REFERENCES endpoints(id) ON DELETE SET NULL,
    ip TEXT,
    requests_count INT NOT NULL,
    limit_per_window INT NOT NULL,
    window_seconds INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rl_violations_created ON rate_limit_violations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rl_violations_customer ON rate_limit_violations(customer_id);
