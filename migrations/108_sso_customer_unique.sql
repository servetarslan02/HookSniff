-- Migration 108: Re-add partial unique constraint on sso_configs.customer_id
-- Migration 082 dropped sso_configs_customer_id_key to support multi-team SSO,
-- but the customer-only upsert (WHERE team_id IS NULL) still uses ON CONFLICT (customer_id).
-- A partial unique index restores the constraint only for customer-level configs.

CREATE UNIQUE INDEX IF NOT EXISTS uq_sso_configs_customer_no_team
    ON sso_configs (customer_id)
    WHERE team_id IS NULL;
