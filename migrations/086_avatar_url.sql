-- Add avatar_url column to customers for OAuth profile pictures
ALTER TABLE customers ADD COLUMN IF NOT EXISTS avatar_url TEXT;
