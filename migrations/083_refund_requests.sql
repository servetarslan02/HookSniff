-- 083: Refund requests with category and admin approval flow
-- Customers submit refund requests → admin reviews → approve/deny

CREATE TABLE IF NOT EXISTS refund_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Request details
    category TEXT NOT NULL DEFAULT 'other',
    -- Categories: accidental_purchase, not_satisfied, missing_features, 
    --             technical_issues, billing_error, other
    description TEXT NOT NULL DEFAULT '',
    
    -- Associated invoice
    invoice_id UUID REFERENCES invoices(id),
    amount_cents BIGINT NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'USD',
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'pending',
    -- Statuses: pending, approved, denied, processed
    
    -- Admin review
    reviewed_by UUID REFERENCES customers(id),
    reviewed_at TIMESTAMPTZ,
    admin_notes TEXT,
    
    -- Refund result (populated when processed)
    refund_id UUID REFERENCES refunds(id),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for admin to quickly find pending requests
CREATE INDEX idx_refund_requests_status ON refund_requests(status) WHERE status = 'pending';
CREATE INDEX idx_refund_requests_customer ON refund_requests(customer_id);

-- Enable RLS
ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;
