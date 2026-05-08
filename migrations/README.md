# HookSniff Database Migrations

## Migration History

Migrations 013–025 were removed during a major schema consolidation (2026-05).
The changes from those migrations were squash-merged into migration 026.

If you're setting up a fresh database, run all migrations in order (001 → 029).
The gap is intentional and does not affect functionality.

## Running Migrations

```bash
# Apply all pending migrations
psql $DATABASE_URL -f migrations/001_initial.sql
psql $DATABASE_URL -f migrations/002_security_features.sql
# ... and so on
```
