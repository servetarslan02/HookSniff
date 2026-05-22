-- Migration 088: RBAC Enhancements — Permission Cache, Role Rate Limits
--
-- Adds:
-- 1. permission_cache: Cache user permissions for performance
-- 2. role_rate_limits: Different rate limits per role
-- 3. role_audit_log: Detailed RBAC audit trail

-- Step 1: Permission cache table
CREATE TABLE IF NOT EXISTS permission_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    permissions JSONB NOT NULL DEFAULT '{}',
    cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '5 minutes',
    UNIQUE(customer_id, team_id)
);

CREATE INDEX IF NOT EXISTS idx_permission_cache_customer ON permission_cache(customer_id);
CREATE INDEX IF NOT EXISTS idx_permission_cache_expires ON permission_cache(expires_at);

-- Step 2: Role-based rate limits
CREATE TABLE IF NOT EXISTS role_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    requests_per_minute INTEGER NOT NULL DEFAULT 60,
    requests_per_hour INTEGER NOT NULL DEFAULT 1000,
    burst_size INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(team_id, role)
);

CREATE INDEX IF NOT EXISTS idx_role_rate_limits_team ON role_rate_limits(team_id);

-- Step 3: RBAC audit log (detailed)
CREATE TABLE IF NOT EXISTS rbac_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NOT NULL REFERENCES customers(id) ON DELETE SET NULL,
    target_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,         -- 'role_change', 'permission_grant', 'permission_revoke', 'team_join', 'team_leave'
    old_value JSONB DEFAULT '{}',
    new_value JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rbac_audit_actor ON rbac_audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_rbac_audit_target ON rbac_audit_log(target_id);
CREATE INDEX IF NOT EXISTS idx_rbac_audit_team ON rbac_audit_log(team_id);
CREATE INDEX IF NOT EXISTS idx_rbac_audit_action ON rbac_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_rbac_audit_created ON rbac_audit_log(created_at);

-- Step 4: Insert default rate limits for each role
INSERT INTO role_rate_limits (team_id, role, requests_per_minute, requests_per_hour, burst_size)
SELECT t.id, r.role, 
  CASE r.role
    WHEN 'owner' THEN 120
    WHEN 'admin' THEN 100
    WHEN 'developer' THEN 80
    WHEN 'analyst' THEN 60
    WHEN 'viewer' THEN 30
  END,
  CASE r.role
    WHEN 'owner' THEN 5000
    WHEN 'admin' THEN 3000
    WHEN 'developer' THEN 2000
    WHEN 'analyst' THEN 1000
    WHEN 'viewer' THEN 500
  END,
  CASE r.role
    WHEN 'owner' THEN 20
    WHEN 'admin' THEN 15
    WHEN 'developer' THEN 10
    WHEN 'analyst' THEN 8
    WHEN 'viewer' THEN 5
  END
FROM teams t
CROSS JOIN (VALUES ('owner'), ('admin'), ('developer'), ('analyst'), ('viewer')) AS r(role)
ON CONFLICT (team_id, role) DO NOTHING;
