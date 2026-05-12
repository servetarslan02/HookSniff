-- Add role column to customers table (RBAC)
-- Default: 'admin' for existing admin users, 'member' for others
ALTER TABLE customers ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'member';

-- Set admin users to 'admin' role
UPDATE customers SET role = 'admin' WHERE is_admin = true;
