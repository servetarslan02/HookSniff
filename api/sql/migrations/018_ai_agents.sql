CREATE TABLE IF NOT EXISTS ai_agents (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            enabled BOOL NOT NULL DEFAULT true,
            config JSONB,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS ai_agent_executions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
            delivery_id UUID,
            customer_id UUID,
            trigger_reason TEXT,
            actions_taken JSONB,
            confidence_score DOUBLE PRECISION,
            ai_provider TEXT,
            latency_ms INT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_ai_agent_executions_agent
            ON ai_agent_executions(agent_id);
        CREATE INDEX IF NOT EXISTS idx_ai_agent_executions_customer
            ON ai_agent_executions(customer_id);

        CREATE TABLE IF NOT EXISTS ai_agent_configs (
            customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
            enabled BOOL NOT NULL DEFAULT true,
            config JSONB,
            PRIMARY KEY (customer_id, agent_id)
        );
