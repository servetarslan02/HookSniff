CREATE TABLE IF NOT EXISTS invoices (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            amount_cents INT NOT NULL DEFAULT 0,
            currency TEXT NOT NULL DEFAULT 'usd',
            plan TEXT NOT NULL DEFAULT 'free',
            status TEXT NOT NULL DEFAULT 'paid',
            provider TEXT NOT NULL DEFAULT 'stripe',
            provider_invoice_id TEXT,
            paid_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
