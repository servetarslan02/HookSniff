-- 011_listen_notify.sql
-- PostgreSQL LISTEN/NOTIFY support for webhook_queue
--
-- When a new webhook is inserted with status='pending',
-- NOTIFY 'new_webhook' wakes the worker immediately
-- instead of waiting for the next 1s poll cycle.

-- Trigger function: fire NOTIFY when a pending webhook is inserted
CREATE OR REPLACE FUNCTION notify_new_webhook()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'pending' THEN
        PERFORM pg_notify('new_webhook', NEW.id::text);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on INSERT to webhook_queue
DROP TRIGGER IF EXISTS trg_notify_new_webhook ON webhook_queue;

CREATE TRIGGER trg_notify_new_webhook
    AFTER INSERT ON webhook_queue
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_webhook();
