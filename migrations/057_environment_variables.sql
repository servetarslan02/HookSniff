-- Environment variables: key-value pairs scoped to an environment

CREATE TABLE IF NOT EXISTS environment_variables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    environment_id UUID NOT NULL REFERENCES environments(id) ON DELETE CASCADE,
    key VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    is_secret BOOLEAN NOT NULL DEFAULT false,  -- if true, value is masked in responses
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT env_vars_unique_key UNIQUE (environment_id, key)
);

-- Index for fast lookup by environment
CREATE INDEX idx_env_vars_environment_id ON environment_variables(environment_id);

-- Index for key lookup within an environment
CREATE INDEX idx_env_vars_key ON environment_variables(environment_id, key);
