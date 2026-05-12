-- Migration 046: webhook_limit BIGINT for enterprise plan (i64::MAX support)
-- INT max = 2,147,483,647 — enterprise plan needs 9,223,372,036,854,775,807
ALTER TABLE customers ALTER COLUMN webhook_limit TYPE BIGINT;
