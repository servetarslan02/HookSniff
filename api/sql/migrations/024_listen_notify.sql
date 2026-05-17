CREATE OR REPLACE FUNCTION notify_new_webhook()
        RETURNS TRIGGER AS $$
        BEGIN
            IF NEW.status = 'pending' THEN
                PERFORM pg_notify('new_webhook', NEW.id::text);
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS trg_notify_new_webhook ON webhook_queue;

        CREATE TRIGGER trg_notify_new_webhook
            AFTER INSERT ON webhook_queue
            FOR EACH ROW
            EXECUTE FUNCTION notify_new_webhook();
