-- Environment support: dev/staging/prod environments per customer

CREATE TABLE IF NOT EXISTS environments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) NOT NULL,
    description TEXT,
    is_default BOOLEAN NOT NULL DEFAULT false,
    color VARCHAR(7),           -- hex color for UI (e.g. #22c55e)
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT environments_customer_slug_unique UNIQUE (customer_id, slug),
    CONSTRAINT environments_slug_format CHECK (slug ~ '^[a-z0-9][a-z0-9\-]*[a-z0-9]$')
);

-- Index for fast lookup by customer
CREATE INDEX idx_environments_customer_id ON environments(customer_id);

-- Auto-create default environment for existing customers (optional, can be run manually)
-- INSERT INTO environments (customer_id, name, slug, is_default, color)
-- SELECT id, 'Production', 'production', true, '#22c55e' FROM customers;
