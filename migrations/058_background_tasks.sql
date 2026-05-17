-- Background tasks: async task tracking per customer
-- Tasks are created by the system (e.g. bulk replay, bulk retry) and can be polled for status.

CREATE TABLE IF NOT EXISTS background_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    task_type VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    data JSONB,
    result JSONB,
    error TEXT,
    progress SMALLINT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    CONSTRAINT bg_tasks_status_check CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled'))
);

CREATE INDEX idx_bg_tasks_customer_id ON background_tasks(customer_id);
CREATE INDEX idx_bg_tasks_status ON background_tasks(customer_id, status);
CREATE INDEX idx_bg_tasks_created_at ON background_tasks(customer_id, created_at DESC);
