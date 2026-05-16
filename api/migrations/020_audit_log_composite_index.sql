-- Migration 020: Composite index for audit log admin query pattern
-- Admin page queries: WHERE action = $1 ORDER BY created_at DESC LIMIT/OFFSET
-- This composite index covers both filter + sort in one scan

CREATE INDEX IF NOT EXISTS idx_audit_log_action_created 
    ON audit_log(action, created_at DESC);

-- Also add composite for customer_id + created_at (user detail audit view)
CREATE INDEX IF NOT EXISTS idx_audit_log_customer_created 
    ON audit_log(customer_id, created_at DESC);
