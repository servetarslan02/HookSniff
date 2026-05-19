-- 071: Email change verification codes
CREATE TABLE IF NOT EXISTS email_change_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    new_email TEXT NOT NULL,
    code_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    attempts INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_change_codes_customer ON email_change_codes(customer_id);
CREATE INDEX IF NOT EXISTS idx_email_change_codes_expires ON email_change_codes(expires_at);
