ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS throttle_rate INT;
        ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS throttle_period_secs INT DEFAULT 60;
        ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS throttle_strategy TEXT DEFAULT 'sliding_window';
