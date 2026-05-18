-- 2FA Backup Codes table (missing from 033_totp_2fa.sql)
CREATE TABLE IF NOT EXISTS tfa_backup_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL,
    used BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tfa_backup_codes_customer ON tfa_backup_codes(customer_id);
CREATE INDEX IF NOT EXISTS idx_tfa_backup_codes_unused ON tfa_backup_codes(customer_id) WHERE used = false;
