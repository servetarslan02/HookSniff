-- Migration 081: Coupon codes table for admin-managed discounts
-- Two types: 'polar' (synced to Polar.sh) and 'internal' (applied directly)

CREATE TABLE IF NOT EXISTS coupon_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(64) NOT NULL UNIQUE,
    type VARCHAR(16) NOT NULL CHECK (type IN ('polar', 'internal')),
    discount_type VARCHAR(16) NOT NULL CHECK (discount_type IN ('percentage', 'free_month')),
    discount_value INTEGER NOT NULL DEFAULT 0,
    -- For percentage: 0-100. For free_month: number of free months (usually 1)
    target_plan VARCHAR(32),
    -- NULL = works for all plans, otherwise specific plan name
    polar_discount_id VARCHAR(128),
    -- Polar.sh discount ID (only for type='polar')
    max_redemptions INTEGER,
    -- NULL = unlimited
    redemption_count INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES customers(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coupon_codes_code ON coupon_codes(UPPER(code));
CREATE INDEX idx_coupon_codes_type ON coupon_codes(type);
CREATE INDEX idx_coupon_codes_active ON coupon_codes(is_active) WHERE is_active = true;

-- Track coupon usage per customer
CREATE TABLE IF NOT EXISTS coupon_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES coupon_codes(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(coupon_id, customer_id)
);

CREATE INDEX idx_coupon_redemptions_customer ON coupon_redemptions(customer_id);
