-- Migration 040: ON DELETE behavior fixes (Items 177-181)
-- Fix missing ON DELETE CASCADE on existing foreign keys

-- dead_letters.endpoint_id: CASCADE when endpoint is deleted
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dead_letters_endpoint_id_fkey') THEN
        ALTER TABLE dead_letters DROP CONSTRAINT dead_letters_endpoint_id_fkey;
    END IF;
END $$;
ALTER TABLE dead_letters
    ADD CONSTRAINT fk_dead_letters_endpoint
    FOREIGN KEY (endpoint_id) REFERENCES endpoints(id) ON DELETE CASCADE;

-- dead_letters.customer_id: CASCADE when customer is deleted
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dead_letters_customer_id_fkey') THEN
        ALTER TABLE dead_letters DROP CONSTRAINT dead_letters_customer_id_fkey;
    END IF;
END $$;
ALTER TABLE dead_letters
    ADD CONSTRAINT fk_dead_letters_customer
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;

-- teams.owner_id: CASCADE when owner customer is deleted
-- (owner_id is NOT NULL, so SET NULL is not possible)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'teams_owner_id_fkey') THEN
        ALTER TABLE teams DROP CONSTRAINT teams_owner_id_fkey;
    END IF;
END $$;
ALTER TABLE teams
    ADD CONSTRAINT fk_teams_owner
    FOREIGN KEY (owner_id) REFERENCES customers(id) ON DELETE CASCADE;

-- installed_agents.customer_id: CASCADE when customer is deleted
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'installed_agents_customer_id_fkey') THEN
        ALTER TABLE installed_agents DROP CONSTRAINT installed_agents_customer_id_fkey;
    END IF;
END $$;
ALTER TABLE installed_agents
    ADD CONSTRAINT fk_installed_agents_customer
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;

-- installed_agents.agent_id: CASCADE when marketplace agent is removed
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'installed_agents_agent_id_fkey') THEN
        ALTER TABLE installed_agents DROP CONSTRAINT installed_agents_agent_id_fkey;
    END IF;
END $$;
ALTER TABLE installed_agents
    ADD CONSTRAINT fk_installed_agents_agent
    FOREIGN KEY (agent_id) REFERENCES marketplace_agents(id) ON DELETE CASCADE;
