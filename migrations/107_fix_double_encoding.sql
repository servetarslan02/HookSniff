-- Migration 107: Fix double UTF-8 encoding in notifications
-- 
-- Problem: Turkish characters like ş (U+015F, UTF-8: C5 9F) were double-encoded:
--   C5 9F → interpreted as Latin-1 (U+00C5, U+009F) → stored as C3 85 C2 9F
-- 
-- Fix: convert_from(convert_to(col, 'LATIN1'), 'UTF8') reverses the double encoding:
--   1. convert_to(col, 'LATIN1'): UTF-8 string → decode to codepoints → encode as LATIN1 bytes
--   2. convert_from(..., 'UTF8'): LATIN1 bytes → decode as UTF-8 → correct string
--
-- Only fix rows that contain the double-encoded pattern (C3 85 = Å in UTF-8 = 0xC5 in Latin-1)

-- Fix notifications table
UPDATE notifications
SET 
  title = convert_from(convert_to(title, 'LATIN1'), 'UTF8'),
  message = convert_from(convert_to(message, 'LATIN1'), 'UTF8')
WHERE title LIKE '%Å%' 
   OR title LIKE '%Ä%'
   OR title LIKE '%Ö%'
   OR title LIKE '%Ü%'
   OR title LIKE '%Ð%'
   OR title LIKE '%Ñ%'
   OR message LIKE '%Å%' 
   OR message LIKE '%Ä%'
   OR message LIKE '%Ö%'
   OR message LIKE '%Ü%'
   OR message LIKE '%Ð%'
   OR message LIKE '%Ñ%';

-- Fix broadcasts table (if affected)
UPDATE broadcasts
SET 
  title = convert_from(convert_to(title, 'LATIN1'), 'UTF8'),
  message = convert_from(convert_to(message, 'LATIN1'), 'UTF8')
WHERE title LIKE '%Å%' 
   OR title LIKE '%Ä%'
   OR title LIKE '%Ö%'
   OR title LIKE '%Ü%'
   OR message LIKE '%Å%' 
   OR message LIKE '%Ä%'
   OR message LIKE '%Ö%'
   OR message LIKE '%Ü%';

-- Fix security_events table (if affected)
UPDATE security_events
SET 
  event = convert_from(convert_to(event, 'LATIN1'), 'UTF8')
WHERE event LIKE '%Å%' 
   OR event LIKE '%Ä%'
   OR event LIKE '%Ö%'
   OR event LIKE '%Ü%';

-- Fix alert_rules table (if affected)
UPDATE alert_rules
SET name = convert_from(convert_to(name, 'LATIN1'), 'UTF8')
WHERE name LIKE '%Å%' 
   OR name LIKE '%Ä%'
   OR name LIKE '%Ö%'
   OR name LIKE '%Ü%';

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Migration 107: Double encoding fix completed';
END $$;
